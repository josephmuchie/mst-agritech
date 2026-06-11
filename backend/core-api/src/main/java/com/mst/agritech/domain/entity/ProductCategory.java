package com.mst.agritech.domain.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "product_categories")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ProductCategory {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_id")
    private ProductCategory parent;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "is_active", nullable = false)
    private boolean active = true;
}
