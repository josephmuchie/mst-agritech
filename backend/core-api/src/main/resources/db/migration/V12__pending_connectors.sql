-- Seed catalog rows for connectors that are on the roadmap but not yet implemented
-- (SalesforceConnector, SapErpConnector, DhlConnector, MaerskConnector, MscConnector,
-- StripeConnector, PaypalConnector all extend PendingIntegrationConnector, which never
-- reports success). Inactive by default; dataFlows is empty because none is supported yet.

INSERT INTO integration_configs (system_type, display_name, endpoint_url, extra_config, is_active)
VALUES
    ('SALESFORCE', 'Salesforce CRM', NULL,
     '{"environment":"sandbox","dataFlows":[],"description":"Sync buyer and farmer accounts with Salesforce CRM — not yet implemented"}',
     FALSE),
    ('SAP_ERP', 'SAP ERP', NULL,
     '{"environment":"sandbox","dataFlows":[],"description":"Share invoices and purchase orders with SAP ERP — not yet implemented"}',
     FALSE),
    ('DHL', 'DHL Express', NULL,
     '{"environment":"sandbox","dataFlows":[],"description":"Live shipment tracking via DHL Express — not yet implemented"}',
     FALSE),
    ('MAERSK', 'Maersk Line', NULL,
     '{"environment":"sandbox","dataFlows":[],"description":"Ocean freight booking and tracking via Maersk — not yet implemented"}',
     FALSE),
    ('MSC', 'MSC', NULL,
     '{"environment":"sandbox","dataFlows":[],"description":"Ocean freight booking and tracking via MSC — not yet implemented"}',
     FALSE),
    ('STRIPE', 'Stripe', NULL,
     '{"environment":"sandbox","dataFlows":[],"description":"Card payment processing via Stripe — sandbox credentials available, integration not yet written"}',
     FALSE),
    ('PAYPAL', 'PayPal', NULL,
     '{"environment":"sandbox","dataFlows":[],"description":"PayPal payment processing — sandbox credentials available, integration not yet written"}',
     FALSE);
