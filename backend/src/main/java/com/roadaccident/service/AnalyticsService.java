package com.roadaccident.service;

import com.roadaccident.repository.AccidentRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Service
@Transactional(readOnly = true)
public class AnalyticsService {

    private final AccidentRepository accidentRepository;

    public AnalyticsService(AccidentRepository accidentRepository) {
        this.accidentRepository = accidentRepository;
    }

    public List<Map<String, Object>> getSeverityDistribution() {
        List<Map<String, Object>> list = new ArrayList<>();
        long total = accidentRepository.count();
        for (Object[] row : accidentRepository.countAccidentsBySeverity()) {
            String severity = (String) row[0];
            long count = ((Number) row[1]).longValue();
            double percentage = total > 0 ? (count * 100.0) / total : 0.0;
            Map<String, Object> map = new HashMap<>();
            map.put("severity", severity);
            map.put("count", count);
            map.put("percentage", Math.round(percentage * 100.0) / 100.0);
            list.add(map);
        }
        return list;
    }

    public Map<String, Object> getTimeAnalytics() {
        Map<String, Object> result = new HashMap<>();

        // Hourly
        List<Map<String, Object>> hourly = new ArrayList<>();
        for (Object[] row : accidentRepository.findHourlyDistribution()) {
            int h = ((Number) row[0]).intValue();
            long count = ((Number) row[1]).longValue();
            hourly.add(Map.of("hour", String.format("%02d:00", h), "count", count));
        }
        result.put("hourly", hourly);

        // Day vs Night / Lighting
        List<Map<String, Object>> lighting = new ArrayList<>();
        for (Object[] row : accidentRepository.findLightingDistribution()) {
            lighting.add(Map.of("condition", row[0], "count", row[1]));
        }
        result.put("lighting", lighting);

        // Monthly trends
        result.put("monthlyTrends", accidentRepository.findMonthlyTrendsBySeverity());

        return result;
    }

    public List<Map<String, Object>> getRoadTypeAnalytics() {
        List<Map<String, Object>> list = new ArrayList<>();
        Map<String, Map<String, Object>> map = new LinkedHashMap<>();

        for (Object[] row : accidentRepository.findRoadTypeAnalysis()) {
            String road = (String) row[0];
            String sev = (String) row[1];
            Long count = ((Number) row[2]).longValue();

            map.putIfAbsent(road, new HashMap<>(Map.of("roadType", road, "Fatal", 0L, "Serious", 0L, "Minor", 0L, "total", 0L)));
            Map<String, Object> entry = map.get(road);
            entry.put(sev, count);
            entry.put("total", ((Long) entry.get("total")) + count);
        }
        list.addAll(map.values());
        return list;
    }

    public List<Map<String, Object>> getWeatherAnalytics() {
        List<Map<String, Object>> list = new ArrayList<>();
        Map<String, Map<String, Object>> map = new LinkedHashMap<>();

        for (Object[] row : accidentRepository.findWeatherAnalysis()) {
            String weather = (String) row[0];
            String sev = (String) row[1];
            Long count = ((Number) row[2]).longValue();

            map.putIfAbsent(weather, new HashMap<>(Map.of("weatherCondition", weather, "Fatal", 0L, "Serious", 0L, "Minor", 0L, "total", 0L)));
            Map<String, Object> entry = map.get(weather);
            entry.put(sev, count);
            entry.put("total", ((Long) entry.get("total")) + count);
        }
        list.addAll(map.values());
        return list;
    }

    public List<Map<String, Object>> getCityWiseStatistics() {
        List<Map<String, Object>> list = new ArrayList<>();
        for (Object[] row : accidentRepository.findCityWiseStatistics()) {
            Map<String, Object> map = new HashMap<>();
            map.put("city", row[0]);
            map.put("totalAccidents", row[1]);
            map.put("fatalCount", row[2]);
            map.put("seriousCount", row[3]);
            list.add(map);
        }
        return list;
    }

    public List<Map<String, Object>> getAreaTypeAnalytics() {
        List<Map<String, Object>> list = new ArrayList<>();
        Map<String, Map<String, Object>> map = new LinkedHashMap<>();

        for (Object[] row : accidentRepository.findAreaTypeDistribution()) {
            String area = (String) row[0];
            String sev = (String) row[1];
            Long count = ((Number) row[2]).longValue();

            map.putIfAbsent(area, new HashMap<>(Map.of("areaType", area, "Fatal", 0L, "Serious", 0L, "Minor", 0L, "total", 0L)));
            Map<String, Object> entry = map.get(area);
            entry.put(sev, count);
            entry.put("total", ((Long) entry.get("total")) + count);
        }
        list.addAll(map.values());
        return list;
    }
}
