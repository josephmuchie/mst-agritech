package com.mst.agritech.domain.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "tenant_sso_configs")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class TenantSsoConfig {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tenant_id", nullable = false, unique = true)
    private Tenant tenant;

    @Column(nullable = false)
    private boolean enabled = false;

    @Column(name = "provider_label", nullable = false, length = 100)
    private String providerLabel = "Corporate SSO";

    @Column(name = "provider_type", nullable = false, length = 30)
    private String providerType = "OIDC";

    @Column(name = "issuer_uri", length = 1000)
    private String issuerUri;

    @Column(name = "client_id", length = 500)
    private String clientId;

    @Column(name = "client_secret_encrypted", columnDefinition = "TEXT")
    private String clientSecretEncrypted;

    @Column(name = "authorization_uri", length = 1000)
    private String authorizationUri;

    @Column(name = "token_uri", length = 1000)
    private String tokenUri;

    @Column(name = "userinfo_uri", length = 1000)
    private String userinfoUri;

    @Column(nullable = false, length = 500)
    private String scopes = "openid profile email";

    @Column(name = "auto_provision_users", nullable = false)
    private boolean autoProvisionUsers = true;

    @Column(name = "allow_password_login", nullable = false)
    private boolean allowPasswordLogin = true;

    @Column(name = "default_role_name", nullable = false, length = 100)
    private String defaultRoleName = "FARMER";

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt = LocalDateTime.now();

    @PreUpdate
    public void onUpdate() { this.updatedAt = LocalDateTime.now(); }
}
