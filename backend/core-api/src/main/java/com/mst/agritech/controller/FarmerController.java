package com.mst.agritech.controller;

import com.mst.agritech.dto.response.FarmerResponse;
import com.mst.agritech.service.FarmerService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/farmers")
@RequiredArgsConstructor
@Tag(name = "Farmers", description = "Farmer management endpoints")
@SecurityRequirement(name = "bearerAuth")
public class FarmerController {

    private final FarmerService farmerService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','BUYER','ANALYST')")
    @Operation(
            summary = "List all farmers (paginated)",
            description = "Returns a paginated list of registered farmers sorted by creation date (newest first). Requires ADMIN, BUYER, or ANALYST role.")
    public ResponseEntity<Page<FarmerResponse>> list(
            @Parameter(description = "Page number (zero-based)", example = "0") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Number of records per page", example = "20") @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(farmerService.findAll(PageRequest.of(page, size, Sort.by("createdAt").descending())));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','BUYER','ANALYST','FARMER')")
    @Operation(
            summary = "Get farmer by ID",
            description = "Retrieves full farmer profile including farm name, GPS coordinates, hectarage, and verification status.")
    public ResponseEntity<FarmerResponse> get(
            @Parameter(description = "Farmer ID", example = "1") @PathVariable Long id) {
        return ResponseEntity.ok(farmerService.findById(id));
    }

    @PatchMapping("/{id}/verify")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(
            summary = "Verify a farmer account",
            description = "Marks a farmer as verified after admin review of farm details and documentation. Admin only.")
    public ResponseEntity<FarmerResponse> verify(
            @Parameter(description = "Farmer ID", example = "1") @PathVariable Long id) {
        return ResponseEntity.ok(farmerService.verify(id));
    }
}
