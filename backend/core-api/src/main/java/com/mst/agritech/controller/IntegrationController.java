package com.mst.agritech.controller;

import com.mst.agritech.dto.request.InvokeIntegrationRequest;
import com.mst.agritech.dto.request.UpdateIntegrationConfigRequest;
import com.mst.agritech.dto.request.UpdateIntegrationSettingsRequest;
import com.mst.agritech.dto.response.*;
import com.mst.agritech.service.IntegrationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/integrations")
@RequiredArgsConstructor
@Tag(name = "Integrations", description = "ERP connectors, invoke/sync, and invoice import")
@SecurityRequirement(name = "bearerAuth")
public class IntegrationController {

    private final IntegrationService integrationService;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "List all integration connectors")
    public ResponseEntity<List<IntegrationConfigResponse>> list() {
        return ResponseEntity.ok(integrationService.listConfigs());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get integration connector by ID")
    public ResponseEntity<IntegrationConfigResponse> get(
            @Parameter(description = "Integration config ID") @PathVariable Long id) {
        return ResponseEntity.ok(integrationService.getConfig(id));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(
            summary = "Update integration connector configuration",
            description = "Configure endpoint URL, credentials, extra JSON config, and active status.")
    public ResponseEntity<IntegrationConfigResponse> update(
            @PathVariable Long id,
            @RequestBody UpdateIntegrationConfigRequest request) {
        return ResponseEntity.ok(integrationService.updateConfig(id, request));
    }

    @PostMapping("/{id}/invoke")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(
            summary = "Manually invoke an integration flow",
            description = "Triggers a data sync for the given flow type (e.g. INVOICES). Oracle ERP connector imports invoices into the platform.")
    public ResponseEntity<IntegrationInvokeResponse> invoke(
            @PathVariable Long id,
            @Valid @RequestBody InvokeIntegrationRequest request) {
        return ResponseEntity.ok(integrationService.invoke(id, request));
    }

    @GetMapping("/{id}/runs")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "List sync/invoke run history for a connector")
    public ResponseEntity<Page<IntegrationSyncRunResponse>> listRuns(
            @PathVariable Long id,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(integrationService.listSyncRuns(id,
                PageRequest.of(page, size, Sort.by("startedAt").descending())));
    }

    @GetMapping("/{id}/invoices")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "List invoices imported from a connector")
    public ResponseEntity<Page<ExternalInvoiceResponse>> listInvoices(
            @PathVariable Long id,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(integrationService.listInvoices(id,
                PageRequest.of(page, size, Sort.by("syncedAt").descending())));
    }

    @GetMapping("/settings")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get global integration settings")
    public ResponseEntity<IntegrationSettingsResponse> getSettings() {
        return ResponseEntity.ok(integrationService.getSettings());
    }

    @PutMapping("/settings")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Update global integration settings")
    public ResponseEntity<IntegrationSettingsResponse> updateSettings(
            @RequestBody UpdateIntegrationSettingsRequest request) {
        return ResponseEntity.ok(integrationService.updateSettings(request));
    }
}
