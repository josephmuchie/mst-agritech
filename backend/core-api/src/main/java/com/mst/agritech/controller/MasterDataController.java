package com.mst.agritech.controller;

import com.mst.agritech.domain.entity.*;
import com.mst.agritech.dto.request.*;
import com.mst.agritech.dto.response.AdminProductResponse;
import com.mst.agritech.dto.response.MarketPriceResponse;
import com.mst.agritech.service.MasterDataService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/master-data")
@RequiredArgsConstructor
@Tag(name = "Master Data", description = "Reference data management")
@SecurityRequirement(name = "bearerAuth")
public class MasterDataController {

    private final MasterDataService masterDataService;

    @GetMapping("/countries")
    @Operation(summary = "List countries")
    public ResponseEntity<List<Country>> getCountries(
            @RequestParam(defaultValue = "true") boolean activeOnly) {
        return ResponseEntity.ok(masterDataService.listCountries(activeOnly));
    }

    @PostMapping("/countries")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Country> createCountry(@Valid @RequestBody CountryRequest request) {
        return ResponseEntity.ok(masterDataService.createCountry(request));
    }

    @PutMapping("/countries/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Country> updateCountry(@PathVariable Long id, @Valid @RequestBody CountryRequest request) {
        return ResponseEntity.ok(masterDataService.updateCountry(id, request));
    }

    @DeleteMapping("/countries/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteCountry(@PathVariable Long id) {
        masterDataService.deleteCountry(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/currencies")
    @Operation(summary = "List currencies")
    public ResponseEntity<List<Currency>> getCurrencies(
            @RequestParam(defaultValue = "true") boolean activeOnly) {
        return ResponseEntity.ok(masterDataService.listCurrencies(activeOnly));
    }

    @PostMapping("/currencies")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Currency> createCurrency(@Valid @RequestBody CurrencyRequest request) {
        return ResponseEntity.ok(masterDataService.createCurrency(request));
    }

    @PutMapping("/currencies/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Currency> updateCurrency(@PathVariable Long id, @Valid @RequestBody CurrencyRequest request) {
        return ResponseEntity.ok(masterDataService.updateCurrency(id, request));
    }

    @DeleteMapping("/currencies/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteCurrency(@PathVariable Long id) {
        masterDataService.deleteCurrency(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/product-categories")
    @Operation(summary = "List product categories")
    public ResponseEntity<List<ProductCategory>> getProductCategories(
            @RequestParam(defaultValue = "true") boolean activeOnly) {
        return ResponseEntity.ok(masterDataService.listCategories(activeOnly));
    }

    @PostMapping("/product-categories")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ProductCategory> createCategory(@Valid @RequestBody ProductCategoryRequest request) {
        return ResponseEntity.ok(masterDataService.createCategory(request));
    }

    @PutMapping("/product-categories/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ProductCategory> updateCategory(
            @PathVariable Long id, @Valid @RequestBody ProductCategoryRequest request) {
        return ResponseEntity.ok(masterDataService.updateCategory(id, request));
    }

    @DeleteMapping("/product-categories/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteCategory(@PathVariable Long id) {
        masterDataService.deleteCategory(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/products")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<AdminProductResponse>> getProducts(
            @RequestParam(defaultValue = "false") boolean activeOnly) {
        return ResponseEntity.ok(masterDataService.listProducts(activeOnly));
    }

    @PostMapping("/products")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<AdminProductResponse> createProduct(@Valid @RequestBody ProductRequest request) {
        return ResponseEntity.ok(masterDataService.createProduct(request));
    }

    @PutMapping("/products/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<AdminProductResponse> updateProduct(
            @PathVariable Long id, @Valid @RequestBody ProductRequest request) {
        return ResponseEntity.ok(masterDataService.updateProduct(id, request));
    }

    @DeleteMapping("/products/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteProduct(@PathVariable Long id) {
        masterDataService.deleteProduct(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/market-prices")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<MarketPriceResponse>> getMarketPrices() {
        return ResponseEntity.ok(masterDataService.listMarketPrices());
    }

    @PostMapping("/market-prices")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<MarketPriceResponse> createMarketPrice(@Valid @RequestBody MarketPriceRequest request) {
        return ResponseEntity.ok(masterDataService.createMarketPrice(request));
    }

    @PutMapping("/market-prices/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<MarketPriceResponse> updateMarketPrice(
            @PathVariable Long id, @Valid @RequestBody MarketPriceRequest request) {
        return ResponseEntity.ok(masterDataService.updateMarketPrice(id, request));
    }

    @DeleteMapping("/market-prices/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteMarketPrice(@PathVariable Long id) {
        masterDataService.deleteMarketPrice(id);
        return ResponseEntity.noContent().build();
    }
}
