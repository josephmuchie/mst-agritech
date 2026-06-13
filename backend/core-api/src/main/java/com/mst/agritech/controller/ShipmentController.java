package com.mst.agritech.controller;

import com.mst.agritech.dto.oracle.OracleCollectionResponse;
import com.mst.agritech.dto.oracle.ShipmentDto;
import com.mst.agritech.dto.response.ShipmentListResponse;
import com.mst.agritech.service.ShipmentService;
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
@RequestMapping("/api/v1/shipments")
@RequiredArgsConstructor
@Tag(name = "Shipments", description = "Logistics shipments with Oracle-compatible field naming")
@SecurityRequirement(name = "bearerAuth")
public class ShipmentController {

    private final ShipmentService shipmentService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','LOGISTICS','ANALYST')")
    @Operation(summary = "List shipments (paginated, flat format for UI)")
    public ResponseEntity<Page<ShipmentListResponse>> list(
            @Parameter(example = "0") @RequestParam(defaultValue = "0") int page,
            @Parameter(example = "20") @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return ResponseEntity.ok(shipmentService.list(pageable));
    }

    @GetMapping("/oracle")
    @PreAuthorize("hasAnyRole('ADMIN','LOGISTICS','ANALYST')")
    @Operation(
            summary = "List shipments (Oracle REST collection format)",
            description = "Returns ShipmentId, ShipmentNumber, CarrierName, OriginLocation, DestinationLocation, and related fields.")
    public ResponseEntity<OracleCollectionResponse<ShipmentDto>> listOracle(
            @Parameter(example = "25") @RequestParam(defaultValue = "25") int limit,
            @Parameter(example = "0") @RequestParam(defaultValue = "0") int offset) {
        return ResponseEntity.ok(shipmentService.listOracle(limit, offset));
    }

    @GetMapping("/oracle/{shipmentId}")
    @PreAuthorize("hasAnyRole('ADMIN','LOGISTICS','ANALYST')")
    @Operation(summary = "Get shipment by ShipmentId (Oracle format)")
    public ResponseEntity<ShipmentDto> getOracle(
            @Parameter(example = "1") @PathVariable Long shipmentId) {
        return ResponseEntity.ok(shipmentService.getOracle(shipmentId));
    }
}
