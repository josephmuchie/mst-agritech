package com.mst.agritech.service;

import com.mst.agritech.domain.entity.*;
import com.mst.agritech.dto.request.*;
import com.mst.agritech.dto.response.AdminProductResponse;
import com.mst.agritech.dto.response.MarketPriceResponse;
import com.mst.agritech.exception.ConflictException;
import com.mst.agritech.exception.ResourceNotFoundException;
import com.mst.agritech.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class MasterDataService {

    private final CountryRepository countryRepository;
    private final CurrencyRepository currencyRepository;
    private final ProductCategoryRepository categoryRepository;
    private final ProductRepository productRepository;
    private final MarketPriceRepository marketPriceRepository;

    // ── Countries ──────────────────────────────────────────────

    public List<Country> listCountries(boolean activeOnly) {
        List<Country> all = countryRepository.findAll();
        all.sort(Comparator.comparing(Country::getIsoCode));
        if (activeOnly) {
            return all.stream().filter(Country::isActive).toList();
        }
        return all;
    }

    @Transactional
    public Country createCountry(CountryRequest request) {
        String iso = request.getIsoCode().trim().toUpperCase(Locale.ROOT);
        Optional<Country> existing = countryRepository.findByIsoCode(iso);
        if (existing.isPresent()) {
            Country country = existing.get();
            if (country.isActive()) {
                throw new ConflictException("Country already exists: " + iso);
            }
            country.setName(request.getName().trim());
            country.setRegion(request.getRegion());
            country.setActive(request.getActive() == null || request.getActive());
            return countryRepository.save(country);
        }
        Country country = Country.builder()
                .isoCode(iso)
                .name(request.getName().trim())
                .region(request.getRegion())
                .active(request.getActive() == null || request.getActive())
                .build();
        return countryRepository.save(country);
    }

    @Transactional
    public Country updateCountry(Long id, CountryRequest request) {
        Country country = countryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Country", id));
        String iso = request.getIsoCode().toUpperCase(Locale.ROOT);
        countryRepository.findByIsoCode(iso).ifPresent(existing -> {
            if (!existing.getId().equals(id)) {
                throw new ConflictException("ISO code already in use: " + iso);
            }
        });
        country.setIsoCode(iso);
        country.setName(request.getName().trim());
        country.setRegion(request.getRegion());
        if (request.getActive() != null) {
            country.setActive(request.getActive());
        }
        return countryRepository.save(country);
    }

    @Transactional
    public void deleteCountry(Long id) {
        Country country = countryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Country", id));
        country.setActive(false);
        countryRepository.save(country);
    }

    // ── Currencies ───────────────────────────────────────────

    public List<Currency> listCurrencies(boolean activeOnly) {
        List<Currency> all = currencyRepository.findAll();
        all.sort(Comparator.comparing(Currency::getCode));
        if (activeOnly) {
            return all.stream().filter(Currency::isActive).toList();
        }
        return all;
    }

    @Transactional
    public Currency createCurrency(CurrencyRequest request) {
        String code = request.getCode().trim().toUpperCase(Locale.ROOT);
        Optional<Currency> existing = currencyRepository.findByCode(code);
        if (existing.isPresent()) {
            Currency currency = existing.get();
            if (currency.isActive()) {
                throw new ConflictException("Currency already exists: " + code);
            }
            currency.setName(request.getName().trim());
            currency.setSymbol(request.getSymbol().trim());
            currency.setActive(request.getActive() == null || request.getActive());
            return currencyRepository.save(currency);
        }
        Currency currency = Currency.builder()
                .code(code)
                .name(request.getName().trim())
                .symbol(request.getSymbol().trim())
                .active(request.getActive() == null || request.getActive())
                .build();
        return currencyRepository.save(currency);
    }

    @Transactional
    public Currency updateCurrency(Long id, CurrencyRequest request) {
        Currency currency = currencyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Currency", id));
        String code = request.getCode().toUpperCase(Locale.ROOT);
        currencyRepository.findByCode(code).ifPresent(existing -> {
            if (!existing.getId().equals(id)) {
                throw new ConflictException("Currency code already in use: " + code);
            }
        });
        currency.setCode(code);
        currency.setName(request.getName().trim());
        currency.setSymbol(request.getSymbol().trim());
        if (request.getActive() != null) {
            currency.setActive(request.getActive());
        }
        return currencyRepository.save(currency);
    }

    @Transactional
    public void deleteCurrency(Long id) {
        Currency currency = currencyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Currency", id));
        currency.setActive(false);
        currencyRepository.save(currency);
    }

    // ── Product categories ─────────────────────────────────────

    public List<ProductCategory> listCategories(boolean activeOnly) {
        List<ProductCategory> all = categoryRepository.findAll();
        all.sort(Comparator.comparing(ProductCategory::getName, String.CASE_INSENSITIVE_ORDER));
        if (activeOnly) {
            return all.stream().filter(ProductCategory::isActive).toList();
        }
        return all;
    }

    @Transactional
    public ProductCategory createCategory(ProductCategoryRequest request) {
        String name = request.getName().trim();
        Optional<ProductCategory> existing = categoryRepository.findByNameIgnoreCase(name);
        if (existing.isPresent()) {
            ProductCategory category = existing.get();
            if (category.isActive()) {
                throw new ConflictException("Category already exists: " + name);
            }
            category.setDescription(request.getDescription());
            category.setActive(request.getActive() == null || request.getActive());
            if (request.getParentId() != null) {
                category.setParent(categoryRepository.findById(request.getParentId())
                        .orElseThrow(() -> new ResourceNotFoundException("ProductCategory", request.getParentId())));
            }
            return categoryRepository.save(category);
        }
        ProductCategory parent = null;
        if (request.getParentId() != null) {
            parent = categoryRepository.findById(request.getParentId())
                    .orElseThrow(() -> new ResourceNotFoundException("ProductCategory", request.getParentId()));
        }
        ProductCategory category = ProductCategory.builder()
                .name(name)
                .description(request.getDescription())
                .parent(parent)
                .active(request.getActive() == null || request.getActive())
                .build();
        return categoryRepository.save(category);
    }

    @Transactional
    public ProductCategory updateCategory(Long id, ProductCategoryRequest request) {
        ProductCategory category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("ProductCategory", id));
        String name = request.getName().trim();
        categoryRepository.findByNameIgnoreCase(name).ifPresent(existing -> {
            if (!existing.getId().equals(id)) {
                throw new ConflictException("Category name already in use: " + name);
            }
        });
        ProductCategory parent = null;
        if (request.getParentId() != null) {
            if (request.getParentId().equals(id)) {
                throw new ConflictException("Category cannot be its own parent");
            }
            parent = categoryRepository.findById(request.getParentId())
                    .orElseThrow(() -> new ResourceNotFoundException("ProductCategory", request.getParentId()));
        }
        category.setName(name);
        category.setDescription(request.getDescription());
        category.setParent(parent);
        if (request.getActive() != null) {
            category.setActive(request.getActive());
        }
        return categoryRepository.save(category);
    }

    @Transactional
    public void deleteCategory(Long id) {
        ProductCategory category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("ProductCategory", id));
        category.setActive(false);
        categoryRepository.save(category);
    }

    // ── Products ───────────────────────────────────────────────

    public List<AdminProductResponse> listProducts(boolean activeOnly) {
        List<Product> products = activeOnly
                ? productRepository.findByActiveTrueOrderByNameAsc()
                : productRepository.findAll().stream()
                        .sorted(Comparator.comparing(Product::getName, String.CASE_INSENSITIVE_ORDER))
                        .toList();
        return products.stream().map(this::toProductResponse).toList();
    }

    @Transactional
    public AdminProductResponse createProduct(ProductRequest request) {
        ProductCategory category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("ProductCategory", request.getCategoryId()));
        Product product = Product.builder()
                .name(request.getName().trim())
                .category(category)
                .unitOfMeasure(request.getUnitOfMeasure().trim())
                .description(request.getDescription())
                .hsCode(request.getHsCode())
                .requiresColdChain(Boolean.TRUE.equals(request.getRequiresColdChain()))
                .active(request.getActive() == null || request.getActive())
                .createdAt(LocalDateTime.now())
                .build();
        return toProductResponse(productRepository.save(product));
    }

    @Transactional
    public AdminProductResponse updateProduct(Long id, ProductRequest request) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product", id));
        ProductCategory category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("ProductCategory", request.getCategoryId()));
        product.setName(request.getName().trim());
        product.setCategory(category);
        product.setUnitOfMeasure(request.getUnitOfMeasure().trim());
        product.setDescription(request.getDescription());
        product.setHsCode(request.getHsCode());
        if (request.getRequiresColdChain() != null) {
            product.setRequiresColdChain(request.getRequiresColdChain());
        }
        if (request.getActive() != null) {
            product.setActive(request.getActive());
        }
        return toProductResponse(productRepository.save(product));
    }

    @Transactional
    public void deleteProduct(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product", id));
        product.setActive(false);
        productRepository.save(product);
    }

    // ── Market prices ──────────────────────────────────────────

    public List<MarketPriceResponse> listMarketPrices() {
        return marketPriceRepository.findAllByOrderByRecordedAtDesc().stream()
                .map(this::toMarketPriceResponse)
                .toList();
    }

    @Transactional
    public MarketPriceResponse createMarketPrice(MarketPriceRequest request) {
        if (request.getPrice() == null || request.getPrice().signum() < 0) {
            throw new ConflictException("Price must be zero or greater");
        }
        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new ResourceNotFoundException("Product", request.getProductId()));
        Currency currency = currencyRepository.findByCode(request.getCurrencyCode().toUpperCase(Locale.ROOT))
                .orElseThrow(() -> new ResourceNotFoundException("Currency", request.getCurrencyCode()));
        Country country = null;
        if (request.getCountryId() != null) {
            country = countryRepository.findById(request.getCountryId())
                    .orElseThrow(() -> new ResourceNotFoundException("Country", request.getCountryId()));
        }
        MarketPrice price = MarketPrice.builder()
                .product(product)
                .country(country)
                .price(request.getPrice())
                .currency(currency)
                .priceSource(request.getPriceSource())
                .recordedAt(LocalDateTime.now())
                .build();
        return toMarketPriceResponse(marketPriceRepository.save(price));
    }

    @Transactional
    public MarketPriceResponse updateMarketPrice(Long id, MarketPriceRequest request) {
        if (request.getPrice() == null || request.getPrice().signum() < 0) {
            throw new ConflictException("Price must be zero or greater");
        }
        MarketPrice price = marketPriceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("MarketPrice", id));
        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new ResourceNotFoundException("Product", request.getProductId()));
        Currency currency = currencyRepository.findByCode(request.getCurrencyCode().toUpperCase(Locale.ROOT))
                .orElseThrow(() -> new ResourceNotFoundException("Currency", request.getCurrencyCode()));
        Country country = null;
        if (request.getCountryId() != null) {
            country = countryRepository.findById(request.getCountryId())
                    .orElseThrow(() -> new ResourceNotFoundException("Country", request.getCountryId()));
        }
        price.setProduct(product);
        price.setCountry(country);
        price.setPrice(request.getPrice());
        price.setCurrency(currency);
        price.setPriceSource(request.getPriceSource());
        return toMarketPriceResponse(marketPriceRepository.save(price));
    }

    @Transactional
    public void deleteMarketPrice(Long id) {
        if (!marketPriceRepository.existsById(id)) {
            throw new ResourceNotFoundException("MarketPrice", id);
        }
        marketPriceRepository.deleteById(id);
    }

    private AdminProductResponse toProductResponse(Product product) {
        return AdminProductResponse.builder()
                .id(product.getId())
                .name(product.getName())
                .categoryId(product.getCategory().getId())
                .categoryName(product.getCategory().getName())
                .unitOfMeasure(product.getUnitOfMeasure())
                .description(product.getDescription())
                .hsCode(product.getHsCode())
                .requiresColdChain(product.isRequiresColdChain())
                .active(product.isActive())
                .createdAt(product.getCreatedAt())
                .build();
    }

    private MarketPriceResponse toMarketPriceResponse(MarketPrice price) {
        return MarketPriceResponse.builder()
                .id(price.getId())
                .productId(price.getProduct().getId())
                .productName(price.getProduct().getName())
                .countryId(price.getCountry() != null ? price.getCountry().getId() : null)
                .countryName(price.getCountry() != null ? price.getCountry().getName() : null)
                .price(price.getPrice())
                .currencyCode(price.getCurrency().getCode())
                .priceSource(price.getPriceSource())
                .recordedAt(price.getRecordedAt())
                .build();
    }
}
