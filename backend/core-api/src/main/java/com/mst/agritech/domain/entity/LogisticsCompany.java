package com.mst.agritech.domain.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "logistics_companies")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class LogisticsCompany {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(name = "logistics_type", nullable = false)
    private String logisticsType;

    @Column(name = "tracking_url_template")
    private String trackingUrlTemplate;

    @Column(name = "api_endpoint")
    private String apiEndpoint;

    @Column(name = "is_active", nullable = false)
    private boolean active = true;
}
