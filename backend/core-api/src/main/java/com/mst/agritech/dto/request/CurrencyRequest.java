package com.mst.agritech.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class CurrencyRequest {
    @NotBlank @Size(min = 3, max = 3)
    private String code;
    @NotBlank
    private String name;
    @NotBlank
    private String symbol;
    private Boolean active;
}
