package com.mst.agritech.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TenantSsoConfigResponse {
    private Long tenantId;
    private String tenantSlug;
    private String tenantName;
    private boolean enabled;
    private String providerLabel;
    private String providerType;
    private String issuerUri;
    private String clientId;
    private boolean hasClientSecret;
    private String authorizationUri;
    private String tokenUri;
    private String userinfoUri;
    private String scopes;
    private boolean autoProvisionUsers;
    private boolean allowPasswordLogin;
    private String defaultRoleName;
    private String emailDomains;
}
