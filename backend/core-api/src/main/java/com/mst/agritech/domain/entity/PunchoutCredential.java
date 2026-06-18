package com.mst.agritech.domain.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/**
 * Shared-secret credentials used to authenticate inbound PunchOut setup requests
 * from buyer procurement systems (Ariba, Coupa, Oracle, SAP SRM).
 */
@Entity
@Table(name = "punchout_credentials")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class PunchoutCredential {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "buyer_name", nullable = false)
    private String buyerName;

    @Column(nullable = false)
    private String domain;

    @Column(nullable = false)
    private String identity;

    @Column(name = "shared_secret", nullable = false)
    private String sharedSecret;

    @Column(nullable = false)
    @Builder.Default
    private String protocol = "CXML";

    @Column(nullable = false)
    @Builder.Default
    private boolean active = true;

    @Column(name = "created_at", nullable = false, updatable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
}
