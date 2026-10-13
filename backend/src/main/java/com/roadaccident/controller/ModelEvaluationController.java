package com.roadaccident.controller;

import com.roadaccident.dto.ApiResponse;
import com.roadaccident.entity.ModelEvaluation;
import com.roadaccident.service.ModelEvaluationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/models")
@Tag(name = "Model Evaluation", description = "Endpoints for comparing and inspecting machine learning model evaluation metrics")
public class ModelEvaluationController {

    private final ModelEvaluationService modelEvaluationService;

    public ModelEvaluationController(ModelEvaluationService modelEvaluationService) {
        this.modelEvaluationService = modelEvaluationService;
    }

    @GetMapping
    @Operation(summary = "List all evaluated machine learning models and metrics")
    public ResponseEntity<ApiResponse<List<ModelEvaluation>>> getModels() {
        return ResponseEntity.ok(ApiResponse.success(modelEvaluationService.getAllModelEvaluations()));
    }

    @GetMapping("/evaluation")
    @Operation(summary = "Get detailed model performance metrics (Accuracy, Precision, Recall, Macro F1, Confusion Matrix)")
    public ResponseEntity<ApiResponse<List<ModelEvaluation>>> getModelEvaluations() {
        return ResponseEntity.ok(ApiResponse.success(modelEvaluationService.getAllModelEvaluations()));
    }

    @PostMapping("/evaluation/sync")
    @Operation(summary = "Synchronize latest evaluation metrics from the Python ML training service")
    public ResponseEntity<ApiResponse<List<ModelEvaluation>>> syncEvaluations() {
        List<ModelEvaluation> updated = modelEvaluationService.refreshEvaluationsFromMlService();
        return ResponseEntity.ok(ApiResponse.success("Model evaluations synchronized successfully from ML microservice", updated));
    }
}
