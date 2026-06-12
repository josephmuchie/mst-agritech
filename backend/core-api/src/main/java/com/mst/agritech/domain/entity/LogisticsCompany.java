package com.mst.agritech.domain.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "logistics_companies")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class LogisticsCompany {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(name = "company_type", nullable = false)
    private String companyType;

    @Column(name = "regions_served", columnDefinition = "TEXT")
    private String regionsServed;

    @Column(name = "tracking_api_url")
    private String trackingApiUrl;

    @Column(name = "api_key_encrypted")
    private String apiKeyEncrypted;

    @Column(name = "is_active", nullable = false)
    private boolean active = true;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();
}
