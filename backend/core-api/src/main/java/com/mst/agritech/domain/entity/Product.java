package com.mst.agritech.domain.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "products")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Product {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id", nullable = false)
    private ProductCategory category;

    @Column(name = "unit_of_measure", nullable = false)
    private String unitOfMeasure;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "hs_code")
    private String hsCode;

    @Column(name = "sku")
    private String sku;

    @Column(name = "image_url")
    private String imageUrl;

    @Column(name = "origin_region")
    private String originRegion;

    @Column(name = "packaging")
    private String packaging;

    @Column(name = "certifications")
    private String certifications;

    @Column(name = "incoterms")
    private String incoterms;

    @Column(name = "min_order_quantity", precision = 12, scale = 2)
    private java.math.BigDecimal minOrderQuantity;

    @Column(name = "lead_time_days")
    private Integer leadTimeDays;

    @Column(name = "shelf_life_days")
    private Integer shelfLifeDays;

    @Column(name = "unspsc_code")
    private String unspscCode;

    @Column(name = "requires_cold_chain", nullable = false)
    @Builder.Default
    private boolean requiresColdChain = false;

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private boolean active = true;

    @Column(name = "created_at", nullable = false, updatable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
}
