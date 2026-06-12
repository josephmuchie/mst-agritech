package com.mst.agritech.domain.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

@Entity
@Table(name = "countries")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Country {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @JdbcTypeCode(SqlTypes.CHAR)
    @Column(name = "iso_code", nullable = false, unique = true, length = 2)
    private String isoCode;

    @Column(nullable = false)
    private String name;

    private String region;

    @Column(name = "is_active", nullable = false)
    private boolean active = true;
}
