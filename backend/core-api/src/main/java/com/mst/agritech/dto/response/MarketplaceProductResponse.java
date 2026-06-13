package com.mst.agritech.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Marketplace product listing")
public class MarketplaceProductResponse {
    @Schema(example = "1")
    private Long id;
    @Schema(example = "Premium Roses")
    private String name;
    @Schema(example = "Flowers")
    private String category;
    @Schema(example = "Moyo Fresh Farms")
    private String farmer;
    @Schema(example = "ZW")
    private String country;
    @Schema(example = "4.50")
    private BigDecimal priceUsd;
    @Schema(example = "STEM")
    private String unit;
    @Schema(example = "2000")
    private BigDecimal stock;
    @Schema(example = "true")
    private boolean available;
}
