package com.mst.agritech.domain.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "invoice_distributions")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class InvoiceDistribution {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "invoice_distribution_id", nullable = false, unique = true)
    private String invoiceDistributionId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "invoice_line_id", nullable = false)
    private InvoiceLine invoiceLine;

    @Column(name = "distribution_line_number", nullable = false)
    private Integer distributionLineNumber;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal amount;

    @Column(name = "dist_code_combination_id")
    private String distCodeCombinationId;

    @Column(name = "accounting_date")
    private LocalDate accountingDate;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "distribution_class")
    private String distributionClass;

    @Column(name = "created_by")
    private String createdBy;

    @Column(name = "creation_date", nullable = false, updatable = false)
    private LocalDateTime creationDate = LocalDateTime.now();
}
