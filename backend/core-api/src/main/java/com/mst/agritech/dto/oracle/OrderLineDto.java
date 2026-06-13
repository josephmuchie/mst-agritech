package com.mst.agritech.dto.oracle;

import com.fasterxml.jackson.annotation.JsonProperty;
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
@Schema(description = "Oracle-style order line resource")
public class OrderLineDto {

    @JsonProperty("OrderLineId")
    @Schema(example = "1")
    private Long orderLineId;

    @JsonProperty("OrderNumber")
    @Schema(example = "ORD-20260601-001")
    private String orderNumber;

    @JsonProperty("LineNumber")
    @Schema(example = "1")
    private Integer lineNumber;

    @JsonProperty("ItemDescription")
    @Schema(example = "Premium Roses")
    private String itemDescription;

    @JsonProperty("OrderedQuantity")
    @Schema(example = "1200.00")
    private BigDecimal orderedQuantity;

    @JsonProperty("QuantityUOM")
    @Schema(example = "STEM")
    private String quantityUom;

    @JsonProperty("UnitSellingPrice")
    @Schema(example = "3.50")
    private BigDecimal unitSellingPrice;

    @JsonProperty("LineAmount")
    @Schema(example = "4200.00")
    private BigDecimal lineAmount;

    @JsonProperty("LineStatus")
    @Schema(example = "OPEN")
    private String lineStatus;
}
