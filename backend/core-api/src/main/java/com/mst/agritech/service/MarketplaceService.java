package com.mst.agritech.service;

import com.mst.agritech.domain.entity.HarvestCalendar;
import com.mst.agritech.domain.entity.MarketPrice;
import com.mst.agritech.domain.entity.Product;
import com.mst.agritech.dto.response.MarketplaceProductResponse;
import com.mst.agritech.exception.ResourceNotFoundException;
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
    public MarketplaceProductResponse getProduct(Long id) {
        Product product = productRepository.findById(id)
                .filter(Product::isActive)
                .orElseThrow(() -> new ResourceNotFoundException("Product", id));
        return toListing(product);
    }

    @Transactional(readOnly = true)
    public MarketplaceProductResponse getProductBySku(String sku) {
        Product product = productRepository.findBySku(sku)
                .filter(Product::isActive)
                .orElseThrow(() -> new ResourceNotFoundException("Product", sku));
        return toListing(product);
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
                || (p.getSupplier() != null && p.getSupplier().toLowerCase().contains(q))
                || (p.getSku() != null && p.getSku().toLowerCase().contains(q));
    }

    private boolean matchesCategory(MarketplaceProductResponse p, String category) {
        if (category == null || category.isBlank() || "All".equalsIgnoreCase(category)) return true;
        return category.equalsIgnoreCase(p.getCategory());
    }

    private MarketplaceProductResponse toListing(Product product) {
        MarketPrice latestPrice = marketPriceRepository
                .findFirstByProductIdOrderByRecordedAtDesc(product.getId())
                .orElse(null);
        BigDecimal price = latestPrice != null ? latestPrice.getPrice() : BigDecimal.ZERO;
        String currency = latestPrice != null && latestPrice.getCurrency() != null
                ? latestPrice.getCurrency().getCode() : "USD";

        List<HarvestCalendar> harvests = harvestCalendarRepository.findByProductId(product.getId());
        BigDecimal stock = harvests.stream()
                .map(HarvestCalendar::getExpectedQuantity)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        String supplier = harvests.isEmpty() ? "MST Supplier"
                : harvests.get(0).getFarmer().getFarmName();
        String country = harvests.isEmpty() ? "ZW"
                : harvests.get(0).getFarmer().getCountry().getIsoCode();

        boolean available = stock.compareTo(BigDecimal.ZERO) > 0;

        return MarketplaceProductResponse.builder()
                .id(product.getId())
                .sku(product.getSku())
                .name(product.getName())
                .description(product.getDescription())
                .category(product.getCategory().getName())
                .supplier(supplier)
                .country(country)
                .originRegion(product.getOriginRegion())
                .imageUrl(product.getImageUrl())
                .priceUsd(price)
                .currency(currency)
                .unit(product.getUnitOfMeasure())
                .stock(stock)
                .available(available)
                .minOrderQuantity(product.getMinOrderQuantity())
                .leadTimeDays(product.getLeadTimeDays())
                .incoterms(product.getIncoterms())
                .packaging(product.getPackaging())
                .certifications(product.getCertifications())
                .shelfLifeDays(product.getShelfLifeDays())
                .hsCode(product.getHsCode())
                .unspscCode(product.getUnspscCode())
                .requiresColdChain(product.isRequiresColdChain())
                .build();
    }

    /** Used by SOAP / OCI / cXML connectors to expose the full active catalog. */
    @Transactional(readOnly = true)
    public List<MarketplaceProductResponse> fullCatalog() {
        return productRepository.findByActiveTrueOrderByNameAsc().stream()
                .map(this::toListing)
                .toList();
    }
}
