package com.mst.agritech.dto.request;

import lombok.Data;

@Data
public class UpdateIntegrationConfigRequest {
    private String displayName;
    private String endpointUrl;
    private String credentialsJson;
    private String extraConfig;
    private Boolean active;
}
