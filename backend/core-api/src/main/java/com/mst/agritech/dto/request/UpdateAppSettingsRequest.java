package com.mst.agritech.dto.request;

import lombok.Data;

@Data
public class UpdateAppSettingsRequest {
    private String platformName;
    private String defaultCurrency;
    private String supportEmail;
    private String maxOrderValueUsd;
    private Boolean maintenanceMode;
}
