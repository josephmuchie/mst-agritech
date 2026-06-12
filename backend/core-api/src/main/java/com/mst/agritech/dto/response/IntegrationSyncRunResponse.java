package com.mst.agritech.dto.response;

import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Builder
public class IntegrationSyncRunResponse {
    private Long id;
    private Long integrationConfigId;
    private String flowType;
    private String triggerType;
    private String status;
    private int recordsProcessed;
    private String errorMessage;
    private LocalDateTime startedAt;
    private LocalDateTime completedAt;
}
