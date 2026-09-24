package com.mst.agritech.controller;

import com.mst.agritech.dto.request.DesktopSyncRequest;
import com.mst.agritech.dto.response.DesktopSyncResponse;
import com.mst.agritech.service.DesktopSyncService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/desktop-sync")
@RequiredArgsConstructor
@Tag(name = "Desktop Sync", description = "Offline desktop client sync endpoint")
public class DesktopSyncController {

    private final DesktopSyncService desktopSyncService;

    @PostMapping("/changes")
    @Operation(summary = "Accept queued offline desktop changes")
    public ResponseEntity<DesktopSyncResponse> syncChanges(
            @Valid @RequestBody DesktopSyncRequest request,
            Authentication authentication) {
        return ResponseEntity.accepted().body(desktopSyncService.sync(request, authentication));
    }
}
