package com.mst.agritech.controller;

import com.mst.agritech.domain.entity.*;
import com.mst.agritech.repository.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/master-data")
@RequiredArgsConstructor
@Tag(name = "Master Data", description = "Reference data: countries, currencies, product categories")
@SecurityRequirement(name = "bearerAuth")
public class MasterDataController {

    private final CountryRepository countryRepository;
    private final CurrencyRepository currencyRepository;
    private final ProductCategoryRepository productCategoryRepository;

    @GetMapping("/countries")
    @Operation(summary = "List all active countries")
    public ResponseEntity<List<Country>> getCountries() {
        return ResponseEntity.ok(countryRepository.findByActiveTrue());
    }

    @GetMapping("/currencies")
    @Operation(summary = "List all active currencies")
    public ResponseEntity<List<Currency>> getCurrencies() {
        return ResponseEntity.ok(currencyRepository.findByActiveTrue());
    }

    @GetMapping("/product-categories")
    @Operation(summary = "List all active product categories")
    public ResponseEntity<List<ProductCategory>> getProductCategories() {
        return ResponseEntity.ok(productCategoryRepository.findByActiveTrue());
    }
}
