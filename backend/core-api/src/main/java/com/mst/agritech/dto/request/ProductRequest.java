package com.mst.agritech.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ProductRequest {
    @NotBlank
    private String name;
    @NotNull
    private Long categoryId;
    @NotBlank
    private String unitOfMeasure;
    private String description;
    private String hsCode;
    private Boolean requiresColdChain;
    private Boolean active;
}
