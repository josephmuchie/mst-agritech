package com.mst.agritech.service;

import com.mst.agritech.domain.entity.*;
import com.mst.agritech.dto.request.ApiIngestionRequest;
import com.mst.agritech.dto.response.DataImportJobResponse;
import com.mst.agritech.dto.response.DataImportTypeInfoResponse;
import com.mst.agritech.dto.response.DataIngestionAccessResponse;
import com.mst.agritech.ingestion.DataImportType;
import com.mst.agritech.ingestion.ExcelIngestionParser;
import com.mst.agritech.repository.*;
import com.mst.agritech.security.DataIngestionAuthorizer;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
public class DataIngestionService {

    private final DataImportJobRepository jobRepository;
    private final ExcelIngestionParser excelParser;
    private final ProductRepository productRepository;
    private final ProductCategoryRepository categoryRepository;
    private final MarketPriceRepository marketPriceRepository;
    private final CountryRepository countryRepository;
    private final CurrencyRepository currencyRepository;
    private final FarmerRepository farmerRepository;
    private final BuyerRepository buyerRepository;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final AppSettingRepository appSettingRepository;
    private final PasswordEncoder passwordEncoder;
    private final DataIngestionAuthorizer dataIngestionAuthorizer;

    public DataIngestionAccessResponse checkAccess(Authentication authentication) {
        return DataIngestionAccessResponse.builder()
                .allowed(dataIngestionAuthorizer.canIngest(authentication))
                .build();
    }

    public List<DataImportTypeInfoResponse> listTypes() {
        return Arrays.stream(DataImportType.values())
                .map(this::typeInfo)
                .toList();
    }

    public byte[] buildTemplate(DataImportType type) throws IOException {
        return excelParser.buildTemplate(columnsFor(type));
    }

    @Transactional(readOnly = true)
    public Page<DataImportJobResponse> listJobs(Pageable pageable) {
        return jobRepository.findAllByOrderByStartedAtDesc(pageable).map(this::toResponse);
    }

    @Transactional
    public DataImportJobResponse ingestExcel(DataImportType type, MultipartFile file, Authentication auth)
            throws IOException {
        List<Map<String, String>> rows = excelParser.parse(file.getInputStream());
        return runImport(type, "EXCEL", file.getOriginalFilename(), rows, auth);
    }

    @Transactional
    public DataImportJobResponse ingestApi(ApiIngestionRequest request, Authentication auth) {
        DataImportType type = DataImportType.valueOf(request.getImportType().toUpperCase(Locale.ROOT));
        return runImport(type, "API", null, request.getRecords(), auth);
    }

    private DataImportJobResponse runImport(
            DataImportType type, String source, String fileName,
            List<Map<String, String>> rows, Authentication auth) {

        int maxRows = Integer.parseInt(appSettingRepository.findBySettingKey("data.import.max_rows")
                .map(AppSetting::getSettingValue).orElse("5000"));
        if (rows.size() > maxRows) {
            throw new IllegalArgumentException("Import exceeds maximum of " + maxRows + " rows");
        }

        User createdBy = userRepository.findByEmail(auth.getName()).orElse(null);
        DataImportJob job = DataImportJob.builder()
                .importType(type.name())
                .source(source)
                .fileName(fileName)
                .status("PROCESSING")
                .recordsTotal(rows.size())
                .createdBy(createdBy)
                .startedAt(LocalDateTime.now())
                .build();
        job = jobRepository.save(job);

        int success = 0;
        int failed = 0;
        List<String> errors = new ArrayList<>();

        for (int i = 0; i < rows.size(); i++) {
            try {
                importRow(type, rows.get(i));
                success++;
            } catch (Exception ex) {
                failed++;
                if (errors.size() < 10) {
                    errors.add("Row " + (i + 2) + ": " + ex.getMessage());
                }
            }
        }

        job.setRecordsSuccess(success);
        job.setRecordsFailed(failed);
        job.setStatus(failed == 0 ? "COMPLETED" : (success > 0 ? "PARTIAL" : "FAILED"));
        job.setErrorSummary(errors.isEmpty() ? null : String.join("\n", errors));
        job.setCompletedAt(LocalDateTime.now());
        return toResponse(jobRepository.save(job));
    }

    private void importRow(DataImportType type, Map<String, String> row) {
        switch (type) {
            case PRODUCTS -> importProduct(row);
            case MARKET_PRICES -> importMarketPrice(row);
            case FARMERS -> importFarmer(row);
            case BUYERS -> importBuyer(row);
        }
    }

    private void importProduct(Map<String, String> row) {
        String name = require(row, "name");
        if (productRepository.findByActiveTrueOrderByNameAsc().stream()
                .anyMatch(p -> p.getName().equalsIgnoreCase(name))) {
            throw new IllegalArgumentException("Product already exists: " + name);
        }
        String categoryName = require(row, "category");
        ProductCategory category = categoryRepository.findByActiveTrue().stream()
                .filter(c -> c.getName().equalsIgnoreCase(categoryName))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Unknown category: " + categoryName));

        Product product = Product.builder()
                .name(name)
                .category(category)
                .unitOfMeasure(require(row, "unit_of_measure"))
                .description(row.getOrDefault("description", ""))
                .requiresColdChain("Y".equalsIgnoreCase(row.getOrDefault("requires_cold_chain", "N"))
                        || "true".equalsIgnoreCase(row.getOrDefault("requires_cold_chain", "false")))
                .active(true)
                .build();
        productRepository.save(product);
    }

    private void importMarketPrice(Map<String, String> row) {
        String productName = require(row, "product_name");
        Product product = productRepository.findByActiveTrueOrderByNameAsc().stream()
                .filter(p -> p.getName().equalsIgnoreCase(productName))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Unknown product: " + productName));

        String currencyCode = row.getOrDefault("currency_code", "USD");
        com.mst.agritech.domain.entity.Currency currency = currencyRepository.findByCode(currencyCode)
                .orElseThrow(() -> new IllegalArgumentException("Unknown currency: " + currencyCode));

        Country country = null;
        String countryIso = row.get("country_iso");
        if (countryIso != null && !countryIso.isBlank()) {
            country = countryRepository.findByIsoCode(countryIso.toUpperCase())
                    .orElseThrow(() -> new IllegalArgumentException("Unknown country: " + countryIso));
        }

        marketPriceRepository.save(MarketPrice.builder()
                .product(product)
                .country(country)
                .price(new BigDecimal(require(row, "price")))
                .currency(currency)
                .priceSource(row.getOrDefault("price_source", "Import"))
                .build());
    }

    private void importFarmer(Map<String, String> row) {
        String email = require(row, "email").toLowerCase(Locale.ROOT);
        if (farmerRepository.findAll().stream()
                .anyMatch(f -> f.getUser().getEmail().equalsIgnoreCase(email))) {
            throw new IllegalArgumentException("Farmer already exists: " + email);
        }
        User user = createUser(email, require(row, "full_name"), "FARMER");
        Country country = countryRepository.findByIsoCode(require(row, "country_iso").toUpperCase())
                .orElseThrow(() -> new IllegalArgumentException("Unknown country"));

        Farmer farmer = Farmer.builder()
                .user(user)
                .country(country)
                .farmName(require(row, "farm_name"))
                .province(row.getOrDefault("province", null))
                .totalHectares(parseDecimal(row.get("total_hectares")))
                .verified(false)
                .build();
        farmerRepository.save(farmer);
    }

    private void importBuyer(Map<String, String> row) {
        String email = require(row, "email").toLowerCase(Locale.ROOT);
        if (buyerRepository.findAll().stream()
                .anyMatch(b -> b.getUser().getEmail().equalsIgnoreCase(email))) {
            throw new IllegalArgumentException("Buyer already exists: " + email);
        }
        User user = createUser(email, require(row, "full_name"), "BUYER");
        Country country = countryRepository.findByIsoCode(require(row, "country_iso").toUpperCase())
                .orElseThrow(() -> new IllegalArgumentException("Unknown country"));

        Buyer buyer = Buyer.builder()
                .user(user)
                .country(country)
                .companyName(require(row, "company_name"))
                .buyerType(row.getOrDefault("buyer_type", "RETAIL"))
                .contactEmail(row.getOrDefault("contact_email", email))
                .verified(false)
                .build();
        buyerRepository.save(buyer);
    }

    private User createUser(String email, String fullName, String roleName) {
        if (userRepository.existsByEmail(email)) {
            return userRepository.findByEmail(email)
                    .orElseThrow(() -> new IllegalStateException("User exists but not found"));
        }
        String defaultPassword = appSettingRepository.findBySettingKey("data.import.default_password")
                .map(AppSetting::getSettingValue).orElse("Import123!");
        Role role = roleRepository.findByName(roleName)
                .orElseThrow(() -> new IllegalStateException("Role not found: " + roleName));

        User user = User.builder()
                .email(email)
                .fullName(fullName)
                .passwordHash(passwordEncoder.encode(defaultPassword))
                .active(true)
                .roles(new HashSet<>(Set.of(role)))
                .build();
        return userRepository.save(user);
    }

    private String require(Map<String, String> row, String key) {
        String value = row.get(key);
        if (value == null || value.isBlank()) {
            throw new IllegalArgumentException("Missing required field: " + key);
        }
        return value.trim();
    }

    private BigDecimal parseDecimal(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        return new BigDecimal(value.trim());
    }

    private DataImportJobResponse toResponse(DataImportJob job) {
        return DataImportJobResponse.builder()
                .id(job.getId())
                .importType(job.getImportType())
                .source(job.getSource())
                .fileName(job.getFileName())
                .status(job.getStatus())
                .recordsTotal(job.getRecordsTotal())
                .recordsSuccess(job.getRecordsSuccess())
                .recordsFailed(job.getRecordsFailed())
                .errorSummary(job.getErrorSummary())
                .createdByEmail(job.getCreatedBy() != null ? job.getCreatedBy().getEmail() : null)
                .startedAt(job.getStartedAt())
                .completedAt(job.getCompletedAt())
                .build();
    }

    private DataImportTypeInfoResponse typeInfo(DataImportType type) {
        return DataImportTypeInfoResponse.builder()
                .type(type.name())
                .label(labelFor(type))
                .description(descriptionFor(type))
                .columns(List.of(columnsFor(type)))
                .build();
    }

    private String[] columnsFor(DataImportType type) {
        return switch (type) {
            case PRODUCTS -> new String[]{"name", "category", "unit_of_measure", "description", "requires_cold_chain"};
            case MARKET_PRICES -> new String[]{"product_name", "price", "currency_code", "country_iso", "price_source"};
            case FARMERS -> new String[]{"email", "full_name", "farm_name", "country_iso", "province", "total_hectares"};
            case BUYERS -> new String[]{"email", "full_name", "company_name", "country_iso", "buyer_type", "contact_email"};
        };
    }

    private String labelFor(DataImportType type) {
        return switch (type) {
            case PRODUCTS -> "Products";
            case MARKET_PRICES -> "Market Prices";
            case FARMERS -> "Farmers";
            case BUYERS -> "Buyers";
        };
    }

    private String descriptionFor(DataImportType type) {
        return switch (type) {
            case PRODUCTS -> "Import product catalog entries";
            case MARKET_PRICES -> "Import commodity price records";
            case FARMERS -> "Import farmer profiles (creates user accounts)";
            case BUYERS -> "Import buyer companies (creates user accounts)";
        };
    }
}
