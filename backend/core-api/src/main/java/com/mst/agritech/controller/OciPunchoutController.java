package com.mst.agritech.controller;

import com.mst.agritech.service.punchout.PunchoutService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

/**
 * Oracle OCI (Open Catalog Interface) entry point used by Oracle iProcurement / SAP SRM.
 * The buyer system redirects the user's browser here with a HOOK_URL; we create a session
 * and redirect into the marketplace landing page. Public — no JWT.
 */
@RestController
@RequestMapping("/api/v1/oci")
@RequiredArgsConstructor
@Tag(name = "PunchOut", description = "cXML / OCI PunchOut integration for procurement systems")
public class OciPunchoutController {

    private final PunchoutService punchoutService;

    @Value("${app.frontend-url}")
    private String frontendUrl;

    @RequestMapping(value = "/start", method = {RequestMethod.GET, RequestMethod.POST})
    @Operation(summary = "OCI catalog entry — creates a session and redirects the buyer to the marketplace")
    public void start(
            @RequestParam(name = "HOOK_URL", required = false) String hookUrl,
            @RequestParam(name = "hook_url", required = false) String hookUrlLower,
            @RequestParam(name = "username", required = false) String username,
            @RequestParam(name = "password", required = false) String password,
            @RequestParam(name = "OPERATION", required = false) String operation,
            HttpServletResponse response) throws IOException {

        String hook = hookUrl != null ? hookUrl : hookUrlLower;
        String token = punchoutService.handleOciStart(hook, username, password, operation);
        String target = frontendUrl + "/punchout?sid=" + URLEncoder.encode(token, StandardCharsets.UTF_8) + "&proto=OCI";
        response.sendRedirect(target);
    }
}
