package com.roadaccident.service;

import com.roadaccident.dto.HotspotAnalysisRequestDto;
import com.roadaccident.entity.Accident;
import com.roadaccident.entity.Hotspot;
import com.roadaccident.exception.ResourceNotFoundException;
import com.roadaccident.repository.AccidentRepository;
import com.roadaccident.repository.HotspotRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.*;

@Service
@Transactional
public class HotspotService {

    private final AccidentRepository accidentRepository;
    private final HotspotRepository hotspotRepository;

    private static final double EARTH_RADIUS_KM = 6371.0088;

    public HotspotService(AccidentRepository accidentRepository, HotspotRepository hotspotRepository) {
        this.accidentRepository = accidentRepository;
        this.hotspotRepository = hotspotRepository;
    }

    public List<Hotspot> getAllHotspots() {
        return hotspotRepository.findAllByOrderByAccidentCountDesc();
    }

    public Hotspot getHotspotById(Long id) {
        return hotspotRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Hotspot not found with ID: " + id));
    }

    /**
     * Executes DBSCAN Density-Based Spatial Clustering with Great-Circle Haversine Geodesic Metric.
     */
    public List<Hotspot> analyzeAndGenerateHotspots(HotspotAnalysisRequestDto request) {
        double epsKm = request.getRadiusKm() != null ? request.getRadiusKm() : 1.5;
        int minPts = request.getMinPoints() != null ? request.getMinPoints() : 3;

        List<Accident> accidents;
        if (request.getStartDate() != null && request.getEndDate() != null) {
            accidents = accidentRepository.findByDateRangeWithCoordinates(request.getStartDate(), request.getEndDate());
        } else {
            accidents = accidentRepository.findAllWithCoordinates();
        }

        if (accidents.isEmpty() || accidents.size() < minPts) {
            return Collections.emptyList();
        }

        int n = accidents.size();
        boolean[] visited = new boolean[n];
        int[] clusterId = new int[n];
        Arrays.fill(clusterId, -1); // -1 = unassigned / noise

        int currentCluster = 0;

        for (int i = 0; i < n; i++) {
            if (visited[i]) continue;
            visited[i] = true;

            List<Integer> neighbors = getNeighbors(accidents, i, epsKm);
            if (neighbors.size() < minPts) {
                clusterId[i] = -1; // Noise for now
            } else {
                currentCluster++;
                clusterId[i] = currentCluster;
                expandCluster(accidents, i, neighbors, currentCluster, epsKm, minPts, visited, clusterId);
            }
        }

        // Group points by clusterId
        Map<Integer, List<Accident>> clusters = new HashMap<>();
        for (int i = 0; i < n; i++) {
            int cid = clusterId[i];
            if (cid > 0) {
                clusters.computeIfAbsent(cid, k -> new ArrayList<>()).add(accidents.get(i));
            }
        }

        // Clear existing hotspots and save newly generated analysis
        hotspotRepository.deleteAll();

        List<Hotspot> savedHotspots = new ArrayList<>();
        LocalDate defaultStart = request.getStartDate();
        LocalDate defaultEnd = request.getEndDate();

        for (Map.Entry<Integer, List<Accident>> entry : clusters.entrySet()) {
            List<Accident> clusterPoints = entry.getValue();

            double sumLat = 0.0;
            double sumLon = 0.0;
            int fatalCount = 0;
            int seriousCount = 0;
            int minorCount = 0;

            LocalDate minDate = null;
            LocalDate maxDate = null;
            Map<String, Integer> locationNames = new HashMap<>();

            for (Accident a : clusterPoints) {
                sumLat += a.getLatitude().doubleValue();
                sumLon += a.getLongitude().doubleValue();

                if ("Fatal".equalsIgnoreCase(a.getSeverity())) fatalCount++;
                else if ("Serious".equalsIgnoreCase(a.getSeverity())) seriousCount++;
                else minorCount++;

                if (minDate == null || a.getAccidentDate().isBefore(minDate)) minDate = a.getAccidentDate();
                if (maxDate == null || a.getAccidentDate().isAfter(maxDate)) maxDate = a.getAccidentDate();

                String loc = a.getLocationDescription() != null && !a.getLocationDescription().isBlank() ?
                        a.getLocationDescription() : a.getCity();
                locationNames.put(loc, locationNames.getOrDefault(loc, 0) + 1);
            }

            double avgLat = sumLat / clusterPoints.size();
            double avgLon = sumLon / clusterPoints.size();

            // Most frequent location name in cluster
            String primaryLoc = locationNames.entrySet().stream()
                    .max(Map.Entry.comparingByValue())
                    .map(Map.Entry::getKey)
                    .orElse("Road Sector " + entry.getKey());

            int totalInCluster = clusterPoints.size();
            String riskCategory = calculateRiskCategory(totalInCluster, fatalCount, seriousCount);

            Hotspot hotspot = new Hotspot();
            hotspot.setLatitude(BigDecimal.valueOf(avgLat).setScale(7, RoundingMode.HALF_UP));
            hotspot.setLongitude(BigDecimal.valueOf(avgLon).setScale(7, RoundingMode.HALF_UP));
            hotspot.setAccidentCount(totalInCluster);
            hotspot.setFatalAccidentCount(fatalCount);
            hotspot.setSeriousAccidentCount(seriousCount);
            hotspot.setMinorAccidentCount(minorCount);
            hotspot.setRiskCategory(riskCategory);
            hotspot.setLocationName(primaryLoc);
            hotspot.setAnalysisStartDate(defaultStart != null ? defaultStart : minDate);
            hotspot.setAnalysisEndDate(defaultEnd != null ? defaultEnd : maxDate);

            savedHotspots.add(hotspotRepository.save(hotspot));
        }

        savedHotspots.sort((a, b) -> Integer.compare(b.getAccidentCount(), a.getAccidentCount()));
        return savedHotspots;
    }

    private String calculateRiskCategory(int total, int fatal, int serious) {
        if (fatal >= 3 || (total >= 8 && fatal >= 1)) {
            return "Critical Risk";
        } else if (fatal >= 1 || serious >= 5 || total >= 10) {
            return "High Risk";
        } else if (serious >= 2 || total >= 5) {
            return "Medium Risk";
        } else {
            return "Moderate Risk";
        }
    }

    private List<Integer> getNeighbors(List<Accident> points, int targetIdx, double epsKm) {
        List<Integer> neighbors = new ArrayList<>();
        Accident target = points.get(targetIdx);
        double lat1 = target.getLatitude().doubleValue();
        double lon1 = target.getLongitude().doubleValue();

        for (int i = 0; i < points.size(); i++) {
            Accident other = points.get(i);
            double dist = haversineDistance(lat1, lon1, other.getLatitude().doubleValue(), other.getLongitude().doubleValue());
            if (dist <= epsKm) {
                neighbors.add(i);
            }
        }
        return neighbors;
    }

    private void expandCluster(List<Accident> points, int pointIdx, List<Integer> neighbors,
                               int clusterId, double epsKm, int minPts,
                               boolean[] visited, int[] clusterAssigned) {
        Queue<Integer> queue = new ArrayDeque<>(neighbors);

        while (!queue.isEmpty()) {
            int current = queue.poll();

            if (!visited[current]) {
                visited[current] = true;
                List<Integer> currentNeighbors = getNeighbors(points, current, epsKm);
                if (currentNeighbors.size() >= minPts) {
                    queue.addAll(currentNeighbors);
                }
            }

            if (clusterAssigned[current] == -1) {
                clusterAssigned[current] = clusterId;
            }
        }
    }

    public static double haversineDistance(double lat1, double lon1, double lat2, double lon2) {
        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);

        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                   Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2)) *
                   Math.sin(dLon / 2) * Math.sin(dLon / 2);

        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return EARTH_RADIUS_KM * c;
    }
}
