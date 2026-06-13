package com.mst.agritech.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Platform role with permission keys")
public class RoleResponse {
    @Schema(example = "1")
    private Long id;
    @Schema(example = "ADMIN")
    private String name;
    @Schema(example = "Platform administrator with full access")
    private String description;
    @Schema(example = "[\"users:read\", \"users:write\", \"orders:all\"]")
    private List<String> permissions;
}
