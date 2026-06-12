package com.mst.agritech.controller;

import com.mst.agritech.dto.response.BuyerResponse;
import com.mst.agritech.service.BuyerService;
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
@RequestMapping("/api/v1/buyers")
@RequiredArgsConstructor
@Tag(name = "Buyers", description = "Buyer management endpoints")
@SecurityRequirement(name = "bearerAuth")
public class BuyerController {

    private final BuyerService buyerService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','FARMER','ANALYST')")
    @Operation(
            summary = "List all buyers (paginated)",
            description = "Returns a paginated list of registered buyer companies sorted by creation date. Requires ADMIN, FARMER, or ANALYST role.")
    public ResponseEntity<Page<BuyerResponse>> list(
            @Parameter(description = "Page number (zero-based)", example = "0") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Number of records per page", example = "20") @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(buyerService.findAll(PageRequest.of(page, size, Sort.by("createdAt").descending())));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','FARMER','ANALYST','BUYER')")
    @Operation(
            summary = "Get buyer by ID",
            description = "Retrieves buyer company profile including country, buyer type, and contact details.")
    public ResponseEntity<BuyerResponse> get(
            @Parameter(description = "Buyer ID", example = "1") @PathVariable Long id) {
        return ResponseEntity.ok(buyerService.findById(id));
    }

    @PatchMapping("/{id}/verify")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(
            summary = "Verify a buyer account",
            description = "Marks a buyer company as verified after admin review. Admin only.")
    public ResponseEntity<BuyerResponse> verify(
            @Parameter(description = "Buyer ID", example = "1") @PathVariable Long id) {
        return ResponseEntity.ok(buyerService.verify(id));
    }
}
