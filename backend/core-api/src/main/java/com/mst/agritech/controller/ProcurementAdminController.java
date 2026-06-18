package com.mst.agritech.controller;

import com.mst.agritech.dto.procurement.ProcurementSettingsResponse;
import com.mst.agritech.dto.procurement.UpdateProcurementSettingsRequest;
import com.mst.agritech.dto.punchout.PunchoutCredentialRequest;
import com.mst.agritech.dto.punchout.PunchoutCredentialResponse;
import com.mst.agritech.service.punchout.ProcurementSettingsService;
import com.mst.agritech.service.punchout.PunchoutCredentialService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Admin management of procurement integration: buyer PunchOut credentials and
 * service toggles / supplier identity. JWT + ADMIN only (kept off the public
 * {@code /api/v1/punchout/**} path which is shared-secret authenticated).
 */
@RestController
@RequestMapping("/api/v1/admin/procurement")
@RequiredArgsConstructor
@Tag(name = "Procurement Admin", description = "Manage PunchOut credentials and procurement service settings")
@SecurityRequirement(name = "bearerAuth")
@PreAuthorize("hasRole('ADMIN')")
public class ProcurementAdminController {

    private final PunchoutCredentialService credentialService;
    private final ProcurementSettingsService settingsService;

    // ── Service settings ──────────────────────────────────────────
    @GetMapping("/settings")
    @Operation(summary = "Get procurement service settings + live endpoint URLs")
    public ResponseEntity<ProcurementSettingsResponse> getSettings() {
        return ResponseEntity.ok(settingsService.getSettings());
    }

    @PutMapping("/settings")
    @Operation(summary = "Update procurement service toggles / supplier identity")
    public ResponseEntity<ProcurementSettingsResponse> updateSettings(
            @RequestBody UpdateProcurementSettingsRequest request) {
        return ResponseEntity.ok(settingsService.update(request));
    }

    // ── Buyer credentials ─────────────────────────────────────────
    @GetMapping("/credentials")
    @Operation(summary = "List buyer PunchOut credentials")
    public ResponseEntity<List<PunchoutCredentialResponse>> listCredentials() {
        return ResponseEntity.ok(credentialService.list());
    }

    @PostMapping("/credentials")
    @Operation(summary = "Create a buyer PunchOut credential")
    public ResponseEntity<PunchoutCredentialResponse> createCredential(
            @RequestBody PunchoutCredentialRequest request) {
        return ResponseEntity.ok(credentialService.create(request));
    }

    @PutMapping("/credentials/{id}")
    @Operation(summary = "Update a buyer PunchOut credential")
    public ResponseEntity<PunchoutCredentialResponse> updateCredential(
            @PathVariable Long id, @RequestBody PunchoutCredentialRequest request) {
        return ResponseEntity.ok(credentialService.update(id, request));
    }

    @DeleteMapping("/credentials/{id}")
    @Operation(summary = "Delete a buyer PunchOut credential")
    public ResponseEntity<Void> deleteCredential(@PathVariable Long id) {
        credentialService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
