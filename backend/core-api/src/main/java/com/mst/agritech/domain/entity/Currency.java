package com.mst.agritech.domain.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

@Entity
@Table(name = "currencies")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Currency {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @JdbcTypeCode(SqlTypes.CHAR)
    @Column(nullable = false, unique = true, length = 3)
    private String code;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, length = 10)
    private String symbol;

    @Column(name = "is_active", nullable = false)
    private boolean active = true;
}
