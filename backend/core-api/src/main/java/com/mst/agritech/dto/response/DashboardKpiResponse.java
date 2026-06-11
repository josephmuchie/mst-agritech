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
public class DashboardKpiResponse {
    private long totalOrders;
    private long activeFarmers;
    private BigDecimal revenueUsd;
    private long activeShipments;
}
