package com.mst.agritech.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class DesktopSyncChangeResponse {
    private Long queueId;
    private Long recordId;
    private String module;
    private String operation;
    private String status;
    private String message;
    private Long serverAuditId;
    private Long importJobId;
}
