package com.mst.agritech.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AnalyticsSummaryResponse {
    private BigDecimal ytdRevenueUsd;
    private long totalOrdersYtd;
    private BigDecimal avgOrderValueUsd;
    private BigDecimal avgFulfillmentDays;
}
