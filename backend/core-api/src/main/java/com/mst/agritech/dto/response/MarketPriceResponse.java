package com.mst.agritech.dto.response;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
public class MarketPriceResponse {
    private Long id;
    private Long productId;
    private String productName;
    private Long countryId;
    private String countryName;
    private BigDecimal price;
    private String currencyCode;
    private String priceSource;
    private LocalDateTime recordedAt;
}
