-- Multi-tenant SSO support
CREATE TABLE tenants (
    id BIGSERIAL PRIMARY KEY,
    slug VARCHAR(100) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    email_domains TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE tenant_sso_configs (
    id BIGSERIAL PRIMARY KEY,
    tenant_id BIGINT NOT NULL UNIQUE REFERENCES tenants(id) ON DELETE CASCADE,
    enabled BOOLEAN NOT NULL DEFAULT FALSE,
    provider_label VARCHAR(100) NOT NULL DEFAULT 'Corporate SSO',
    provider_type VARCHAR(30) NOT NULL DEFAULT 'OIDC',
    issuer_uri VARCHAR(1000),
    client_id VARCHAR(500),
    client_secret_encrypted TEXT,
    authorization_uri VARCHAR(1000),
    token_uri VARCHAR(1000),
    userinfo_uri VARCHAR(1000),
    scopes VARCHAR(500) NOT NULL DEFAULT 'openid profile email',
    auto_provision_users BOOLEAN NOT NULL DEFAULT TRUE,
    allow_password_login BOOLEAN NOT NULL DEFAULT TRUE,
    default_role_name VARCHAR(100) NOT NULL DEFAULT 'FARMER',
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE sso_auth_states (
    state VARCHAR(64) PRIMARY KEY,
    tenant_id BIGINT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    code_verifier VARCHAR(128) NOT NULL,
    redirect_uri VARCHAR(1000) NOT NULL,
    email_hint VARCHAR(255),
    expires_at TIMESTAMP NOT NULL
);

ALTER TABLE users ADD COLUMN tenant_id BIGINT REFERENCES tenants(id);
ALTER TABLE users ADD COLUMN sso_subject VARCHAR(255);
ALTER TABLE users ALTER COLUMN password_hash DROP NOT NULL;

CREATE INDEX idx_users_tenant_email ON users(tenant_id, email);
CREATE UNIQUE INDEX idx_users_tenant_sso_subject ON users(tenant_id, sso_subject) WHERE sso_subject IS NOT NULL;

-- Default tenant for MST Agritech
INSERT INTO tenants (slug, name, email_domains) VALUES
    ('mst-agritech', 'MST Agritech', 'mstagritech.co.zw');

INSERT INTO tenant_sso_configs (
    tenant_id, enabled, provider_label, provider_type, issuer_uri, client_id,
    authorization_uri, token_uri, userinfo_uri, auto_provision_users, allow_password_login
) VALUES (
    1, TRUE, 'MST Corporate SSO', 'MOCK', 'mock://local', 'mock-sso-client',
    NULL, NULL, NULL, TRUE, TRUE
);

INSERT INTO app_settings (setting_key, setting_value, description) VALUES
    ('sso.mock_enabled', 'true', 'Enable built-in mock SSO provider for development and demos')
ON CONFLICT (setting_key) DO NOTHING;
