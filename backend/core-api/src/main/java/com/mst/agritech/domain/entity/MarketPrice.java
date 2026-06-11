package com.mst.agritech.domain.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "market_prices")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class MarketPrice {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "country_id", nullable = false)
    private Country country;

    @Column(name = "price_date", nullable = false)
    private LocalDate priceDate;

    @Column(name = "price_usd", nullable = false, precision = 10, scale = 4)
    private BigDecimal priceUsd;

    @Column(name = "source")
    private String source;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();
}
