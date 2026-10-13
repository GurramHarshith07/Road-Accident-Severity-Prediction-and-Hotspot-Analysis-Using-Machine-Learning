package com.roadaccident.controller;

import com.roadaccident.dto.ApiResponse;
import com.roadaccident.dto.PredictionRequestDto;
import com.roadaccident.dto.PredictionResponseDto;
import com.roadaccident.entity.PredictionRecord;
import com.roadaccident.service.PredictionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/predictions")
@Tag(name = "Severity Prediction", description = "Endpoints for machine learning severity inference and prediction audit log")
public class PredictionController {

    private final PredictionService predictionService;

    public PredictionController(PredictionService predictionService) {
        this.predictionService = predictionService;
    }

    @PostMapping
    @Operation(summary = "Predict accident severity from environmental and incident inputs")
    public ResponseEntity<ApiResponse<PredictionResponseDto>> predictSeverity(@Valid @RequestBody PredictionRequestDto request) {
        PredictionResponseDto response = predictionService.predictSeverity(request);
        return ResponseEntity.ok(ApiResponse.success("Prediction generated successfully", response));
    }

    @GetMapping
    @Operation(summary = "Get historical prediction logs")
    public ResponseEntity<ApiResponse<Page<PredictionRecord>>> getPredictions(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "15") int size) {
        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(ApiResponse.success(predictionService.getAllPredictions(pageable)));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get prediction details by ID")
    public ResponseEntity<ApiResponse<PredictionRecord>> getPredictionById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(predictionService.getPredictionById(id)));
    }
}
