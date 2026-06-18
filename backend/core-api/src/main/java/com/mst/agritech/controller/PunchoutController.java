package com.mst.agritech.controller;

import com.mst.agritech.dto.punchout.PunchoutCheckoutRequest;
import com.mst.agritech.dto.punchout.PunchoutCheckoutResponse;
import com.mst.agritech.dto.punchout.PunchoutSessionResponse;
import com.mst.agritech.dto.response.MarketplaceProductResponse;
import com.mst.agritech.service.punchout.PunchoutService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * cXML PunchOut endpoints (Ariba / Coupa / Jaggaer). Public — authenticated via the
 * shared secret carried inside the cXML Sender credential, not via JWT.
 */
@RestController
@RequestMapping("/api/v1/punchout")
@RequiredArgsConstructor
@Tag(name = "PunchOut", description = "cXML / OCI PunchOut integration for procurement systems")
public class PunchoutController {

    private final PunchoutService punchoutService;

    @PostMapping(value = "/setup",
            consumes = {MediaType.APPLICATION_XML_VALUE, MediaType.TEXT_XML_VALUE, "application/xml;charset=UTF-8"},
            produces = MediaType.APPLICATION_XML_VALUE)
    @Operation(summary = "Receive a cXML PunchOutSetupRequest and return a PunchOutSetupResponse with the StartPage URL")
    public ResponseEntity<String> setup(@RequestBody String cxmlBody) {
        return ResponseEntity.ok(punchoutService.handleCxmlSetup(cxmlBody));
    }

    @GetMapping("/session/{token}")
    @Operation(summary = "Get PunchOut session metadata for the marketplace landing page")
    public ResponseEntity<PunchoutSessionResponse> session(@PathVariable String token) {
        return ResponseEntity.ok(punchoutService.getSession(token));
    }

    @GetMapping("/session/{token}/products")
    @Operation(summary = "List marketplace products within an active PunchOut session")
    public ResponseEntity<List<MarketplaceProductResponse>> products(
            @PathVariable String token,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String category) {
        return ResponseEntity.ok(punchoutService.catalog(token, search, category));
    }

    @GetMapping("/session/{token}/categories")
    @Operation(summary = "List categories within an active PunchOut session")
    public ResponseEntity<List<String>> categories(@PathVariable String token) {
        return ResponseEntity.ok(punchoutService.categories(token));
    }

    @PostMapping("/session/{token}/checkout")
    @Operation(summary = "Transfer the buyer's cart back to their procurement system")
    public ResponseEntity<PunchoutCheckoutResponse> checkout(
            @PathVariable String token,
            @RequestBody PunchoutCheckoutRequest request) {
        return ResponseEntity.ok(punchoutService.checkout(token, request));
    }
}
