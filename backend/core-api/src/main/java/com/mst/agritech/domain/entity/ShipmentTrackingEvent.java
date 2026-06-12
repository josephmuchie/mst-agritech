package com.mst.agritech.domain.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "shipment_tracking_events")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ShipmentTrackingEvent {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "shipment_id", nullable = false)
    private Shipment shipment;

    @Column(name = "gps_latitude", precision = 10, scale = 7)
    private BigDecimal gpsLatitude;

    @Column(name = "gps_longitude", precision = 10, scale = 7)
    private BigDecimal gpsLongitude;

    @Column(name = "temperature_celsius", precision = 5, scale = 2)
    private BigDecimal temperatureCelsius;

    @Column(name = "humidity_percent", precision = 5, scale = 2)
    private BigDecimal humidityPercent;

    @Column(name = "status_event", nullable = false)
    private String statusEvent;

    @Column(name = "event_source", nullable = false)
    private String eventSource = "MANUAL";

    @Column(name = "recorded_at", nullable = false, updatable = false)
    private LocalDateTime recordedAt = LocalDateTime.now();
}
