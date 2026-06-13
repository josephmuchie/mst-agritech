package com.mst.agritech.controller;

import com.mst.agritech.dto.oracle.InvoiceDistributionDto;
import com.mst.agritech.dto.oracle.InvoiceHeaderDto;
import com.mst.agritech.dto.oracle.InvoiceLineDto;
import com.mst.agritech.dto.oracle.OracleCollectionResponse;
import com.mst.agritech.service.InvoiceService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.ExampleObject;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/invoices")
@RequiredArgsConstructor
@Tag(name = "Invoices", description = "Oracle Fusion-compatible invoice header, line, and distribution resources")
@SecurityRequirement(name = "bearerAuth")
public class InvoiceController {

    private final InvoiceService invoiceService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','ANALYST')")
    @Operation(
            summary = "List invoice headers",
            description = "Returns invoice headers in Oracle REST collection format with standard Fusion field names.")
    @ApiResponse(responseCode = "200", description = "Invoice header collection",
            content = @Content(examples = @ExampleObject(value = """
                    {
                      "items": [{
                        "InvoiceId": "100001",
                        "InvoiceNumber": "INV-2026-001",
                        "BusinessUnit": "MST BU ZW",
                        "InvoiceAmount": 4200.00,
                        "InvoiceCurrencyCode": "USD",
                        "BillToCustomerName": "Woolworths SA",
                        "PurchaseOrder": "ORD-20260601-001",
                        "PaymentStatusFlag": "Y",
                        "ValidationStatus": "Validated"
                      }],
                      "count": 1,
                      "hasMore": false,
                      "totalResults": 1,
                      "limit": 25,
                      "offset": 0
                    }
                    """)))
    public ResponseEntity<OracleCollectionResponse<InvoiceHeaderDto>> list(
            @Parameter(description = "Page size (Oracle limit)", example = "25") @RequestParam(defaultValue = "25") int limit,
            @Parameter(description = "Zero-based offset", example = "0") @RequestParam(defaultValue = "0") int offset) {
        return ResponseEntity.ok(invoiceService.listHeaders(limit, offset));
    }

    @GetMapping("/{invoiceId}")
    @PreAuthorize("hasAnyRole('ADMIN','ANALYST')")
    @Operation(summary = "Get invoice header by InvoiceId")
    public ResponseEntity<InvoiceHeaderDto> get(
            @Parameter(description = "Oracle InvoiceId", example = "100001") @PathVariable String invoiceId) {
        return ResponseEntity.ok(invoiceService.getHeader(invoiceId));
    }

    @GetMapping("/{invoiceId}/child/invoiceLines")
    @PreAuthorize("hasAnyRole('ADMIN','ANALYST')")
    @Operation(
            summary = "List invoice lines for a header",
            description = "Child collection matching Oracle path: invoices/{InvoiceId}/child/invoiceLines")
    public ResponseEntity<OracleCollectionResponse<InvoiceLineDto>> listLines(
            @Parameter(example = "100001") @PathVariable String invoiceId) {
        return ResponseEntity.ok(invoiceService.listLines(invoiceId));
    }

    @GetMapping("/{invoiceId}/child/invoiceLines/{invoiceLineId}/child/invoiceDistributions")
    @PreAuthorize("hasAnyRole('ADMIN','ANALYST')")
    @Operation(
            summary = "List invoice distributions for a line",
            description = "Child collection matching Oracle path for GL distributions")
    public ResponseEntity<OracleCollectionResponse<InvoiceDistributionDto>> listDistributions(
            @Parameter(example = "100001") @PathVariable String invoiceId,
            @Parameter(example = "200001") @PathVariable String invoiceLineId) {
        return ResponseEntity.ok(invoiceService.listDistributions(invoiceId, invoiceLineId));
    }
}
