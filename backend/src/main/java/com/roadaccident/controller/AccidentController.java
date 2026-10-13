package com.roadaccident.controller;

import com.roadaccident.dto.AccidentDto;
import com.roadaccident.dto.ApiResponse;
import com.roadaccident.entity.Accident;
import com.roadaccident.service.AccidentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/accidents")
@Tag(name = "Accident Records", description = "Endpoints for managing and querying historical road accident records")
public class AccidentController {

    private final AccidentService accidentService;

    public AccidentController(AccidentService accidentService) {
        this.accidentService = accidentService;
    }

    @GetMapping
    @Operation(summary = "Get paginated accident records with multi-attribute filtering")
    public ResponseEntity<ApiResponse<Page<Accident>>> getAccidents(
            @RequestParam(required = false) String city,
            @RequestParam(required = false) String severity,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "15") int size,
            @RequestParam(defaultValue = "accidentDate") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDirection) {

        Page<Accident> result = accidentService.getAccidents(city, severity, startDate, endDate, page, size, sortBy, sortDirection);
        return ResponseEntity.ok(ApiResponse.success(result));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get accident details by ID")
    public ResponseEntity<ApiResponse<Accident>> getAccidentById(@PathVariable Long id) {
        Accident accident = accidentService.getAccidentById(id);
        return ResponseEntity.ok(ApiResponse.success(accident));
    }

    @PostMapping
    @Operation(summary = "Add a new accident record")
    public ResponseEntity<ApiResponse<Accident>> createAccident(@Valid @RequestBody AccidentDto dto) {
        Accident created = accidentService.createAccident(dto);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Accident record created successfully", created));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update an existing accident record")
    public ResponseEntity<ApiResponse<Accident>> updateAccident(@PathVariable Long id, @Valid @RequestBody AccidentDto dto) {
        Accident updated = accidentService.updateAccident(id, dto);
        return ResponseEntity.ok(ApiResponse.success("Accident record updated successfully", updated));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete an accident record")
    public ResponseEntity<ApiResponse<Void>> deleteAccident(@PathVariable Long id) {
        accidentService.deleteAccident(id);
        return ResponseEntity.ok(ApiResponse.success("Accident record deleted successfully", null));
    }

    @GetMapping("/map")
    @Operation(summary = "Get all accident locations for map rendering")
    public ResponseEntity<ApiResponse<List<Accident>>> getAccidentsForMap() {
        List<Accident> list = accidentService.getAllAccidentsWithCoordinates();
        return ResponseEntity.ok(ApiResponse.success(list));
    }

    @GetMapping("/cities")
    @Operation(summary = "Get distinct cities with recorded accidents")
    public ResponseEntity<ApiResponse<List<String>>> getCities() {
        List<String> cities = accidentService.getAllCities();
        return ResponseEntity.ok(ApiResponse.success(cities));
    }
}
