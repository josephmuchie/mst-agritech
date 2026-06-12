package com.mst.agritech.integration;

import com.mst.agritech.exception.ResourceNotFoundException;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

@Component
public class IntegrationConnectorRegistry {

    private final Map<String, IntegrationConnector> connectors;

    public IntegrationConnectorRegistry(List<IntegrationConnector> connectorList) {
        this.connectors = connectorList.stream()
                .collect(Collectors.toMap(IntegrationConnector::getSystemType, Function.identity()));
    }

    public IntegrationConnector getConnector(String systemType) {
        IntegrationConnector connector = connectors.get(systemType);
        if (connector == null) {
            throw new ResourceNotFoundException("No connector registered for system: " + systemType);
        }
        return connector;
    }
}
