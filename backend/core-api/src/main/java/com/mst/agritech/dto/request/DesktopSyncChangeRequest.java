package com.mst.agritech.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.Map;

@Data
public class DesktopSyncChangeRequest {
    @NotNull
    private Long queueId;

    private Long recordId;

    @NotBlank
    private String module;

    @NotBlank
    private String operation;

    @NotNull
    private Map<String, Object> payload;

    private Integer attempts;
}
