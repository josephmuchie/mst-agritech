package com.mst.agritech.domain.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "shipments")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Shipment {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false)
    private Order order;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "logistics_company_id")
    private LogisticsCompany logisticsCompany;

    @Column(name = "shipment_type", nullable = false)
    private String shipmentType;

    @Column(name = "min_temp_celsius", precision = 5, scale = 2)
    private BigDecimal minTempCelsius;

    @Column(name = "max_temp_celsius", precision = 5, scale = 2)
    private BigDecimal maxTempCelsius;

    @Column(name = "tracking_number")
    private String trackingNumber;

    @Column(nullable = false)
    private String status = "PENDING";

    @Column(name = "estimated_departure")
    private LocalDateTime estimatedDeparture;

    @Column(name = "estimated_arrival")
    private LocalDateTime estimatedArrival;

    @Column(name = "actual_arrival")
    private LocalDateTime actualArrival;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt = LocalDateTime.now();

    @PreUpdate
    public void onUpdate() { this.updatedAt = LocalDateTime.now(); }
}
