package com.mst.agritech.service;

import com.mst.agritech.dto.response.DashboardKpiResponse;
import com.mst.agritech.repository.FarmerRepository;
import com.mst.agritech.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final OrderRepository orderRepository;
    private final FarmerRepository farmerRepository;

    public DashboardKpiResponse getKpis() {
        return DashboardKpiResponse.builder()
                .totalOrders(orderRepository.count())
                .activeFarmers(farmerRepository.countByVerifiedTrue())
                .revenueUsd(orderRepository.sumDeliveredRevenue())
                .activeShipments(orderRepository.countByStatus("SHIPPED"))
                .build();
    }
}
