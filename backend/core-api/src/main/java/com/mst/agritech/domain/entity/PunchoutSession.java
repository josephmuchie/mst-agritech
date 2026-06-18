package com.mst.agritech.domain.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/**
 * Represents a single buyer PunchOut browse session. Created when a procurement
 * system sends a PunchOutSetupRequest (cXML) or OCI start request, and consumed
 * when the buyer transfers their cart back as a PunchOutOrderMessage / OCI form post.
 */
@Entity
@Table(name = "punchout_sessions")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class PunchoutSession {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "session_token", nullable = false, unique = true)
    private String sessionToken;

    @Column(nullable = false)
    @Builder.Default
    private String protocol = "CXML";

    private String operation;

    @Column(name = "buyer_cookie", columnDefinition = "TEXT")
    private String buyerCookie;

    @Column(name = "from_identity")
    private String fromIdentity;

    @Column(name = "to_identity")
    private String toIdentity;

    @Column(name = "sender_identity")
    private String senderIdentity;

    @Column(name = "buyer_user")
    private String buyerUser;

    @Column(name = "browser_form_post_url", columnDefinition = "TEXT")
    private String browserFormPostUrl;

    @Column(name = "hook_url", columnDefinition = "TEXT")
    private String hookUrl;

    @Column(nullable = false)
    @Builder.Default
    private String status = "ACTIVE";

    @Column(name = "created_at", nullable = false, updatable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "expires_at")
    private LocalDateTime expiresAt;
}
