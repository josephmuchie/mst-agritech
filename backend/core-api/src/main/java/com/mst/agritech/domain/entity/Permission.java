package com.mst.agritech.domain.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "permissions", uniqueConstraints = @UniqueConstraint(columnNames = {"resource","action"}))
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Permission {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String resource;

    @Column(nullable = false)
    private String action;
}
