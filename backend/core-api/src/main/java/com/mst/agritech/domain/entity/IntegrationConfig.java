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

    @Column(name = "system_type", nullable = false)
    private String systemType;

    @Column(name = "display_name", nullable = false)
    private String displayName;

    @Column(name = "endpoint_url")
    private String endpointUrl;

    @Column(name = "credentials_encrypted", columnDefinition = "TEXT")
    private String credentialsEncrypted;

    @Column(name = "extra_config", columnDefinition = "jsonb")
    private String extraConfig;

    @Column(name = "is_active", nullable = false)
    private boolean active = false;

    @Column(name = "last_sync_at")
    private LocalDateTime lastSyncAt;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt = LocalDateTime.now();

    @PreUpdate
    public void onUpdate() { this.updatedAt = LocalDateTime.now(); }
}
