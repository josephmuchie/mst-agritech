package com.mst.agritech.integration;

import org.springframework.stereotype.Component;

/** Maersk ocean freight booking/tracking — no credentials configured yet. See PendingIntegrationConnector. */
@Component
public class MaerskConnector extends PendingIntegrationConnector {
    public MaerskConnector() {
        super("MAERSK");
    }
}
