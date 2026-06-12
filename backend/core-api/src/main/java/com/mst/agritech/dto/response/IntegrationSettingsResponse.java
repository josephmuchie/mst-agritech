package com.mst.agritech.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class IntegrationSettingsResponse {
    private boolean autoSyncEnabled;
    private int defaultRetryCount;
    private boolean oracleEnabled;
}
