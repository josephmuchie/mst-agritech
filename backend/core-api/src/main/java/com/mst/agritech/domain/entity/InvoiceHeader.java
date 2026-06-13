package com.mst.agritech.domain.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "invoice_headers")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class InvoiceHeader {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "invoice_id", nullable = false, unique = true)
    private String invoiceId;

    @Column(name = "invoice_number", nullable = false)
    private String invoiceNumber;

    @Column(name = "business_unit")
    private String businessUnit;

    @Column(name = "legal_entity")
    private String legalEntity;

    @Column(name = "invoice_type")
    private String invoiceType;

    @Column(name = "invoice_date")
    private LocalDate invoiceDate;

    @Column(name = "accounting_date")
    private LocalDate accountingDate;

    @Column(name = "invoice_amount", nullable = false, precision = 12, scale = 2)
    private BigDecimal invoiceAmount;

    @JdbcTypeCode(SqlTypes.CHAR)
    @Column(name = "invoice_currency_code", nullable = false, length = 3)
    private String invoiceCurrencyCode = "USD";

    @Column(name = "payment_status_flag")
    private String paymentStatusFlag;

    @Column(name = "validation_status")
    private String validationStatus;

    @Column(name = "supplier_number")
    private String supplierNumber;

    @Column(name = "supplier_site")
    private String supplierSite;

    @Column(name = "bill_to_customer_name")
    private String billToCustomerName;

    @Column(name = "purchase_order_number")
    private String purchaseOrderNumber;

    @Column(name = "payment_terms")
    private String paymentTerms;

    @Column(name = "due_date")
    private LocalDate dueDate;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "conversion_rate", precision = 20, scale = 8)
    private BigDecimal conversionRate;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id")
    private Order order;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "integration_config_id")
    private IntegrationConfig integrationConfig;

    @Column(name = "created_by")
    private String createdBy;

    @Column(name = "creation_date", nullable = false, updatable = false)
    private LocalDateTime creationDate = LocalDateTime.now();

    @Column(name = "last_update_date", nullable = false)
    private LocalDateTime lastUpdateDate = LocalDateTime.now();

    @Column(name = "last_updated_by")
    private String lastUpdatedBy;

    @PreUpdate
    public void onUpdate() {
        this.lastUpdateDate = LocalDateTime.now();
    }
}
