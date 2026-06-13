package com.mst.agritech.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class MarketPriceRequest {
    @NotNull
    private Long productId;
    private Long countryId;
    @NotNull
    private BigDecimal price;
    @NotNull
    private String currencyCode;
    private String priceSource;
}
