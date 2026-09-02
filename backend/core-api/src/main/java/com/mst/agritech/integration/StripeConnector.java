package com.mst.agritech.integration;

import org.springframework.stereotype.Component;

/**
 * Stripe payment processing — sandbox credentials exist, but the API integration itself hasn't
 * been written yet, so this stays a stub for now rather than being the one connector implemented
 * ahead of the rest. See PendingIntegrationConnector.
 */
@Component
public class StripeConnector extends PendingIntegrationConnector {
    public StripeConnector() {
        super("STRIPE");
    }
}
