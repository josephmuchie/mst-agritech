package com.mst.agritech.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class InvokeIntegrationRequest {
    @NotBlank
    private String flowType;
}
