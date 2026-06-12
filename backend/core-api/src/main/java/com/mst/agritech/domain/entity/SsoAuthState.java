package com.mst.agritech.domain.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "sso_auth_states")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class SsoAuthState {

    @Id
    @Column(length = 64)
    private String state;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tenant_id", nullable = false)
    private Tenant tenant;

    @Column(name = "code_verifier", nullable = false, length = 128)
    private String codeVerifier;

    @Column(name = "redirect_uri", nullable = false, length = 1000)
    private String redirectUri;

    @Column(name = "email_hint", length = 255)
    private String emailHint;

    @Column(name = "expires_at", nullable = false)
    private LocalDateTime expiresAt;
}
