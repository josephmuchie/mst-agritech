package com.mst.agritech.controller;

import com.mst.agritech.dto.response.FarmerResponse;
import com.mst.agritech.service.FarmerService;
import io.swagger.v3.oas.annotations.Operation;
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
    @Operation(summary = "List all farmers (paginated)")
    public ResponseEntity<Page<FarmerResponse>> list(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(farmerService.findAll(PageRequest.of(page, size, Sort.by("createdAt").descending())));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','BUYER','ANALYST','FARMER')")
    @Operation(summary = "Get farmer by ID")
    public ResponseEntity<FarmerResponse> get(@PathVariable Long id) {
        return ResponseEntity.ok(farmerService.findById(id));
    }

    @PatchMapping("/{id}/verify")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Verify a farmer account")
    public ResponseEntity<FarmerResponse> verify(@PathVariable Long id) {
        return ResponseEntity.ok(farmerService.verify(id));
    }
}
