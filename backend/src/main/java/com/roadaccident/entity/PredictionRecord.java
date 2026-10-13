package com.roadaccident.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "predictions")
public class PredictionRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 100)
    private String requestId;

    @Column(columnDefinition = "TEXT")
    private String inputFeatures;

    @Column(nullable = false, length = 50)
    private String predictedSeverity;

    @Column(columnDefinition = "TEXT")
    private String classProbabilities;

    @Column(length = 50)
    private String modelVersion;

    @Column(columnDefinition = "TEXT")
    private String explanation;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    public PredictionRecord() {}

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getRequestId() { return requestId; }
    public void setRequestId(String requestId) { this.requestId = requestId; }

    public String getInputFeatures() { return inputFeatures; }
    public void setInputFeatures(String inputFeatures) { this.inputFeatures = inputFeatures; }

    public String getPredictedSeverity() { return predictedSeverity; }
    public void setPredictedSeverity(String predictedSeverity) { this.predictedSeverity = predictedSeverity; }

    public String getClassProbabilities() { return classProbabilities; }
    public void setClassProbabilities(String classProbabilities) { this.classProbabilities = classProbabilities; }

    public String getModelVersion() { return modelVersion; }
    public void setModelVersion(String modelVersion) { this.modelVersion = modelVersion; }

    public String getExplanation() { return explanation; }
    public void setExplanation(String explanation) { this.explanation = explanation; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
