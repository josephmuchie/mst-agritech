package com.mst.agritech.domain.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "invoice_lines")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class InvoiceLine {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "invoice_line_id", nullable = false, unique = true)
    private String invoiceLineId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "invoice_header_id", nullable = false)
    private InvoiceHeader invoiceHeader;

    @Column(name = "line_number", nullable = false)
    private Integer lineNumber;

    @Column(name = "line_type_lookup_code")
    private String lineTypeLookupCode;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal amount;

    @Column(name = "quantity_invoiced", precision = 12, scale = 4)
    private BigDecimal quantityInvoiced;

    @Column(name = "unit_price", precision = 12, scale = 4)
    private BigDecimal unitPrice;

    @Column(name = "item_description")
    private String itemDescription;

    @Column(name = "uom_code")
    private String uomCode;

    @Column(name = "tax_classification_code")
    private String taxClassificationCode;

    @Column(name = "line_source")
    private String lineSource;

    @Column(name = "created_by")
    private String createdBy;

    @Column(name = "creation_date", nullable = false, updatable = false)
    private LocalDateTime creationDate = LocalDateTime.now();
}
