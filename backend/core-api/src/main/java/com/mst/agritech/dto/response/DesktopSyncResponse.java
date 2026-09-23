package com.mst.agritech.dto.response;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class DesktopSyncResponse {
    private int accepted;
    private int failed;
    private List<DesktopSyncChangeResponse> results;
}
