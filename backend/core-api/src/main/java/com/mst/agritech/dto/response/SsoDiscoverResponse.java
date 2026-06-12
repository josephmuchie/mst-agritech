package com.mst.agritech.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SsoDiscoverResponse {
    private boolean ssoEnabled;
    private String tenantSlug;
    private String tenantName;
    private String providerLabel;
    private boolean allowPasswordLogin;
}
