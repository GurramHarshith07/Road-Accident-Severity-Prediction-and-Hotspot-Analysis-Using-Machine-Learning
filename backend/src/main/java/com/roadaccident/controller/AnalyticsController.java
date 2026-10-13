package com.roadaccident.controller;

import com.roadaccident.dto.ApiResponse;
import com.roadaccident.service.AnalyticsService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/analytics")
@Tag(name = "Analytics & Reports", description = "Endpoints for in-depth accident pattern analytics")
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    public AnalyticsController(AnalyticsService analyticsService) {
        this.analyticsService = analyticsService;
    }

    @GetMapping("/severity")
    @Operation(summary = "Get detailed severity breakdown and percentages")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getSeverityAnalytics() {
        return ResponseEntity.ok(ApiResponse.success(analyticsService.getSeverityDistribution()));
    }

    @GetMapping("/time")
    @Operation(summary = "Get hourly, lighting, and temporal distribution")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getTimeAnalytics() {
        return ResponseEntity.ok(ApiResponse.success(analyticsService.getTimeAnalytics()));
    }

    @GetMapping("/road-types")
    @Operation(summary = "Get accident statistics by road classification")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getRoadTypeAnalytics() {
        return ResponseEntity.ok(ApiResponse.success(analyticsService.getRoadTypeAnalytics()));
    }

    @GetMapping("/weather")
    @Operation(summary = "Get weather conditions correlation with accident frequency and severity")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getWeatherAnalytics() {
        return ResponseEntity.ok(ApiResponse.success(analyticsService.getWeatherAnalytics()));
    }

    @GetMapping("/cities")
    @Operation(summary = "Get city-wise accident, fatal, and serious incident counts")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getCityStatistics() {
        return ResponseEntity.ok(ApiResponse.success(analyticsService.getCityWiseStatistics()));
    }

    @GetMapping("/areas")
    @Operation(summary = "Get urban vs rural accident comparison")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getAreaStatistics() {
        return ResponseEntity.ok(ApiResponse.success(analyticsService.getAreaTypeAnalytics()));
    }
}
