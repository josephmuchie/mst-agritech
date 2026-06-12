package com.mst.agritech.dto.response;

import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class IntegrationConfigResponse {
    private Long id;
    private String systemType;
    private String displayName;
    private String endpointUrl;
    private boolean active;
    private boolean configured;
    private String environment;
    private List<String> dataFlows;
    private String description;
    private LocalDateTime lastSyncAt;
    private LocalDateTime updatedAt;
}
