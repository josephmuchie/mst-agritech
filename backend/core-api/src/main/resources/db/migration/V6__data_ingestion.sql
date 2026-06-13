-- ============================================================
-- V6: Data ingestion jobs + permission
-- ============================================================

INSERT INTO permissions (resource, action) VALUES ('data', 'ingest')
ON CONFLICT (resource, action) DO NOTHING;

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p
WHERE r.name = 'ADMIN' AND p.resource = 'data' AND p.action = 'ingest'
ON CONFLICT DO NOTHING;

INSERT INTO app_settings (setting_key, setting_value, description) VALUES
    ('data.import.default_password', 'Import123!', 'Default password for users created via data ingestion'),
    ('data.import.max_rows', '5000', 'Maximum rows per Excel/API import batch')
ON CONFLICT (setting_key) DO NOTHING;

CREATE TABLE data_import_jobs (
    id BIGSERIAL PRIMARY KEY,
    import_type VARCHAR(50) NOT NULL,
    source VARCHAR(20) NOT NULL,
    file_name VARCHAR(255),
    status VARCHAR(30) NOT NULL DEFAULT 'PROCESSING',
    records_total INT NOT NULL DEFAULT 0,
    records_success INT NOT NULL DEFAULT 0,
    records_failed INT NOT NULL DEFAULT 0,
    error_summary TEXT,
    created_by_user_id BIGINT REFERENCES users(id),
    started_at TIMESTAMP NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMP
);

CREATE INDEX idx_data_import_jobs_started ON data_import_jobs(started_at DESC);
