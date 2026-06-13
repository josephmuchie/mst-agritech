package com.mst.agritech.controller;

import com.mst.agritech.dto.oracle.OrderLineDto;
import com.mst.agritech.dto.oracle.OracleCollectionResponse;
import com.mst.agritech.dto.response.OrderResponse;
import com.mst.agritech.service.AnalyticsService;
import com.mst.agritech.service.OrderService;
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
@RequestMapping("/api/v1/orders")
@RequiredArgsConstructor
@Tag(name = "Orders", description = "Order lifecycle management")
@SecurityRequirement(name = "bearerAuth")
public class OrderController {

    private final OrderService orderService;
    private final AnalyticsService analyticsService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','ANALYST')")
    @Operation(
            summary = "List all orders (paginated)",
            description = "Returns orders sorted by creation date. Optionally filter by status: QUOTED, ACCEPTED, IN_PRODUCTION, SHIPPED, DELIVERED, CANCELLED.")
    public ResponseEntity<Page<OrderResponse>> list(
            @Parameter(description = "Page number (zero-based)", example = "0") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Number of records per page", example = "20") @RequestParam(defaultValue = "20") int size,
            @Parameter(description = "Filter by order status", example = "SHIPPED") @RequestParam(required = false) String status) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        if (status != null && !status.isBlank()) {
            return ResponseEntity.ok(orderService.findByStatus(status, pageable));
        }
        return ResponseEntity.ok(orderService.findAll(pageable));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','FARMER','BUYER','ANALYST')")
    @Operation(
            summary = "Get order by ID",
            description = "Retrieves full order details including farmer, buyer, amount, currency, and current status.")
    public ResponseEntity<OrderResponse> get(
            @Parameter(description = "Order ID", example = "1") @PathVariable Long id) {
        return ResponseEntity.ok(orderService.findById(id));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN','LOGISTICS')")
    @Operation(
            summary = "Update order status",
            description = "Transitions an order to a new lifecycle status. Requires ADMIN or LOGISTICS role.")
    public ResponseEntity<OrderResponse> updateStatus(
            @Parameter(description = "Order ID", example = "1") @PathVariable Long id,
            @Parameter(description = "New status value", example = "SHIPPED", required = true) @RequestParam String status) {
        return ResponseEntity.ok(orderService.updateStatus(id, status));
    }

    @GetMapping("/{id}/child/orderLines")
    @PreAuthorize("hasAnyRole('ADMIN','FARMER','BUYER','ANALYST')")
    @Operation(
            summary = "List order lines for an order",
            description = "Child collection with Oracle-standard order line fields (ItemDescription, OrderedQuantity, UnitSellingPrice, etc.)")
    public ResponseEntity<OracleCollectionResponse<OrderLineDto>> listOrderLines(
            @Parameter(description = "Order ID", example = "1") @PathVariable Long id) {
        return ResponseEntity.ok(analyticsService.getOrderLines(id));
    }
}
