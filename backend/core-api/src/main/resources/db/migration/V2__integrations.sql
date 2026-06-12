-- External invoices imported from ERP systems (e.g. Oracle)
CREATE TABLE external_invoices (
    id BIGSERIAL PRIMARY KEY,
    integration_config_id BIGINT NOT NULL REFERENCES integration_configs(id) ON DELETE CASCADE,
    external_id VARCHAR(100) NOT NULL,
    invoice_number VARCHAR(100) NOT NULL,
    buyer_name VARCHAR(255),
    order_reference VARCHAR(50),
    amount DECIMAL(12,2) NOT NULL,
    currency_code CHAR(3) NOT NULL DEFAULT 'USD',
    status VARCHAR(30) NOT NULL DEFAULT 'IMPORTED',
    issue_date DATE,
    due_date DATE,
    raw_payload JSONB,
    synced_at TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE (integration_config_id, external_id)
);

CREATE INDEX idx_external_invoices_config ON external_invoices(integration_config_id);
CREATE INDEX idx_external_invoices_order_ref ON external_invoices(order_reference);

-- Sync / invoke run history
CREATE TABLE integration_sync_runs (
    id BIGSERIAL PRIMARY KEY,
    integration_config_id BIGINT NOT NULL REFERENCES integration_configs(id) ON DELETE CASCADE,
    flow_type VARCHAR(50) NOT NULL,
    trigger_type VARCHAR(30) NOT NULL DEFAULT 'MANUAL',
    status VARCHAR(20) NOT NULL,
    records_processed INT NOT NULL DEFAULT 0,
    error_message TEXT,
    started_at TIMESTAMP NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMP
);

CREATE INDEX idx_integration_sync_runs_config ON integration_sync_runs(integration_config_id);

-- Seed Oracle ERP connector (inactive until configured in admin)
INSERT INTO integration_configs (system_type, display_name, endpoint_url, extra_config, is_active)
VALUES (
    'ORACLE_ERP',
    'Oracle ERP Cloud',
    NULL,
    '{"environment":"sandbox","dataFlows":["INVOICES"],"syncDirection":"INBOUND","invoiceEndpoint":"/fscmRestApi/resources/latest/invoices","autoSyncEnabled":false,"description":"Share invoices from Oracle Financials into MST Agritech"}',
    FALSE
);

-- Global integration settings
INSERT INTO app_settings (setting_key, setting_value, description) VALUES
    ('integration.auto_sync_enabled', 'false', 'Enable scheduled auto-sync for active connectors'),
    ('integration.default_retry_count', '3', 'Default retry attempts for failed integration invokes'),
    ('integration.oracle.enabled', 'true', 'Allow Oracle ERP connector to be configured and invoked')
ON CONFLICT (setting_key) DO NOTHING;
