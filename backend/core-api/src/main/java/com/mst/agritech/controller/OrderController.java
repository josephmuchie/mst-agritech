package com.mst.agritech.controller;

import com.mst.agritech.dto.response.OrderResponse;
import com.mst.agritech.service.OrderService;
import io.swagger.v3.oas.annotations.Operation;
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

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','ANALYST')")
    @Operation(summary = "List all orders (paginated)")
    public ResponseEntity<Page<OrderResponse>> list(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String status) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        if (status != null && !status.isBlank()) {
            return ResponseEntity.ok(orderService.findByStatus(status, pageable));
        }
        return ResponseEntity.ok(orderService.findAll(pageable));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','FARMER','BUYER','ANALYST')")
    @Operation(summary = "Get order by ID")
    public ResponseEntity<OrderResponse> get(@PathVariable Long id) {
        return ResponseEntity.ok(orderService.findById(id));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN','LOGISTICS')")
    @Operation(summary = "Update order status")
    public ResponseEntity<OrderResponse> updateStatus(
            @PathVariable Long id,
            @RequestParam String status) {
        return ResponseEntity.ok(orderService.updateStatus(id, status));
    }
}
