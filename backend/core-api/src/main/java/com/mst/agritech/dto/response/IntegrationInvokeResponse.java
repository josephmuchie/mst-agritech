package com.mst.agritech.dto.response;

import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Builder
public class IntegrationInvokeResponse {
    private Long runId;
    private String systemType;
    private String flowType;
    private String status;
    private int recordsProcessed;
    private String message;
    private LocalDateTime completedAt;
}
