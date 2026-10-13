package com.roadaccident.controller;

import com.roadaccident.dto.ApiResponse;
import com.roadaccident.dto.HotspotAnalysisRequestDto;
import com.roadaccident.entity.Hotspot;
import com.roadaccident.service.HotspotService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/hotspots")
@Tag(name = "Hotspots Analysis", description = "Endpoints for spatial clustering, hotspot identification, and risk evaluation")
public class HotspotController {

    private final HotspotService hotspotService;

    public HotspotController(HotspotService hotspotService) {
        this.hotspotService = hotspotService;
    }

    @GetMapping
    @Operation(summary = "Get all detected accident hotspots sorted by concentration")
    public ResponseEntity<ApiResponse<List<Hotspot>>> getHotspots() {
        return ResponseEntity.ok(ApiResponse.success(hotspotService.getAllHotspots()));
    }

    @PostMapping("/analyze")
    @Operation(summary = "Trigger geospatial DBSCAN clustering analysis to detect hotspots")
    public ResponseEntity<ApiResponse<List<Hotspot>>> analyzeHotspots(@RequestBody(required = false) HotspotAnalysisRequestDto request) {
        if (request == null) {
            request = new HotspotAnalysisRequestDto();
        }
        List<Hotspot> hotspots = hotspotService.analyzeAndGenerateHotspots(request);
        return ResponseEntity.ok(ApiResponse.success("Hotspot clustering analysis completed successfully", hotspots));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get specific hotspot details by ID")
    public ResponseEntity<ApiResponse<Hotspot>> getHotspotById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(hotspotService.getHotspotById(id)));
    }
}
