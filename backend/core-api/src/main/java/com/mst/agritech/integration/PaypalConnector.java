package com.mst.agritech.integration;

import org.springframework.stereotype.Component;

/**
 * PayPal payment processing — sandbox credentials exist, but the API integration itself hasn't
 * been written yet, so this stays a stub for now rather than being the one connector implemented
 * ahead of the rest. See PendingIntegrationConnector.
 */
@Component
public class PaypalConnector extends PendingIntegrationConnector {
    public PaypalConnector() {
        super("PAYPAL");
    }
}
