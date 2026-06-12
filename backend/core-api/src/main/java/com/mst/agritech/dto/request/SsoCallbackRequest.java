package com.mst.agritech.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class SsoCallbackRequest {
    @NotBlank
    private String code;

    @NotBlank
    private String state;
}
