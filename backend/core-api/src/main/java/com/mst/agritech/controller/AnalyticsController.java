package com.mst.agritech.controller;

import com.mst.agritech.dto.response.AnalyticsSummaryResponse;
import com.mst.agritech.dto.response.TopMarketResponse;
import com.mst.agritech.dto.response.TopProductResponse;
import com.mst.agritech.service.AnalyticsService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/analytics")
@RequiredArgsConstructor
@Tag(name = "Analytics", description = "Platform analytics derived from live transactional data")
@SecurityRequirement(name = "bearerAuth")
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    @GetMapping("/summary")
    @PreAuthorize("hasAnyRole('ADMIN','ANALYST')")
    @Operation(summary = "Analytics summary KPIs")
    public ResponseEntity<AnalyticsSummaryResponse> summary() {
        return ResponseEntity.ok(analyticsService.getSummary());
    }

    @GetMapping("/top-products")
    @PreAuthorize("hasAnyRole('ADMIN','ANALYST')")
    @Operation(summary = "Top products by revenue")
    public ResponseEntity<List<TopProductResponse>> topProducts() {
        return ResponseEntity.ok(analyticsService.getTopProducts());
    }

    @GetMapping("/top-markets")
    @PreAuthorize("hasAnyRole('ADMIN','ANALYST')")
    @Operation(summary = "Top export markets by revenue")
    public ResponseEntity<List<TopMarketResponse>> topMarkets() {
        return ResponseEntity.ok(analyticsService.getTopMarkets());
    }
}
