package com.mst.agritech.dto.request;

import lombok.Data;

@Data
public class UpdateTenantSsoConfigRequest {
    private Boolean enabled;
    private String providerLabel;
    private String providerType;
    private String issuerUri;
    private String clientId;
    private String clientSecret;
    private String authorizationUri;
    private String tokenUri;
    private String userinfoUri;
    private String scopes;
    private Boolean autoProvisionUsers;
    private Boolean allowPasswordLogin;
    private String defaultRoleName;
    private String emailDomains;
}
