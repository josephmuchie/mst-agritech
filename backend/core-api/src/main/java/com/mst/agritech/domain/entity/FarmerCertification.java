package com.mst.agritech.domain.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "farmer_certifications")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class FarmerCertification {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "farmer_id", nullable = false)
    private Farmer farmer;

    @Column(name = "cert_type", nullable = false)
    private String certType;

    @Column(name = "issuer")
    private String issuer;

    @Column(name = "issue_date")
    private java.time.LocalDate issueDate;

    @Column(name = "expiry_date")
    private java.time.LocalDate expiryDate;

    @Column(name = "document_url")
    private String documentUrl;

    @Column(name = "is_active", nullable = false)
    private boolean isActive = true;
}
