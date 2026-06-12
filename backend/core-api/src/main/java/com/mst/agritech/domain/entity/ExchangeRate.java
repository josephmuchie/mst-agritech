package com.mst.agritech.domain.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "exchange_rates")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ExchangeRate {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "from_currency_id", nullable = false)
    private Currency fromCurrency;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "to_currency_id", nullable = false)
    private Currency toCurrency;

    @Column(nullable = false, precision = 20, scale = 8)
    private BigDecimal rate;

    @Column(name = "recorded_at", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();
}
