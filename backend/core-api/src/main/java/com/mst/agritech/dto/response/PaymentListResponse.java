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
public class PaymentListResponse {
    private Long id;
    private String reference;
    private String orderRef;
    private BigDecimal amount;
    private String currencyCode;
    private String gateway;
    private String status;
    private LocalDateTime createdAt;
}
