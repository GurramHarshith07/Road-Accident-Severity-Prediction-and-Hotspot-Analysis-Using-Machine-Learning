package com.roadaccident.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.roadaccident.dto.PredictionRequestDto;
import com.roadaccident.dto.PredictionResponseDto;
import com.roadaccident.entity.PredictionRecord;
import com.roadaccident.exception.MlServiceException;
import com.roadaccident.exception.ResourceNotFoundException;
import com.roadaccident.repository.PredictionRecordRepository;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

import java.util.Map;
import java.util.UUID;

@Service
@Transactional
public class PredictionService {

    private final RestClient mlRestClient;
    private final PredictionRecordRepository predictionRecordRepository;
    private final ObjectMapper objectMapper;

    public PredictionService(RestClient mlRestClient,
                             PredictionRecordRepository predictionRecordRepository,
                             ObjectMapper objectMapper) {
        this.mlRestClient = mlRestClient;
        this.predictionRecordRepository = predictionRecordRepository;
        this.objectMapper = objectMapper;
    }

    public PredictionResponseDto predictSeverity(PredictionRequestDto request) {
        String requestId = "PRED-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();

        try {
            // Call Python FastAPI ML Service
            Map<String, Object> mlPayload = Map.ofEntries(
                    Map.entry("request_id", requestId),
                    Map.entry("hour", request.getHour()),
                    Map.entry("day_of_week", request.getDayOfWeek()),
                    Map.entry("road_type", request.getRoadType()),
                    Map.entry("weather_condition", request.getWeatherCondition()),
                    Map.entry("lighting_condition", request.getLightingCondition()),
                    Map.entry("road_surface_condition", request.getRoadSurfaceCondition()),
                    Map.entry("vehicle_count", request.getVehicleCount()),
                    Map.entry("speed_limit", request.getSpeedLimit() != null ? request.getSpeedLimit() : 50),
                    Map.entry("area_type", request.getAreaType()),
                    Map.entry("model_name", request.getModelName() != null ? request.getModelName() : "Random Forest")
            );

            Map<String, Object> mlResponse = mlRestClient.post()
                    .uri("/predict")
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(mlPayload)
                    .retrieve()
                    .body(new ParameterizedTypeReference<Map<String, Object>>() {});

            if (mlResponse == null || !mlResponse.containsKey("predicted_severity")) {
                throw new MlServiceException("Invalid response format received from Python ML microservice.");
            }

            String predictedSeverity = (String) mlResponse.get("predicted_severity");
            Double confidence = mlResponse.get("confidence_score") != null ?
                    ((Number) mlResponse.get("confidence_score")).doubleValue() : 0.0;
            @SuppressWarnings("unchecked")
            Map<String, Double> probabilities = (Map<String, Double>) mlResponse.get("class_probabilities");
            String explanation = (String) mlResponse.get("explanation");
            String modelVersion = (String) mlResponse.getOrDefault("model_version", "1.0.0");

            // Persist prediction in MySQL database
            PredictionRecord record = new PredictionRecord();
            record.setRequestId(requestId);
            record.setInputFeatures(objectMapper.writeValueAsString(request));
            record.setPredictedSeverity(predictedSeverity);
            record.setClassProbabilities(objectMapper.writeValueAsString(probabilities));
            record.setModelVersion(modelVersion);
            record.setExplanation(explanation);
            predictionRecordRepository.save(record);

            // Construct and return DTO
            PredictionResponseDto responseDto = new PredictionResponseDto();
            responseDto.setRequestId(requestId);
            responseDto.setPredictedSeverity(predictedSeverity);
            responseDto.setConfidenceScore(confidence);
            responseDto.setClassProbabilities(probabilities);
            responseDto.setExplanation(explanation);
            responseDto.setModelName(request.getModelName());
            responseDto.setModelVersion(modelVersion);

            return responseDto;

        } catch (RestClientException ex) {
            throw new MlServiceException(
                    "Python Machine Learning microservice is unreachable at http://localhost:8000. " +
                    "Please ensure the ML service is running. Error details: " + ex.getMessage(), ex);
        } catch (JsonProcessingException ex) {
            throw new RuntimeException("Failed to serialize prediction features for database persistence", ex);
        }
    }

    public Page<PredictionRecord> getAllPredictions(Pageable pageable) {
        return predictionRecordRepository.findAllByOrderByCreatedAtDesc(pageable);
    }

    public PredictionRecord getPredictionById(Long id) {
        return predictionRecordRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Prediction record not found with ID: " + id));
    }
}
