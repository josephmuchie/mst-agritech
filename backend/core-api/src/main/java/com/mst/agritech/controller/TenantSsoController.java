package com.mst.agritech.controller;

import com.mst.agritech.dto.request.UpdateTenantSsoConfigRequest;
import com.mst.agritech.dto.response.TenantSsoConfigResponse;
import com.mst.agritech.service.TenantSsoService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/tenants/sso")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
@SecurityRequirement(name = "bearerAuth")
@Tag(name = "Tenant SSO", description = "Admin configuration for organization single sign-on")
public class TenantSsoController {

    private final TenantSsoService tenantSsoService;

    @GetMapping
    @Operation(summary = "Get SSO configuration for the current admin tenant")
    public ResponseEntity<TenantSsoConfigResponse> getConfig() {
        return ResponseEntity.ok(tenantSsoService.getConfigForCurrentUser());
    }

    @PutMapping
    @Operation(summary = "Update SSO configuration for the current admin tenant")
    public ResponseEntity<TenantSsoConfigResponse> updateConfig(@RequestBody UpdateTenantSsoConfigRequest request) {
        return ResponseEntity.ok(tenantSsoService.updateConfig(request));
    }
}
