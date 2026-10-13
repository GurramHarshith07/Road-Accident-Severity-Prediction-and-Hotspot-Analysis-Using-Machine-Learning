package com.roadaccident.dto;

import java.util.List;
import java.util.Map;

public class DashboardSummaryDto {
    private long totalAccidents;
    private long fatalAccidents;
    private long seriousAccidents;
    private long minorAccidents;
    private long totalHotspots;
    private long criticalHotspots;
    private List<Map<String, Object>> severityDistribution;
    private List<Map<String, Object>> monthlyTrends;
    private List<Map<String, Object>> weatherAnalysis;
    private List<Map<String, Object>> roadTypeAnalysis;
    private List<Map<String, Object>> hourlyDistribution;

    public DashboardSummaryDto() {}

    // Getters and Setters
    public long getTotalAccidents() { return totalAccidents; }
    public void setTotalAccidents(long totalAccidents) { this.totalAccidents = totalAccidents; }

    public long getFatalAccidents() { return fatalAccidents; }
    public void setFatalAccidents(long fatalAccidents) { this.fatalAccidents = fatalAccidents; }

    public long getSeriousAccidents() { return seriousAccidents; }
    public void setSeriousAccidents(long seriousAccidents) { this.seriousAccidents = seriousAccidents; }

    public long getMinorAccidents() { return minorAccidents; }
    public void setMinorAccidents(long minorAccidents) { this.minorAccidents = minorAccidents; }

    public long getTotalHotspots() { return totalHotspots; }
    public void setTotalHotspots(long totalHotspots) { this.totalHotspots = totalHotspots; }

    public long getCriticalHotspots() { return criticalHotspots; }
    public void setCriticalHotspots(long criticalHotspots) { this.criticalHotspots = criticalHotspots; }

    public List<Map<String, Object>> getSeverityDistribution() { return severityDistribution; }
    public void setSeverityDistribution(List<Map<String, Object>> severityDistribution) { this.severityDistribution = severityDistribution; }

    public List<Map<String, Object>> getMonthlyTrends() { return monthlyTrends; }
    public void setMonthlyTrends(List<Map<String, Object>> monthlyTrends) { this.monthlyTrends = monthlyTrends; }

    public List<Map<String, Object>> getWeatherAnalysis() { return weatherAnalysis; }
    public void setWeatherAnalysis(List<Map<String, Object>> weatherAnalysis) { this.weatherAnalysis = weatherAnalysis; }

    public List<Map<String, Object>> getRoadTypeAnalysis() { return roadTypeAnalysis; }
    public void setRoadTypeAnalysis(List<Map<String, Object>> roadTypeAnalysis) { this.roadTypeAnalysis = roadTypeAnalysis; }

    public List<Map<String, Object>> getHourlyDistribution() { return hourlyDistribution; }
    public void setHourlyDistribution(List<Map<String, Object>> hourlyDistribution) { this.hourlyDistribution = hourlyDistribution; }
}
