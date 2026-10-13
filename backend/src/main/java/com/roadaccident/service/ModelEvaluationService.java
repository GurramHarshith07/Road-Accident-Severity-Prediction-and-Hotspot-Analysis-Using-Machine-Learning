package com.roadaccident.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.roadaccident.entity.ModelEvaluation;
import com.roadaccident.exception.MlServiceException;
import com.roadaccident.repository.ModelEvaluationRepository;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

import java.math.BigDecimal;
import java.util.*;

@Service
@Transactional
public class ModelEvaluationService {

    private final ModelEvaluationRepository modelEvaluationRepository;
    private final RestClient mlRestClient;
    private final ObjectMapper objectMapper;

    public ModelEvaluationService(ModelEvaluationRepository modelEvaluationRepository,
                                  RestClient mlRestClient,
                                  ObjectMapper objectMapper) {
        this.modelEvaluationRepository = modelEvaluationRepository;
        this.mlRestClient = mlRestClient;
        this.objectMapper = objectMapper;
    }

    public List<ModelEvaluation> getAllModelEvaluations() {
        List<ModelEvaluation> existing = modelEvaluationRepository.findAllByOrderByAccuracyDesc();
        if (existing.isEmpty()) {
            try {
                refreshEvaluationsFromMlService();
                return modelEvaluationRepository.findAllByOrderByAccuracyDesc();
            } catch (Exception ignored) {}
        }
        return existing;
    }

    public List<ModelEvaluation> refreshEvaluationsFromMlService() {
        try {
            Map<String, Object> response = mlRestClient.get()
                    .uri("/models/evaluation")
                    .retrieve()
                    .body(new ParameterizedTypeReference<Map<String, Object>>() {});

            if (response != null && response.containsKey("models")) {
                @SuppressWarnings("unchecked")
                List<Map<String, Object>> modelsList = (List<Map<String, Object>>) response.get("models");

                modelEvaluationRepository.deleteAll();
                List<ModelEvaluation> savedList = new ArrayList<>();

                for (Map<String, Object> m : modelsList) {
                    ModelEvaluation me = new ModelEvaluation();
                    me.setModelName((String) m.get("model_name"));
                    me.setModelVersion((String) m.getOrDefault("model_version", "1.0.0"));
                    me.setAccuracy(BigDecimal.valueOf(((Number) m.get("accuracy")).doubleValue()));
                    me.setPrecisionScore(BigDecimal.valueOf(((Number) m.get("precision")).doubleValue()));
                    me.setRecallScore(BigDecimal.valueOf(((Number) m.get("recall")).doubleValue()));
                    me.setMacroF1Score(BigDecimal.valueOf(((Number) m.get("macro_f1")).doubleValue()));
                    me.setEvaluationDetails(objectMapper.writeValueAsString(m));

                    savedList.add(modelEvaluationRepository.save(me));
                }
                return savedList;
            }
            throw new MlServiceException("Empty model evaluation response from ML microservice.");
        } catch (RestClientException ex) {
            throw new MlServiceException("Failed to connect to Python ML microservice at /models/evaluation: " + ex.getMessage(), ex);
        } catch (Exception ex) {
            throw new RuntimeException("Error processing model evaluations: " + ex.getMessage(), ex);
        }
    }
}
