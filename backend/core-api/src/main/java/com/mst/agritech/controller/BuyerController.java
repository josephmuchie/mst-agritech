package com.mst.agritech.controller;

import com.mst.agritech.dto.response.BuyerResponse;
import com.mst.agritech.service.BuyerService;
import io.swagger.v3.oas.annotations.Operation;
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
    @Operation(summary = "List all buyers (paginated)")
    public ResponseEntity<Page<BuyerResponse>> list(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(buyerService.findAll(PageRequest.of(page, size, Sort.by("createdAt").descending())));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','FARMER','ANALYST','BUYER')")
    @Operation(summary = "Get buyer by ID")
    public ResponseEntity<BuyerResponse> get(@PathVariable Long id) {
        return ResponseEntity.ok(buyerService.findById(id));
    }

    @PatchMapping("/{id}/verify")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Verify a buyer account")
    public ResponseEntity<BuyerResponse> verify(@PathVariable Long id) {
        return ResponseEntity.ok(buyerService.verify(id));
    }
}
