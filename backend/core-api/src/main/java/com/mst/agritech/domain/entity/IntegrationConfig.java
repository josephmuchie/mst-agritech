package com.mst.agritech.domain.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "integration_configs")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class IntegrationConfig {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "integration_system", nullable = false, unique = true)
    private String integrationSystem;

    @Column(name = "base_url")
    private String baseUrl;

    @Column(name = "api_key_encrypted")
    private String apiKeyEncrypted;

    @Column(name = "client_id")
    private String clientId;

    @Column(name = "is_active", nullable = false)
    private boolean active = false;

    @Column(name = "environment")
    private String environment = "sandbox";

    @Column(name = "extra_config", columnDefinition = "TEXT")
    private String extraConfig;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt = LocalDateTime.now();

    @PreUpdate
    public void onUpdate() { this.updatedAt = LocalDateTime.now(); }
}
