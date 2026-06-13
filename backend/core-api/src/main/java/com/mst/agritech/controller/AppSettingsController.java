package com.mst.agritech.controller;

import com.mst.agritech.dto.request.UpdateAppSettingsRequest;
import com.mst.agritech.dto.response.AppSettingsResponse;
import com.mst.agritech.service.AppSettingsService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/settings")
@RequiredArgsConstructor
@Tag(name = "Settings", description = "General platform settings")
@SecurityRequirement(name = "bearerAuth")
public class AppSettingsController {

    private final AppSettingsService appSettingsService;

    @GetMapping("/general")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get general platform settings")
    public ResponseEntity<AppSettingsResponse> getGeneral() {
        return ResponseEntity.ok(appSettingsService.getGeneralSettings());
    }

    @PutMapping("/general")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Update general platform settings")
    public ResponseEntity<AppSettingsResponse> updateGeneral(@RequestBody UpdateAppSettingsRequest request) {
        return ResponseEntity.ok(appSettingsService.updateGeneralSettings(request));
    }
}
