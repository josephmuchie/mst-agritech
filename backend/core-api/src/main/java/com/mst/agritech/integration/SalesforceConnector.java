package com.mst.agritech.integration;

import org.springframework.stereotype.Component;

/** Salesforce CRM sync — no credentials configured yet. See PendingIntegrationConnector. */
@Component
public class SalesforceConnector extends PendingIntegrationConnector {
    public SalesforceConnector() {
        super("SALESFORCE");
    }
}
