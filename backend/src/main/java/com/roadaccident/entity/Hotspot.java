package com.roadaccident.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "hotspots", indexes = {
    @Index(name = "idx_hotspot_coords", columnList = "latitude, longitude"),
    @Index(name = "idx_hotspot_risk", columnList = "riskCategory")
})
public class Hotspot {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(precision = 10, scale = 7, nullable = false)
    private BigDecimal latitude;

    @Column(precision = 10, scale = 7, nullable = false)
    private BigDecimal longitude;

    @Column(nullable = false)
    private Integer accidentCount = 0;

    @Column(nullable = false)
    private Integer fatalAccidentCount = 0;

    @Column(nullable = false)
    private Integer seriousAccidentCount = 0;

    @Column(nullable = false)
    private Integer minorAccidentCount = 0;

    @Column(length = 50, nullable = false)
    private String riskCategory; // Critical, High, Medium, Moderate

    @Column(length = 150)
    private String locationName;

    @Column
    private LocalDate analysisStartDate;

    @Column
    private LocalDate analysisEndDate;

    @Column(nullable = false, updatable = false)
    private LocalDateTime generatedAt;

    public Hotspot() {}

    @PrePersist
    protected void onCreate() {
        this.generatedAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public BigDecimal getLatitude() { return latitude; }
    public void setLatitude(BigDecimal latitude) { this.latitude = latitude; }

    public BigDecimal getLongitude() { return longitude; }
    public void setLongitude(BigDecimal longitude) { this.longitude = longitude; }

    public Integer getAccidentCount() { return accidentCount; }
    public void setAccidentCount(Integer accidentCount) { this.accidentCount = accidentCount; }

    public Integer getFatalAccidentCount() { return fatalAccidentCount; }
    public void setFatalAccidentCount(Integer fatalAccidentCount) { this.fatalAccidentCount = fatalAccidentCount; }

    public Integer getSeriousAccidentCount() { return seriousAccidentCount; }
    public void setSeriousAccidentCount(Integer seriousAccidentCount) { this.seriousAccidentCount = seriousAccidentCount; }

    public Integer getMinorAccidentCount() { return minorAccidentCount; }
    public void setMinorAccidentCount(Integer minorAccidentCount) { this.minorAccidentCount = minorAccidentCount; }

    public String getRiskCategory() { return riskCategory; }
    public void setRiskCategory(String riskCategory) { this.riskCategory = riskCategory; }

    public String getLocationName() { return locationName; }
    public void setLocationName(String locationName) { this.locationName = locationName; }

    public LocalDate getAnalysisStartDate() { return analysisStartDate; }
    public void setAnalysisStartDate(LocalDate analysisStartDate) { this.analysisStartDate = analysisStartDate; }

    public LocalDate getAnalysisEndDate() { return analysisEndDate; }
    public void setAnalysisEndDate(LocalDate analysisEndDate) { this.analysisEndDate = analysisEndDate; }

    public LocalDateTime getGeneratedAt() { return generatedAt; }
    public void setGeneratedAt(LocalDateTime generatedAt) { this.generatedAt = generatedAt; }
}
