package com.mst.agritech.dto.punchout;

import lombok.Builder;
import lombok.Data;

/** Lightweight view of a PunchOut session the frontend landing page uses to render the catalog. */
@Data
@Builder
public class PunchoutSessionResponse {
    private String token;
    private String protocol;
    private String status;
    private String buyerName;
    private String operation;
}
