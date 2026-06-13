package com.mst.agritech.controller;

import com.mst.agritech.dto.oracle.OracleCollectionResponse;
import com.mst.agritech.dto.oracle.PaymentDto;
import com.mst.agritech.dto.response.PaymentListResponse;
import com.mst.agritech.dto.response.PaymentSummaryResponse;
import com.mst.agritech.service.PaymentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/payments")
@RequiredArgsConstructor
@Tag(name = "Payments", description = "Payment transactions with Oracle-compatible field naming")
@SecurityRequirement(name = "bearerAuth")
public class PaymentController {

    private final PaymentService paymentService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','ANALYST')")
    @Operation(summary = "List payments (paginated, flat format for UI)")
    public ResponseEntity<Page<PaymentListResponse>> list(
            @Parameter(example = "0") @RequestParam(defaultValue = "0") int page,
            @Parameter(example = "20") @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return ResponseEntity.ok(paymentService.list(pageable));
    }

    @GetMapping("/summary")
    @PreAuthorize("hasAnyRole('ADMIN','ANALYST')")
    @Operation(summary = "Payment summary statistics")
    public ResponseEntity<PaymentSummaryResponse> summary() {
        return ResponseEntity.ok(paymentService.getSummary());
    }

    @GetMapping("/oracle")
    @PreAuthorize("hasAnyRole('ADMIN','ANALYST')")
    @Operation(
            summary = "List payments (Oracle REST collection format)",
            description = "Returns PaymentId, PaymentNumber, PaymentAmount, PaymentCurrencyCode, and related Oracle-standard fields.")
    public ResponseEntity<OracleCollectionResponse<PaymentDto>> listOracle(
            @Parameter(example = "25") @RequestParam(defaultValue = "25") int limit,
            @Parameter(example = "0") @RequestParam(defaultValue = "0") int offset) {
        return ResponseEntity.ok(paymentService.listOracle(limit, offset));
    }

    @GetMapping("/oracle/{paymentId}")
    @PreAuthorize("hasAnyRole('ADMIN','ANALYST')")
    @Operation(summary = "Get payment by PaymentId (Oracle format)")
    public ResponseEntity<PaymentDto> getOracle(
            @Parameter(example = "1") @PathVariable Long paymentId) {
        return ResponseEntity.ok(paymentService.getOracle(paymentId));
    }
}
