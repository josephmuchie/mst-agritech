package com.mst.agritech.controller;

import com.mst.agritech.dto.request.SsoCallbackRequest;
import com.mst.agritech.dto.response.AuthResponse;
import com.mst.agritech.dto.response.SsoAuthorizeResponse;
import com.mst.agritech.dto.response.SsoDiscoverResponse;
import com.mst.agritech.service.SsoService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;

@RestController
@RequestMapping("/api/v1/auth/sso")
@RequiredArgsConstructor
@Tag(name = "Authentication", description = "Single sign-on (SSO) discovery and OIDC callback")
public class SsoController {

    private final SsoService ssoService;

    @GetMapping("/discover")
    @Operation(summary = "Discover SSO options for an email or tenant")
    public ResponseEntity<SsoDiscoverResponse> discover(
            @RequestParam(required = false) String email,
            @RequestParam(required = false) String tenantSlug) {
        return ResponseEntity.ok(ssoService.discover(email, tenantSlug));
    }

    @GetMapping("/authorize")
    @Operation(summary = "Start SSO authorization and return identity provider URL")
    public ResponseEntity<SsoAuthorizeResponse> authorize(
            @RequestParam String tenantSlug,
            @RequestParam(required = false) String redirectUri,
            @RequestParam(required = false) String emailHint) {
        return ResponseEntity.ok(ssoService.authorize(tenantSlug, redirectUri, emailHint));
    }

    @PostMapping("/callback")
    @Operation(summary = "Complete SSO login by exchanging authorization code for JWT tokens")
    public ResponseEntity<AuthResponse> callback(@Valid @RequestBody SsoCallbackRequest request) {
        return ResponseEntity.ok(ssoService.handleCallback(request));
    }

    @GetMapping("/mock-authorize")
    @Operation(summary = "Mock identity provider redirect (development only)")
    public ResponseEntity<Void> mockAuthorize(@RequestParam String state) {
        String redirectUrl = ssoService.buildMockAuthorizeRedirect(state);
        return ResponseEntity.status(302).location(URI.create(redirectUrl)).build();
    }
}
