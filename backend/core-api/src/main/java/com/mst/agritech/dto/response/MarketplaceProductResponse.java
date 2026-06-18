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
@Schema(description = "Marketplace product listing with full catalog metadata")
public class MarketplaceProductResponse {
    @Schema(example = "1")
    private Long id;
    @Schema(example = "MST-00001", description = "Supplier part / SKU used by procurement systems")
    private String sku;
    @Schema(example = "Premium Roses")
    private String name;
    @Schema(example = "Long-stemmed premium roses, grade A export quality")
    private String description;
    @Schema(example = "Flowers")
    private String category;
    @Schema(example = "Moyo Fresh Farms")
    private String supplier;
    @Schema(example = "ZW")
    private String country;
    @Schema(example = "Mashonaland, Zimbabwe")
    private String originRegion;
    @Schema(example = "https://.../roses.jpg")
    private String imageUrl;

    @Schema(example = "4.50")
    private BigDecimal priceUsd;
    @Schema(example = "USD")
    private String currency;
    @Schema(example = "STEM")
    private String unit;
    @Schema(example = "2000")
    private BigDecimal stock;
    @Schema(example = "true")
    private boolean available;

    @Schema(example = "200", description = "Minimum order quantity")
    private BigDecimal minOrderQuantity;
    @Schema(example = "3", description = "Lead time in days")
    private Integer leadTimeDays;
    @Schema(example = "FOB Harare")
    private String incoterms;
    @Schema(example = "Bunch of 20 stems, refrigerated box")
    private String packaging;
    @Schema(example = "GlobalGAP, Fair Trade")
    private String certifications;
    @Schema(example = "14", description = "Shelf life in days")
    private Integer shelfLifeDays;
    @Schema(example = "0603.11", description = "HS customs code")
    private String hsCode;
    @Schema(example = "10161800", description = "UNSPSC commodity code")
    private String unspscCode;
    @Schema(example = "true", description = "Requires temperature-controlled cold chain")
    private boolean requiresColdChain;
}
