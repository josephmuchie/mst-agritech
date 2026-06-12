package com.mst.agritech.domain.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "external_invoices")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ExternalInvoice {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "integration_config_id", nullable = false)
    private IntegrationConfig integrationConfig;

    @Column(name = "external_id", nullable = false)
    private String externalId;

    @Column(name = "invoice_number", nullable = false)
    private String invoiceNumber;

    @Column(name = "buyer_name")
    private String buyerName;

    @Column(name = "order_reference")
    private String orderReference;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal amount;

    @JdbcTypeCode(SqlTypes.CHAR)
    @Column(name = "currency_code", nullable = false, length = 3)
    private String currencyCode = "USD";

    @Column(nullable = false)
    private String status = "IMPORTED";

    @Column(name = "issue_date")
    private LocalDate issueDate;

    @Column(name = "due_date")
    private LocalDate dueDate;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "raw_payload", columnDefinition = "jsonb")
    private String rawPayload;

    @Column(name = "synced_at", nullable = false, updatable = false)
    private LocalDateTime syncedAt = LocalDateTime.now();
}
