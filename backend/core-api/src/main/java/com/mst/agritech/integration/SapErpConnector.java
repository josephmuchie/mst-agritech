package com.mst.agritech.integration;

import org.springframework.stereotype.Component;

/**
 * SAP ERP data sync (invoices/orders) — no credentials configured yet. Unrelated to
 * PunchoutService's SAP SRM support, which is a buyer-side PunchOut client, not this.
 * See PendingIntegrationConnector.
 */
@Component
public class SapErpConnector extends PendingIntegrationConnector {
    public SapErpConnector() {
        super("SAP_ERP");
    }
}
