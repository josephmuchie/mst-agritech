package com.mst.agritech.domain.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "farmer_certifications")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class FarmerCertification {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "farmer_id", nullable = false)
    private Farmer farmer;

    @Column(name = "certification_type", nullable = false)
    private String certificationType;

    @Column(name = "issuing_body")
    private String issuingBody;

    @Column(name = "certificate_number")
    private String certificateNumber;

    @Column(name = "issued_date")
    private java.time.LocalDate issuedDate;

    @Column(name = "expiry_date")
    private java.time.LocalDate expiryDate;

    @Column(name = "document_url")
    private String documentUrl;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();
}
