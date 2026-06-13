package com.mst.agritech.service;

import com.mst.agritech.domain.entity.Order;
import com.mst.agritech.dto.response.OrderResponse;
import com.mst.agritech.exception.ResourceNotFoundException;
import com.mst.agritech.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;
    private final NotificationService notificationService;

    public Page<OrderResponse> findAll(Pageable pageable) {
        return orderRepository.findAll(pageable).map(this::toResponse);
    }

    public OrderResponse findById(Long id) {
        return toResponse(orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order", id)));
    }

    public Page<OrderResponse> findByStatus(String status, Pageable pageable) {
        return orderRepository.findByStatus(status, pageable).map(this::toResponse);
    }

    @Transactional
    public OrderResponse updateStatus(Long id, String newStatus) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order", id));
        order.setStatus(newStatus);
        Order saved = orderRepository.save(order);
        notificationService.notifyAdmins(
                "Order " + saved.getReference(),
                "Order status changed to " + newStatus,
                "ORDER",
                "Order",
                String.valueOf(saved.getId()));
        return toResponse(saved);
    }

    public long count() { return orderRepository.count(); }
    public long countByStatus(String status) { return orderRepository.countByStatus(status); }
    public BigDecimal totalRevenue() { return orderRepository.sumDeliveredRevenue(); }

    private OrderResponse toResponse(Order o) {
        return OrderResponse.builder()
                .id(o.getId())
                .reference(o.getReference())
                .farmerId(o.getFarmer().getId())
                .farmerName(o.getFarmer().getUser().getFullName())
                .buyerId(o.getBuyer().getId())
                .buyerCompanyName(o.getBuyer().getCompanyName())
                .status(o.getStatus())
                .totalAmount(o.getTotalAmount())
                .currencyCode(o.getCurrency() != null ? o.getCurrency().getCode() : null)
                .notes(o.getNotes())
                .createdAt(o.getCreatedAt())
                .updatedAt(o.getUpdatedAt())
                .build();
    }
}
