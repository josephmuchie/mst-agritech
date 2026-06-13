package com.mst.agritech.service;

import com.mst.agritech.dto.response.DashboardKpiResponse;
import com.mst.agritech.repository.FarmerRepository;
import com.mst.agritech.repository.OrderRepository;
import com.mst.agritech.repository.ShipmentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final OrderRepository orderRepository;
    private final FarmerRepository farmerRepository;
    private final ShipmentRepository shipmentRepository;

    private static final List<String> ACTIVE_SHIPMENT_STATUSES =
            List.of("PENDING", "LOADING", "LOADED", "IN_TRANSIT", "CUSTOMS");

    public DashboardKpiResponse getKpis() {
        return DashboardKpiResponse.builder()
                .totalOrders(orderRepository.count())
                .activeFarmers(farmerRepository.countByVerifiedTrue())
                .revenueUsd(orderRepository.sumDeliveredRevenue())
                .activeShipments(shipmentRepository.countByStatusIn(ACTIVE_SHIPMENT_STATUSES))
                .build();
    }
}
