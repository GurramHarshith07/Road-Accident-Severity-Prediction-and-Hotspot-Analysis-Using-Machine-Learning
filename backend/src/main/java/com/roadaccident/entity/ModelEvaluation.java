package com.roadaccident.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "model_evaluations")
public class ModelEvaluation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String modelName;

    @Column(nullable = false, length = 50)
    private String modelVersion;

    @Column(precision = 6, scale = 4, nullable = false)
    private BigDecimal accuracy;

    @Column(precision = 6, scale = 4, nullable = false)
    private BigDecimal precisionScore;

    @Column(precision = 6, scale = 4, nullable = false)
    private BigDecimal recallScore;

    @Column(precision = 6, scale = 4, nullable = false)
    private BigDecimal macroF1Score;

    @Column(columnDefinition = "TEXT")
    private String evaluationDetails; // JSON string with confusion matrix, class-wise metrics

    @Column(nullable = false, updatable = false)
    private LocalDateTime evaluatedAt;

    public ModelEvaluation() {}

    @PrePersist
    protected void onCreate() {
        this.evaluatedAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getModelName() { return modelName; }
    public void setModelName(String modelName) { this.modelName = modelName; }

    public String getModelVersion() { return modelVersion; }
    public void setModelVersion(String modelVersion) { this.modelVersion = modelVersion; }

    public BigDecimal getAccuracy() { return accuracy; }
    public void setAccuracy(BigDecimal accuracy) { this.accuracy = accuracy; }

    public BigDecimal getPrecisionScore() { return precisionScore; }
    public void setPrecisionScore(BigDecimal precisionScore) { this.precisionScore = precisionScore; }

    public BigDecimal getRecallScore() { return recallScore; }
    public void setRecallScore(BigDecimal recallScore) { this.recallScore = recallScore; }

    public BigDecimal getMacroF1Score() { return macroF1Score; }
    public void setMacroF1Score(BigDecimal macroF1Score) { this.macroF1Score = macroF1Score; }

    public String getEvaluationDetails() { return evaluationDetails; }
    public void setEvaluationDetails(String evaluationDetails) { this.evaluationDetails = evaluationDetails; }

    public LocalDateTime getEvaluatedAt() { return evaluatedAt; }
    public void setEvaluatedAt(LocalDateTime evaluatedAt) { this.evaluatedAt = evaluatedAt; }
}
