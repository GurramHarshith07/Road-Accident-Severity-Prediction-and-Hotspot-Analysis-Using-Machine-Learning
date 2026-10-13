package com.roadaccident.controller;

import com.roadaccident.dto.ApiResponse;
import com.roadaccident.dto.DashboardSummaryDto;
import com.roadaccident.service.DashboardService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/dashboard")
@Tag(name = "Dashboard", description = "Endpoints for KPI summary metrics and dashboard charts")
public class DashboardController {

    private final DashboardService dashboardService;

    public DashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @GetMapping("/summary")
    @Operation(summary = "Get overall dashboard statistics and overview cards")
    public ResponseEntity<ApiResponse<DashboardSummaryDto>> getDashboardSummary() {
        return ResponseEntity.ok(ApiResponse.success(dashboardService.getDashboardSummary()));
    }

    @GetMapping("/severity-distribution")
    @Operation(summary = "Get accident breakdown by severity category")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getSeverityDistribution() {
        return ResponseEntity.ok(ApiResponse.success(dashboardService.getSeverityDistribution()));
    }

    @GetMapping("/monthly-trends")
    @Operation(summary = "Get monthly accident trend figures")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getMonthlyTrends() {
        return ResponseEntity.ok(ApiResponse.success(dashboardService.getMonthlyTrends()));
    }

    @GetMapping("/weather-analysis")
    @Operation(summary = "Get accident patterns across weather conditions")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getWeatherAnalysis() {
        return ResponseEntity.ok(ApiResponse.success(dashboardService.getWeatherAnalysis()));
    }
}
