package com.mst.agritech.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.mst.agritech.domain.entity.*;
import com.mst.agritech.dto.request.InvokeIntegrationRequest;
import com.mst.agritech.dto.request.UpdateIntegrationConfigRequest;
import com.mst.agritech.dto.request.UpdateIntegrationSettingsRequest;
import com.mst.agritech.dto.response.*;
import com.mst.agritech.exception.ConflictException;
import com.mst.agritech.exception.ResourceNotFoundException;
import com.mst.agritech.integration.*;
import com.mst.agritech.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class IntegrationService {

    private final IntegrationConfigRepository configRepository;
    private final ExternalInvoiceRepository invoiceRepository;
    private final IntegrationSyncRunRepository syncRunRepository;
    private final AppSettingRepository appSettingRepository;
    private final IntegrationConnectorRegistry connectorRegistry;
    private final ObjectMapper objectMapper;

    public List<IntegrationConfigResponse> listConfigs() {
        return configRepository.findAllByOrderByDisplayNameAsc().stream()
                .map(this::toConfigResponse)
                .toList();
    }

    public IntegrationConfigResponse getConfig(Long id) {
        return toConfigResponse(findConfig(id));
    }

    @Transactional
    public IntegrationConfigResponse updateConfig(Long id, UpdateIntegrationConfigRequest request) {
        IntegrationConfig config = findConfig(id);
        if (request.getDisplayName() != null) config.setDisplayName(request.getDisplayName());
        if (request.getEndpointUrl() != null) config.setEndpointUrl(request.getEndpointUrl());
        if (request.getCredentialsJson() != null) config.setCredentialsEncrypted(request.getCredentialsJson());
        if (request.getExtraConfig() != null) config.setExtraConfig(request.getExtraConfig());
        if (request.getActive() != null) config.setActive(request.getActive());
        return toConfigResponse(configRepository.save(config));
    }

    @Transactional
    public IntegrationInvokeResponse invoke(Long id, InvokeIntegrationRequest request) {
        IntegrationConfig config = findConfig(id);
        if ("ORACLE_ERP".equals(config.getSystemType()) && !getBoolSetting("integration.oracle.enabled", true)) {
            throw new ConflictException("Oracle ERP connector is disabled in App Settings → Integration Settings.");
        }
        if (!config.isActive()) {
            throw new ConflictException("Integration must be active before invoking. Enable it in the connector configuration.");
        }

        IntegrationFlowType flowType;
        try {
            flowType = IntegrationFlowType.valueOf(request.getFlowType().toUpperCase());
        } catch (IllegalArgumentException ex) {
            throw new ConflictException("Unsupported flow type: " + request.getFlowType());
        }

        IntegrationConnector connector = connectorRegistry.getConnector(config.getSystemType());
        if (!connector.supports(flowType)) {
            throw new ConflictException(config.getSystemType() + " does not support flow: " + flowType);
        }

        IntegrationSyncRun run = IntegrationSyncRun.builder()
                .integrationConfig(config)
                .flowType(flowType.name())
                .triggerType("MANUAL")
                .status("RUNNING")
                .build();
        run = syncRunRepository.save(run);

        IntegrationConnectorResult result = connector.execute(config, flowType);

        if (result.isSuccess() && flowType == IntegrationFlowType.INVOICES) {
            persistInvoices(config, result.getInvoices());
        }

        run.setStatus(result.isSuccess() ? "SUCCESS" : "FAILED");
        run.setRecordsProcessed(result.getRecordsProcessed());
        run.setErrorMessage(result.isSuccess() ? null : result.getMessage());
        run.setCompletedAt(LocalDateTime.now());
        syncRunRepository.save(run);

        if (result.isSuccess()) {
            config.setLastSyncAt(LocalDateTime.now());
            configRepository.save(config);
        }

        return IntegrationInvokeResponse.builder()
                .runId(run.getId())
                .systemType(config.getSystemType())
                .flowType(flowType.name())
                .status(run.getStatus())
                .recordsProcessed(run.getRecordsProcessed())
                .message(result.getMessage())
                .completedAt(run.getCompletedAt())
                .build();
    }

    public Page<IntegrationSyncRunResponse> listSyncRuns(Long configId, Pageable pageable) {
        findConfig(configId);
        return syncRunRepository.findByIntegrationConfigIdOrderByStartedAtDesc(configId, pageable)
                .map(this::toSyncRunResponse);
    }

    public Page<ExternalInvoiceResponse> listInvoices(Long configId, Pageable pageable) {
        findConfig(configId);
        return invoiceRepository.findByIntegrationConfigId(configId, pageable)
                .map(this::toInvoiceResponse);
    }

    public IntegrationSettingsResponse getSettings() {
        return IntegrationSettingsResponse.builder()
                .autoSyncEnabled(getBoolSetting("integration.auto_sync_enabled", false))
                .defaultRetryCount(getIntSetting("integration.default_retry_count", 3))
                .oracleEnabled(getBoolSetting("integration.oracle.enabled", true))
                .build();
    }

    @Transactional
    public IntegrationSettingsResponse updateSettings(UpdateIntegrationSettingsRequest request) {
        if (request.getAutoSyncEnabled() != null) {
            upsertSetting("integration.auto_sync_enabled", String.valueOf(request.getAutoSyncEnabled()));
        }
        if (request.getDefaultRetryCount() != null) {
            upsertSetting("integration.default_retry_count", String.valueOf(request.getDefaultRetryCount()));
        }
        if (request.getOracleEnabled() != null) {
            upsertSetting("integration.oracle.enabled", String.valueOf(request.getOracleEnabled()));
        }
        return getSettings();
    }

    private void persistInvoices(IntegrationConfig config, List<ExternalInvoice> invoices) {
        for (ExternalInvoice incoming : invoices) {
            invoiceRepository.findByIntegrationConfigIdAndExternalId(config.getId(), incoming.getExternalId())
                    .ifPresentOrElse(existing -> {
                        existing.setInvoiceNumber(incoming.getInvoiceNumber());
                        existing.setBuyerName(incoming.getBuyerName());
                        existing.setOrderReference(incoming.getOrderReference());
                        existing.setAmount(incoming.getAmount());
                        existing.setCurrencyCode(incoming.getCurrencyCode());
                        existing.setStatus(incoming.getStatus());
                        existing.setIssueDate(incoming.getIssueDate());
                        existing.setDueDate(incoming.getDueDate());
                        existing.setRawPayload(incoming.getRawPayload());
                        existing.setSyncedAt(LocalDateTime.now());
                        invoiceRepository.save(existing);
                    }, () -> {
                        incoming.setIntegrationConfig(config);
                        invoiceRepository.save(incoming);
                    });
        }
    }

    private IntegrationConfig findConfig(Long id) {
        return configRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Integration", id));
    }

    private IntegrationConfigResponse toConfigResponse(IntegrationConfig config) {
        String environment = "sandbox";
        List<String> dataFlows = new ArrayList<>();
        String description = "";
        try {
            if (config.getExtraConfig() != null) {
                JsonNode node = objectMapper.readTree(config.getExtraConfig());
                environment = node.path("environment").asText("sandbox");
                description = node.path("description").asText("");
                if (node.has("dataFlows") && node.get("dataFlows").isArray()) {
                    node.get("dataFlows").forEach(f -> dataFlows.add(f.asText()));
                }
            }
        } catch (Exception ignored) { }

        boolean configured = config.getEndpointUrl() != null && !config.getEndpointUrl().isBlank();

        return IntegrationConfigResponse.builder()
                .id(config.getId())
                .systemType(config.getSystemType())
                .displayName(config.getDisplayName())
                .endpointUrl(config.getEndpointUrl())
                .active(config.isActive())
                .configured(configured)
                .environment(environment)
                .dataFlows(dataFlows)
                .description(description)
                .lastSyncAt(config.getLastSyncAt())
                .updatedAt(config.getUpdatedAt())
                .build();
    }

    private IntegrationSyncRunResponse toSyncRunResponse(IntegrationSyncRun run) {
        return IntegrationSyncRunResponse.builder()
                .id(run.getId())
                .integrationConfigId(run.getIntegrationConfig().getId())
                .flowType(run.getFlowType())
                .triggerType(run.getTriggerType())
                .status(run.getStatus())
                .recordsProcessed(run.getRecordsProcessed())
                .errorMessage(run.getErrorMessage())
                .startedAt(run.getStartedAt())
                .completedAt(run.getCompletedAt())
                .build();
    }

    private ExternalInvoiceResponse toInvoiceResponse(ExternalInvoice invoice) {
        return ExternalInvoiceResponse.builder()
                .id(invoice.getId())
                .integrationConfigId(invoice.getIntegrationConfig().getId())
                .externalId(invoice.getExternalId())
                .invoiceNumber(invoice.getInvoiceNumber())
                .buyerName(invoice.getBuyerName())
                .orderReference(invoice.getOrderReference())
                .amount(invoice.getAmount())
                .currencyCode(invoice.getCurrencyCode())
                .status(invoice.getStatus())
                .issueDate(invoice.getIssueDate())
                .dueDate(invoice.getDueDate())
                .syncedAt(invoice.getSyncedAt())
                .build();
    }

    private boolean getBoolSetting(String key, boolean defaultValue) {
        return appSettingRepository.findBySettingKey(key)
                .map(s -> Boolean.parseBoolean(s.getSettingValue()))
                .orElse(defaultValue);
    }

    private int getIntSetting(String key, int defaultValue) {
        return appSettingRepository.findBySettingKey(key)
                .map(s -> {
                    try { return Integer.parseInt(s.getSettingValue()); }
                    catch (NumberFormatException e) { return defaultValue; }
                })
                .orElse(defaultValue);
    }

    private void upsertSetting(String key, String value) {
        AppSetting setting = appSettingRepository.findBySettingKey(key)
                .orElse(AppSetting.builder().settingKey(key).build());
        setting.setSettingValue(value);
        appSettingRepository.save(setting);
    }
}
