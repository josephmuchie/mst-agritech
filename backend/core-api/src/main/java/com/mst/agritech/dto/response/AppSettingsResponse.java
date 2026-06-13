package com.mst.agritech.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "General platform settings")
public class AppSettingsResponse {
    @Schema(example = "MST Agritech")
    private String platformName;
    @Schema(example = "USD")
    private String defaultCurrency;
    @Schema(example = "support@mstagritech.co.zw")
    private String supportEmail;
    @Schema(example = "500000")
    private String maxOrderValueUsd;
    @Schema(example = "true")
    private boolean maintenanceMode;
    @Schema(example = "{\"platform.name\":\"MST Agritech\"}")
    private Map<String, String> raw;
}
