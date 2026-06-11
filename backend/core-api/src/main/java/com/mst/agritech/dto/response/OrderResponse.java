package com.mst.agritech.dto.response;

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
public class OrderResponse {
    private Long id;
    private String reference;
    private Long farmerId;
    private String farmerName;
    private Long buyerId;
    private String buyerCompanyName;
    private String status;
    private BigDecimal totalAmount;
    private String currencyCode;
    private String notes;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
