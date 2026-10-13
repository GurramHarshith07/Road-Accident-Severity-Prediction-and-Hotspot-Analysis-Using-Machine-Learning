package com.roadaccident.dto;

import java.time.LocalDate;

public class HotspotAnalysisRequestDto {
    private Double radiusKm = 1.5; // Epsilon distance in km for DBSCAN
    private Integer minPoints = 3;  // Minimum incidents to form a hotspot
    private LocalDate startDate;
    private LocalDate endDate;

    public HotspotAnalysisRequestDto() {}

    public Double getRadiusKm() { return radiusKm; }
    public void setRadiusKm(Double radiusKm) { this.radiusKm = radiusKm; }

    public Integer getMinPoints() { return minPoints; }
    public void setMinPoints(Integer minPoints) { this.minPoints = minPoints; }

    public LocalDate getStartDate() { return startDate; }
    public void setStartDate(LocalDate startDate) { this.startDate = startDate; }

    public LocalDate getEndDate() { return endDate; }
    public void setEndDate(LocalDate endDate) { this.endDate = endDate; }
}
