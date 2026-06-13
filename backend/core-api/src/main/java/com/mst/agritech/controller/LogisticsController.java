package com.mst.agritech.controller;

import com.mst.agritech.dto.response.LogisticsCompanyResponse;
import com.mst.agritech.service.LogisticsService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/logistics")
@RequiredArgsConstructor
@Tag(name = "Logistics", description = "Freight and logistics company directory")
@SecurityRequirement(name = "bearerAuth")
public class LogisticsController {

    private final LogisticsService logisticsService;

    @GetMapping("/companies")
    @PreAuthorize("hasAnyRole('ADMIN','LOGISTICS','ANALYST')")
    @Operation(summary = "List logistics companies")
    public ResponseEntity<List<LogisticsCompanyResponse>> listCompanies() {
        return ResponseEntity.ok(logisticsService.listAll());
    }
}
