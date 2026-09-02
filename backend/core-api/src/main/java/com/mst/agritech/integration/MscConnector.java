package com.mst.agritech.integration;

import org.springframework.stereotype.Component;

/** MSC ocean freight booking/tracking — no credentials configured yet. See PendingIntegrationConnector. */
@Component
public class MscConnector extends PendingIntegrationConnector {
    public MscConnector() {
        super("MSC");
    }
}
