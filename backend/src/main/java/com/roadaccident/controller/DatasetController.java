package com.roadaccident.controller;

import com.roadaccident.dto.ApiResponse;
import com.roadaccident.dto.UploadResponseDto;
import com.roadaccident.service.DatasetUploadService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.nio.charset.StandardCharsets;

@RestController
@RequestMapping("/api/datasets")
@Tag(name = "Dataset Management", description = "Endpoints for dataset CSV upload, validation, and sample templates")
public class DatasetController {

    private final DatasetUploadService datasetUploadService;

    public DatasetController(DatasetUploadService datasetUploadService) {
        this.datasetUploadService = datasetUploadService;
    }

    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Upload and validate a CSV accident dataset (supports dry-run preview and batch persistence)")
    public ResponseEntity<ApiResponse<UploadResponseDto>> uploadDataset(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "dryRun", defaultValue = "false") boolean dryRun) {
        UploadResponseDto response = datasetUploadService.processCsvUpload(file, dryRun);
        return ResponseEntity.ok(ApiResponse.success(
                dryRun ? "File preview and validation complete" : "Dataset imported successfully", response));
    }

    @GetMapping("/template")
    @Operation(summary = "Download standard CSV template for accident dataset upload")
    public ResponseEntity<Resource> downloadTemplate() {
        byte[] data = DatasetUploadService.SAMPLE_CSV_TEMPLATE.getBytes(StandardCharsets.UTF_8);
        ByteArrayResource resource = new ByteArrayResource(data);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"road_accidents_template.csv\"")
                .contentType(MediaType.parseMediaType("text/csv"))
                .contentLength(data.length)
                .body(resource);
    }
}
