package com.mst.agritech.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ProductCategoryRequest {
    @NotBlank
    private String name;
    private String description;
    private Long parentId;
    private Boolean active;
}
