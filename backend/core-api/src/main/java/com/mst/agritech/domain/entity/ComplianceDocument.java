package com.mst.agritech.domain.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "compliance_documents")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ComplianceDocument {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "shipment_id", nullable = false)
    private Shipment shipment;

    @Column(name = "doc_type", nullable = false)
    private String docType;

    @Column(name = "document_url", nullable = false)
    private String documentUrl;

    @Column(name = "issued_by")
    private String issuedBy;

    @Column(name = "expiry_date")
    private java.time.LocalDate expiryDate;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();
}
