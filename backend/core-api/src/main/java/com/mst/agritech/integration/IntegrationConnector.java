package com.mst.agritech.integration;

import com.mst.agritech.domain.entity.IntegrationConfig;

public interface IntegrationConnector {
    String getSystemType();
    boolean supports(IntegrationFlowType flowType);
    IntegrationConnectorResult execute(IntegrationConfig config, IntegrationFlowType flowType);
}
