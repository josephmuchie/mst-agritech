package com.mst.agritech.service;

import com.mst.agritech.domain.entity.HarvestCalendar;
import com.mst.agritech.domain.entity.Product;
import com.mst.agritech.dto.response.MarketplaceProductResponse;
import com.mst.agritech.repository.HarvestCalendarRepository;
import com.mst.agritech.repository.MarketPriceRepository;
import com.mst.agritech.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
public class MarketplaceService {

    private final ProductRepository productRepository;
    private final MarketPriceRepository marketPriceRepository;
    private final HarvestCalendarRepository harvestCalendarRepository;

    @Transactional(readOnly = true)
    public List<MarketplaceProductResponse> listProducts(String search, String category) {
        return productRepository.findByActiveTrueOrderByNameAsc().stream()
                .map(this::toListing)
                .filter(p -> matchesSearch(p, search))
                .filter(p -> matchesCategory(p, category))
                .toList();
    }

    @Transactional(readOnly = true)
    public List<String> listCategories() {
        return productRepository.findByActiveTrueOrderByNameAsc().stream()
                .map(p -> p.getCategory().getName())
                .distinct()
                .sorted()
                .toList();
    }

    private boolean matchesSearch(MarketplaceProductResponse p, String search) {
        if (search == null || search.isBlank()) return true;
        String q = search.toLowerCase();
        return p.getName().toLowerCase().contains(q)
                || (p.getFarmer() != null && p.getFarmer().toLowerCase().contains(q));
    }

    private boolean matchesCategory(MarketplaceProductResponse p, String category) {
        if (category == null || category.isBlank() || "All".equalsIgnoreCase(category)) return true;
        return category.equalsIgnoreCase(p.getCategory());
    }

    private MarketplaceProductResponse toListing(Product product) {
        BigDecimal price = marketPriceRepository.findFirstByProductIdOrderByRecordedAtDesc(product.getId())
                .map(mp -> mp.getPrice())
                .orElse(BigDecimal.ZERO);

        List<HarvestCalendar> harvests = harvestCalendarRepository.findByProductId(product.getId());
        BigDecimal stock = harvests.stream()
                .map(HarvestCalendar::getExpectedQuantity)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        String farmer = harvests.isEmpty() ? "MST Supplier"
                : harvests.get(0).getFarmer().getFarmName();
        String country = harvests.isEmpty() ? "ZW"
                : harvests.get(0).getFarmer().getCountry().getIsoCode();

        boolean available = stock.compareTo(BigDecimal.ZERO) > 0;

        return MarketplaceProductResponse.builder()
                .id(product.getId())
                .name(product.getName())
                .category(product.getCategory().getName())
                .farmer(farmer)
                .country(country)
                .priceUsd(price)
                .unit(product.getUnitOfMeasure())
                .stock(stock)
                .available(available)
                .build();
    }
}
