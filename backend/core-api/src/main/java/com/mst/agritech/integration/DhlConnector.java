package com.mst.agritech.integration;

import org.springframework.stereotype.Component;

/** DHL Express shipment tracking — no credentials configured yet. See PendingIntegrationConnector. */
@Component
public class DhlConnector extends PendingIntegrationConnector {
    public DhlConnector() {
        super("DHL");
    }
}
