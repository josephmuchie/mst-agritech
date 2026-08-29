package com.mst.agritech.integration;

import com.mst.agritech.domain.entity.IntegrationConfig;

import java.util.List;

/**
 * Base for a connector whose system type exists in the integration catalog — so it shows up in
 * Administration &gt; Integrations as a real, nameable connector — but has no working
 * implementation behind it yet (no credentials issued, no API contract written). supports() and
 * execute() are final: a connector in this state must never report success, since that would be
 * exactly the mock-fallback pattern removed from OracleErpConnector. Once a provider is actually
 * ready to be built, its class stops extending this and implements IntegrationConnector directly,
 * the way OracleErpConnector does.
 */
public abstract class PendingIntegrationConnector implements IntegrationConnector {

    private final String systemType;

    protected PendingIntegrationConnector(String systemType) {
        this.systemType = systemType;
    }

    @Override
    public final String getSystemType() {
        return systemType;
    }

    @Override
    public final boolean supports(IntegrationFlowType flowType) {
        return false;
    }

    @Override
    public final IntegrationConnectorResult execute(IntegrationConfig config, IntegrationFlowType flowType) {
        return IntegrationConnectorResult.builder()
                .success(false)
                .recordsProcessed(0)
                .message(systemType + " connector is not implemented yet")
                .invoices(List.of())
                .build();
    }
}
