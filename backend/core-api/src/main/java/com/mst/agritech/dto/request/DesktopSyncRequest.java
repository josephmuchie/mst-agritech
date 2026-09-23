package com.mst.agritech.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import lombok.Data;

import java.util.List;

@Data
public class DesktopSyncRequest {
    private String tenantSlug;
    private String operatorEmail;

    @Valid
    @NotEmpty
    private List<DesktopSyncChangeRequest> changes;
}
