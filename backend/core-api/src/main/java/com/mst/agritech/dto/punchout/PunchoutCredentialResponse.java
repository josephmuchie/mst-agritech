package com.mst.agritech.dto.punchout;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

/** Buyer PunchOut credential view. The shared secret is never returned; only its presence is indicated. */
@Data
@Builder
public class PunchoutCredentialResponse {
    private Long id;
    private String buyerName;
    private String domain;
    private String identity;
    private String protocol;
    private boolean active;
    private boolean hasSecret;
    private LocalDateTime createdAt;
}
