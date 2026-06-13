package com.mst.agritech.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Order header resource")
public class OrderResponse {
    @Schema(example = "1")
    private Long id;
    @Schema(example = "ORD-20260601-001")
    private String reference;
    @Schema(example = "1")
    private Long farmerId;
    @Schema(example = "Tendai Moyo")
    private String farmerName;
    @Schema(example = "1")
    private Long buyerId;
    @Schema(example = "Woolworths SA")
    private String buyerCompanyName;
    @Schema(example = "SHIPPED")
    private String status;
    @Schema(example = "4200.00")
    private BigDecimal totalAmount;
    @Schema(example = "USD")
    private String currencyCode;
    @Schema(example = "Fresh roses export order")
    private String notes;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
