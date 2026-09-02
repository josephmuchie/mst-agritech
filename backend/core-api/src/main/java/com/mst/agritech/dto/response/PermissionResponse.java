package com.mst.agritech.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "A permission key that can be assigned to a role")
public class PermissionResponse {
    @Schema(example = "1")
    private Long id;
    @Schema(example = "orders")
    private String resource;
    @Schema(example = "read")
    private String action;
}
