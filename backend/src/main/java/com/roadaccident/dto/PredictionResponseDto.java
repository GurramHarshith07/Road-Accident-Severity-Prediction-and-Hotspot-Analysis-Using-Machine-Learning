package com.roadaccident.dto;

import java.time.LocalDateTime;
import java.util.Map;

public class PredictionResponseDto {

    private String requestId;
    private String predictedSeverity; // Minor, Serious, Fatal
    private Double confidenceScore;
    private Map<String, Double> classProbabilities;
    private String explanation;
    private String modelName;
    private String modelVersion;
    private LocalDateTime timestamp;
    private String disclaimer = "Predictions are statistical estimates based on historical machine learning training data and do not guarantee actual accident outcomes or determine causal fault.";

    public PredictionResponseDto() {
        this.timestamp = LocalDateTime.now();
    }

    public String getRequestId() { return requestId; }
    public void setRequestId(String requestId) { this.requestId = requestId; }

    public String getPredictedSeverity() { return predictedSeverity; }
    public void setPredictedSeverity(String predictedSeverity) { this.predictedSeverity = predictedSeverity; }

    public Double getConfidenceScore() { return confidenceScore; }
    public void setConfidenceScore(Double confidenceScore) { this.confidenceScore = confidenceScore; }

    public Map<String, Double> getClassProbabilities() { return classProbabilities; }
    public void setClassProbabilities(Map<String, Double> classProbabilities) { this.classProbabilities = classProbabilities; }

    public String getExplanation() { return explanation; }
    public void setExplanation(String explanation) { this.explanation = explanation; }

    public String getModelName() { return modelName; }
    public void setModelName(String modelName) { this.modelName = modelName; }

    public String getModelVersion() { return modelVersion; }
    public void setModelVersion(String modelVersion) { this.modelVersion = modelVersion; }

    public LocalDateTime getTimestamp() { return timestamp; }
    public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }

    public String getDisclaimer() { return disclaimer; }
    public void setDisclaimer(String disclaimer) { this.disclaimer = disclaimer; }
}
