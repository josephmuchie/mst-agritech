package com.mst.agritech.controller;

import com.mst.agritech.dto.response.MarketplaceProductResponse;
import com.mst.agritech.service.MarketplaceService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/marketplace")
@RequiredArgsConstructor
@Tag(name = "Marketplace", description = "Product listings for buyers")
@SecurityRequirement(name = "bearerAuth")
public class MarketplaceController {

    private final MarketplaceService marketplaceService;

    @GetMapping("/products")
    @Operation(summary = "List marketplace products")
    public ResponseEntity<List<MarketplaceProductResponse>> listProducts(
            @Parameter(description = "Search by product or farm name") @RequestParam(required = false) String search,
            @Parameter(description = "Filter by category name") @RequestParam(required = false) String category) {
        return ResponseEntity.ok(marketplaceService.listProducts(search, category));
    }

    @GetMapping("/products/{id}")
    @Operation(summary = "Get full marketplace product detail")
    public ResponseEntity<MarketplaceProductResponse> getProduct(
            @Parameter(description = "Product ID") @PathVariable Long id) {
        return ResponseEntity.ok(marketplaceService.getProduct(id));
    }

    @GetMapping("/categories")
    @Operation(summary = "List product categories available in marketplace")
    public ResponseEntity<List<String>> listCategories() {
        return ResponseEntity.ok(marketplaceService.listCategories());
    }
}
