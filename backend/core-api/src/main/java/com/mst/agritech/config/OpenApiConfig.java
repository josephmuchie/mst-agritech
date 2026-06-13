package com.mst.agritech.config;

import io.swagger.v3.oas.models.*;
import io.swagger.v3.oas.models.info.*;
import io.swagger.v3.oas.models.security.*;
import io.swagger.v3.oas.models.servers.Server;
import io.swagger.v3.oas.models.tags.Tag;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.ArrayList;
import java.util.List;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI openAPI(
            @Value("${app.public-api-url:https://agritech-api.mst.co.zw}") String publicApiUrl) {
        String serverUrl = publicApiUrl.endsWith("/")
                ? publicApiUrl.substring(0, publicApiUrl.length() - 1)
                : publicApiUrl;

        List<Server> servers = new ArrayList<>();
        servers.add(new Server().url(serverUrl).description("MST Agritech API"));
        servers.add(new Server().url("http://localhost:8081").description("Local development"));

        return new OpenAPI()
                .info(new Info()
                        .title("MST Agritech Platform API")
                        .description("""
                                REST API for the MST Agritech agricultural trading platform.
                                Connects Zimbabwean farmers to global buyers for orders, payments, shipments, and analytics.

                                ## Authentication
                                Most endpoints require a JWT bearer token obtained via `POST /api/v1/auth/login`.
                                Include the token in the `Authorization: Bearer <token>` header.

                                ## Pagination
                                List endpoints accept `page` (zero-based) and `size` query parameters and return a Spring `Page` object.

                                ## Roles
                                Access is role-based: `ADMIN`, `FARMER`, `BUYER`, `LOGISTICS`, `ANALYST`, `USER`.
                                """)
                        .version("1.0.0")
                        .contact(new Contact()
                                .name("MST Agritech")
                                .email("dev@mstagritech.co.zw")))
                .servers(servers)
                .tags(List.of(
                        new Tag().name("Authentication").description("Login, registration, and JWT token issuance"),
                        new Tag().name("Dashboard").description("KPI snapshots and real-time SSE streams"),
                        new Tag().name("Farmers").description("Farmer profiles, verification, and farm details"),
                        new Tag().name("Buyers").description("Buyer companies and verification"),
                        new Tag().name("Orders").description("Order lifecycle from quote to delivery"),
                        new Tag().name("Invoices").description("Oracle Fusion-compatible invoice headers, lines, and distributions"),
                        new Tag().name("Payments").description("Payment transactions and reconciliation"),
                        new Tag().name("Shipments").description("Cold-chain logistics and shipment tracking"),
                        new Tag().name("Analytics").description("Revenue, product, and market analytics"),
                        new Tag().name("Marketplace").description("Product listings for international buyers"),
                        new Tag().name("Logistics").description("Freight and logistics company directory"),
                        new Tag().name("Reports").description("Report catalog and exports"),
                        new Tag().name("Settings").description("General platform configuration"),
                        new Tag().name("Data Ingestion").description("Excel and API bulk data import"),
                        new Tag().name("Users").description("Platform user administration"),
                        new Tag().name("Roles").description("Role definitions and permissions"),
                        new Tag().name("Master Data").description("Countries, currencies, and product categories"),
                        new Tag().name("Audit Logs").description("System audit trail for admin review"),
                        new Tag().name("Integrations").description("ERP connectors, invoice sync, and invoke endpoints")))
                .addSecurityItem(new SecurityRequirement().addList("bearerAuth"))
                .components(new Components()
                        .addSecuritySchemes("bearerAuth",
                                new SecurityScheme()
                                        .name("bearerAuth")
                                        .type(SecurityScheme.Type.HTTP)
                                        .scheme("bearer")
                                        .bearerFormat("JWT")
                                        .description("JWT access token from /api/v1/auth/login")));
    }
}
