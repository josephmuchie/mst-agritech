package com.mst.agritech.dto.request;

import lombok.Data;

@Data
public class UpdateIntegrationSettingsRequest {
    private Boolean autoSyncEnabled;
    private Integer defaultRetryCount;
    private Boolean oracleEnabled;
}
