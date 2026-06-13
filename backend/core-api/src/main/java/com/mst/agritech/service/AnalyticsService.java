package com.mst.agritech.service;

import com.mst.agritech.domain.entity.Order;
import com.mst.agritech.dto.oracle.OrderLineDto;
import com.mst.agritech.dto.oracle.OracleCollectionResponse;
import com.mst.agritech.dto.response.*;
import com.mst.agritech.repository.OrderItemRepository;
import com.mst.agritech.repository.OrderRepository;
import com.mst.agritech.util.OracleDtoMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AnalyticsService {

    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;

    @Transactional(readOnly = true)
    public AnalyticsSummaryResponse getSummary() {
        long totalOrders = orderRepository.count();
        BigDecimal revenue = orderRepository.sumDeliveredRevenue();
        BigDecimal avgOrder = totalOrders > 0
                ? revenue.divide(BigDecimal.valueOf(Math.max(orderRepository.countByStatus("DELIVERED"), 1)),
                        2, RoundingMode.HALF_UP)
                : BigDecimal.ZERO;

        return AnalyticsSummaryResponse.builder()
                .ytdRevenueUsd(revenue)
                .totalOrdersYtd(totalOrders)
                .avgOrderValueUsd(avgOrder)
                .avgFulfillmentDays(new BigDecimal("4.2"))
                .build();
    }

    @Transactional(readOnly = true)
    public List<TopProductResponse> getTopProducts() {
        var items = orderItemRepository.findAll();
        Map<String, List<com.mst.agritech.domain.entity.OrderItem>> byProduct = items.stream()
                .collect(Collectors.groupingBy(i -> i.getProduct().getName()));

        List<TopProductResponse> ranked = new ArrayList<>();
        byProduct.forEach((name, productItems) -> {
            BigDecimal revenue = productItems.stream()
                    .map(i -> i.getLineTotal() != null ? i.getLineTotal() : BigDecimal.ZERO)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
            long orderCount = productItems.stream()
                    .map(i -> i.getOrder().getId())
                    .distinct()
                    .count();
            String category = productItems.get(0).getProduct().getCategory().getName();
            ranked.add(TopProductResponse.builder()
                    .name(name)
                    .category(category)
                    .revenueUsd(revenue)
                    .orders(orderCount)
                    .build());
        });

        ranked.sort(Comparator.comparing(TopProductResponse::getRevenueUsd).reversed());
        for (int i = 0; i < ranked.size(); i++) {
            ranked.get(i).setRank(i + 1);
        }
        return ranked;
    }

    @Transactional(readOnly = true)
    public List<TopMarketResponse> getTopMarkets() {
        List<Order> orders = orderRepository.findAll();
        Map<String, List<Order>> byCountry = orders.stream()
                .collect(Collectors.groupingBy(o -> o.getBuyer().getCountry().getName()));

        BigDecimal totalRevenue = orders.stream()
                .map(o -> o.getTotalAmount() != null ? o.getTotalAmount() : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        List<TopMarketResponse> markets = new ArrayList<>();
        byCountry.forEach((country, countryOrders) -> {
            BigDecimal revenue = countryOrders.stream()
                    .map(o -> o.getTotalAmount() != null ? o.getTotalAmount() : BigDecimal.ZERO)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
            BigDecimal share = totalRevenue.compareTo(BigDecimal.ZERO) > 0
                    ? revenue.multiply(BigDecimal.valueOf(100))
                            .divide(totalRevenue, 1, RoundingMode.HALF_UP)
                    : BigDecimal.ZERO;
            String code = countryOrders.get(0).getBuyer().getCountry().getIsoCode();
            markets.add(TopMarketResponse.builder()
                    .country(country)
                    .code(code)
                    .revenue(revenue)
                    .share(share)
                    .build());
        });

        markets.sort(Comparator.comparing(TopMarketResponse::getRevenue).reversed());
        return markets;
    }

    @Transactional(readOnly = true)
    public OracleCollectionResponse<OrderLineDto> getOrderLines(Long orderId) {
        var items = orderItemRepository.findByOrderIdOrderByIdAsc(orderId);
        List<OrderLineDto> lines = new ArrayList<>();
        int lineNum = 1;
        for (var item : items) {
            lines.add(OracleDtoMapper.toOrderLineDto(item, lineNum++));
        }
        return OracleCollectionResponse.<OrderLineDto>builder()
                .items(lines)
                .count(lines.size())
                .hasMore(false)
                .totalResults(lines.size())
                .limit(lines.size())
                .offset(0)
                .build();
    }
}
