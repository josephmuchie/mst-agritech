package com.mst.agritech.domain.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "farmers")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Farmer {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "country_id", nullable = false)
    private Country country;

    @Column(name = "farm_name", nullable = false)
    private String farmName;

    private String province;

    @Column(name = "gps_latitude", precision = 10, scale = 7)
    private BigDecimal gpsLatitude;

    @Column(name = "gps_longitude", precision = 10, scale = 7)
    private BigDecimal gpsLongitude;

    @Column(name = "total_hectares", precision = 10, scale = 2)
    private BigDecimal totalHectares;

    @Column(name = "is_verified", nullable = false)
    private boolean verified = false;

    @Column(name = "verified_at")
    private LocalDateTime verifiedAt;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt = LocalDateTime.now();

    @PreUpdate
    public void onUpdate() { this.updatedAt = LocalDateTime.now(); }
}
