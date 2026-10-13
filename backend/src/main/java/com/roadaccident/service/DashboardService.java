package com.roadaccident.service;

import com.roadaccident.dto.DashboardSummaryDto;
import com.roadaccident.repository.AccidentRepository;
import com.roadaccident.repository.HotspotRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Service
@Transactional(readOnly = true)
public class DashboardService {

    private final AccidentRepository accidentRepository;
    private final HotspotRepository hotspotRepository;

    public DashboardService(AccidentRepository accidentRepository, HotspotRepository hotspotRepository) {
        this.accidentRepository = accidentRepository;
        this.hotspotRepository = hotspotRepository;
    }

    public DashboardSummaryDto getDashboardSummary() {
        DashboardSummaryDto dto = new DashboardSummaryDto();

        dto.setTotalAccidents(accidentRepository.count());
        dto.setFatalAccidents(accidentRepository.countBySeverity("Fatal"));
        dto.setSeriousAccidents(accidentRepository.countBySeverity("Serious"));
        dto.setMinorAccidents(accidentRepository.countBySeverity("Minor"));

        dto.setTotalHotspots(hotspotRepository.count());
        dto.setCriticalHotspots(hotspotRepository.findByRiskCategory("Critical Risk").size());

        // Severity Distribution
        List<Map<String, Object>> severityList = new ArrayList<>();
        for (Object[] row : accidentRepository.countAccidentsBySeverity()) {
            Map<String, Object> map = new HashMap<>();
            map.put("severity", row[0]);
            map.put("count", row[1]);
            severityList.add(map);
        }
        dto.setSeverityDistribution(severityList);

        // Monthly Trends
        List<Map<String, Object>> monthlyList = new ArrayList<>();
        Map<String, Map<String, Object>> monthMap = new LinkedHashMap<>();
        String[] monthNames = {"", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"};

        for (Object[] row : accidentRepository.findMonthlyTrendsBySeverity()) {
            Integer m = ((Number) row[0]).intValue();
            Integer y = ((Number) row[1]).intValue();
            String sev = (String) row[2];
            Long count = ((Number) row[3]).longValue();

            String key = (m >= 1 && m <= 12 ? monthNames[m] : ("M" + m)) + " " + y;
            monthMap.putIfAbsent(key, new HashMap<>(Map.of("month", key, "Fatal", 0L, "Serious", 0L, "Minor", 0L, "total", 0L)));

            Map<String, Object> entry = monthMap.get(key);
            entry.put(sev, count);
            entry.put("total", ((Long) entry.get("total")) + count);
        }
        monthlyList.addAll(monthMap.values());
        dto.setMonthlyTrends(monthlyList);

        // Weather Analysis
        List<Map<String, Object>> weatherList = new ArrayList<>();
        Map<String, Map<String, Object>> weatherMap = new LinkedHashMap<>();
        for (Object[] row : accidentRepository.findWeatherAnalysis()) {
            String weather = (String) row[0];
            String sev = (String) row[1];
            Long count = ((Number) row[2]).longValue();

            weatherMap.putIfAbsent(weather, new HashMap<>(Map.of("weather", weather, "Fatal", 0L, "Serious", 0L, "Minor", 0L, "total", 0L)));
            Map<String, Object> entry = weatherMap.get(weather);
            entry.put(sev, count);
            entry.put("total", ((Long) entry.get("total")) + count);
        }
        weatherList.addAll(weatherMap.values());
        dto.setWeatherAnalysis(weatherList);

        // Road Type Analysis
        List<Map<String, Object>> roadList = new ArrayList<>();
        Map<String, Map<String, Object>> roadMap = new LinkedHashMap<>();
        for (Object[] row : accidentRepository.findRoadTypeAnalysis()) {
            String road = (String) row[0];
            String sev = (String) row[1];
            Long count = ((Number) row[2]).longValue();

            roadMap.putIfAbsent(road, new HashMap<>(Map.of("roadType", road, "Fatal", 0L, "Serious", 0L, "Minor", 0L, "total", 0L)));
            Map<String, Object> entry = roadMap.get(road);
            entry.put(sev, count);
            entry.put("total", ((Long) entry.get("total")) + count);
        }
        roadList.addAll(roadMap.values());
        dto.setRoadTypeAnalysis(roadList);

        // Hourly Distribution
        List<Map<String, Object>> hourlyList = new ArrayList<>();
        for (Object[] row : accidentRepository.findHourlyDistribution()) {
            int h = ((Number) row[0]).intValue();
            long count = ((Number) row[1]).longValue();
            Map<String, Object> map = new HashMap<>();
            map.put("hour", String.format("%02d:00", h));
            map.put("count", count);
            hourlyList.add(map);
        }
        dto.setHourlyDistribution(hourlyList);

        return dto;
    }

    public List<Map<String, Object>> getSeverityDistribution() {
        return getDashboardSummary().getSeverityDistribution();
    }

    public List<Map<String, Object>> getMonthlyTrends() {
        return getDashboardSummary().getMonthlyTrends();
    }

    public List<Map<String, Object>> getWeatherAnalysis() {
        return getDashboardSummary().getWeatherAnalysis();
    }
}
