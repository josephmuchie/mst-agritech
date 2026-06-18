package com.mst.agritech.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.media.Schema;
import org.springdoc.core.customizers.OpenApiCustomizer;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.*;

/**
 * Injects full JSON object examples into OpenAPI schemas so Swagger UI
 * displays formatted example values instead of misleading single-line fragments.
 */
@Component
public class OpenApiExampleCustomizer implements OpenApiCustomizer {

    @Override
    public void customise(OpenAPI openApi) {
        if (openApi.getComponents() == null || openApi.getComponents().getSchemas() == null) {
            return;
        }

        Map<String, Object> examples = buildExamples();
        openApi.getComponents().getSchemas().forEach((name, schema) -> {
            if (examples.containsKey(name)) {
                schema.setExample(examples.get(name));
            } else {
                Object built = buildFromProperties(schema);
                if (built != null) {
                    schema.setExample(built);
                }
            }
        });
    }

    private Object buildFromProperties(Schema<?> schema) {
        if (schema.getProperties() == null || schema.getProperties().isEmpty()) {
            return null;
        }
        Map<String, Object> example = new LinkedHashMap<>();
        schema.getProperties().forEach((key, propSchema) -> {
            Schema<?> ps = (Schema<?>) propSchema;
            if (ps.getExample() != null) {
                example.put(key, ps.getExample());
            } else if ("array".equals(ps.getType())) {
                example.put(key, List.of());
            } else if ("integer".equals(ps.getType())) {
                example.put(key, 1);
            } else if ("number".equals(ps.getType())) {
                example.put(key, 0);
            } else if ("boolean".equals(ps.getType())) {
                example.put(key, false);
            } else {
                example.put(key, "");
            }
        });
        return example.isEmpty() ? null : example;
    }

    private Map<String, Object> buildExamples() {
        Map<String, Object> map = new HashMap<>();

        map.put("InvoiceHeaderDto", Map.ofEntries(
                Map.entry("InvoiceId", "100001"),
                Map.entry("InvoiceNumber", "INV-2026-001"),
                Map.entry("BusinessUnit", "MST BU ZW"),
                Map.entry("LegalEntity", "MST Agritech ZW Ltd"),
                Map.entry("InvoiceType", "Standard"),
                Map.entry("InvoiceDate", "2026-06-01"),
                Map.entry("AccountingDate", "2026-06-01"),
                Map.entry("InvoiceAmount", new BigDecimal("4200.00")),
                Map.entry("InvoiceCurrencyCode", "USD"),
                Map.entry("PaymentStatusFlag", "Y"),
                Map.entry("ValidationStatus", "Validated"),
                Map.entry("BillToCustomerName", "Woolworths SA"),
                Map.entry("PurchaseOrder", "ORD-20260601-001"),
                Map.entry("PaymentTerms", "Net 30"),
                Map.entry("DueDate", "2026-07-01"),
                Map.entry("Description", "Fresh roses export invoice")
        ));

        map.put("OracleCollectionResponse", Map.of(
                "items", List.of(map.get("InvoiceHeaderDto")),
                "count", 1,
                "hasMore", false,
                "totalResults", 1,
                "limit", 25,
                "offset", 0
        ));

        map.put("OrderResponse", Map.of(
                "id", 1,
                "reference", "ORD-20260601-001",
                "farmerId", 1,
                "farmerName", "Tendai Moyo",
                "buyerId", 1,
                "buyerCompanyName", "Woolworths SA",
                "status", "SHIPPED",
                "totalAmount", new BigDecimal("4200.00"),
                "currencyCode", "USD",
                "notes", "Fresh roses export order"
        ));

        map.put("PaymentDto", Map.of(
                "PaymentId", 1,
                "PaymentNumber", "PAY-001",
                "OrderNumber", "ORD-20260601-001",
                "PaymentAmount", new BigDecimal("4200.00"),
                "PaymentCurrencyCode", "USD",
                "PaymentMethodCode", "STRIPE",
                "PaymentStatus", "COMPLETED",
                "PaymentDate", "2026-06-01T10:30:00"
        ));

        map.put("MarketplaceProductResponse", Map.of(
                "id", 1,
                "sku", "MST-00001",
                "name", "Premium Roses",
                "category", "Flowers",
                "supplier", "Moyo Fresh Farms",
                "country", "ZW",
                "priceUsd", new BigDecimal("4.50"),
                "unit", "STEM",
                "stock", new BigDecimal("2000"),
                "available", true
        ));

        return map;
    }
}
