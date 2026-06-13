package com.mst.agritech.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class CountryRequest {
    @NotBlank @Size(min = 2, max = 2)
    private String isoCode;
    @NotBlank
    private String name;
    private String region;
    private Boolean active;
}
