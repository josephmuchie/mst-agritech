-- ============================================================
-- V1: MST Agritech Base Schema
-- ============================================================

-- Users & Auth
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE roles (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description VARCHAR(500)
);

CREATE TABLE permissions (
    id BIGSERIAL PRIMARY KEY,
    resource VARCHAR(100) NOT NULL,
    action VARCHAR(50) NOT NULL,
    UNIQUE (resource, action)
);

CREATE TABLE user_roles (
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role_id BIGINT NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, role_id)
);

CREATE TABLE role_permissions (
    role_id BIGINT NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    permission_id BIGINT NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
    PRIMARY KEY (role_id, permission_id)
);

CREATE TABLE audit_logs (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id),
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(100),
    entity_id VARCHAR(100),
    ip_address VARCHAR(50),
    user_agent VARCHAR(500),
    request_payload TEXT,
    response_status INTEGER,
    error_message TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Master Data
CREATE TABLE countries (
    id BIGSERIAL PRIMARY KEY,
    iso_code CHAR(2) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    region VARCHAR(100),
    is_active BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE currencies (
    id BIGSERIAL PRIMARY KEY,
    code CHAR(3) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    symbol VARCHAR(10) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE product_categories (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    parent_id BIGINT REFERENCES product_categories(id),
    description TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE products (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    category_id BIGINT NOT NULL REFERENCES product_categories(id),
    unit_of_measure VARCHAR(50) NOT NULL,
    description TEXT,
    hs_code VARCHAR(20),
    requires_cold_chain BOOLEAN NOT NULL DEFAULT FALSE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE app_settings (
    id BIGSERIAL PRIMARY KEY,
    setting_key VARCHAR(200) NOT NULL UNIQUE,
    setting_value TEXT,
    description VARCHAR(500),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Farmers
CREATE TABLE farmers (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id),
    country_id BIGINT NOT NULL REFERENCES countries(id),
    farm_name VARCHAR(255) NOT NULL,
    province VARCHAR(100),
    gps_latitude DECIMAL(10,7),
    gps_longitude DECIMAL(10,7),
    total_hectares DECIMAL(10,2),
    is_verified BOOLEAN NOT NULL DEFAULT FALSE,
    verified_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE farmer_certifications (
    id BIGSERIAL PRIMARY KEY,
    farmer_id BIGINT NOT NULL REFERENCES farmers(id) ON DELETE CASCADE,
    cert_type VARCHAR(100) NOT NULL,
    issuer VARCHAR(255),
    issue_date DATE,
    expiry_date DATE,
    document_url VARCHAR(1000),
    is_active BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE harvest_calendars (
    id BIGSERIAL PRIMARY KEY,
    farmer_id BIGINT NOT NULL REFERENCES farmers(id) ON DELETE CASCADE,
    product_id BIGINT NOT NULL REFERENCES products(id),
    harvest_month SMALLINT NOT NULL CHECK (harvest_month BETWEEN 1 AND 12),
    expected_quantity DECIMAL(12,2) NOT NULL,
    quantity_unit VARCHAR(50) NOT NULL,
    notes TEXT,
    season_year SMALLINT NOT NULL
);

CREATE TABLE farmer_media (
    id BIGSERIAL PRIMARY KEY,
    farmer_id BIGINT NOT NULL REFERENCES farmers(id) ON DELETE CASCADE,
    media_type VARCHAR(20) NOT NULL,
    file_url VARCHAR(1000) NOT NULL,
    caption VARCHAR(500),
    uploaded_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Buyers
CREATE TABLE buyers (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id),
    company_name VARCHAR(255) NOT NULL,
    country_id BIGINT NOT NULL REFERENCES countries(id),
    buyer_type VARCHAR(50) NOT NULL,
    contact_email VARCHAR(255),
    contact_phone VARCHAR(50),
    is_verified BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Logistics
CREATE TABLE logistics_companies (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    company_type VARCHAR(50) NOT NULL,
    regions_served TEXT,
    tracking_api_url VARCHAR(1000),
    api_key_encrypted VARCHAR(1000),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Subscriptions
CREATE TABLE subscription_plans (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    currency_id BIGINT NOT NULL REFERENCES currencies(id),
    billing_cycle VARCHAR(20) NOT NULL,
    features JSONB,
    is_active BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE subscriptions (
    id BIGSERIAL PRIMARY KEY,
    buyer_id BIGINT NOT NULL REFERENCES buyers(id),
    plan_id BIGINT NOT NULL REFERENCES subscription_plans(id),
    status VARCHAR(30) NOT NULL DEFAULT 'ACTIVE',
    start_date DATE NOT NULL,
    end_date DATE,
    stripe_subscription_id VARCHAR(255),
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Orders
CREATE TABLE orders (
    id BIGSERIAL PRIMARY KEY,
    reference VARCHAR(50) NOT NULL UNIQUE,
    farmer_id BIGINT NOT NULL REFERENCES farmers(id),
    buyer_id BIGINT NOT NULL REFERENCES buyers(id),
    status VARCHAR(30) NOT NULL DEFAULT 'DRAFT',
    total_amount DECIMAL(12,2),
    currency_id BIGINT REFERENCES currencies(id),
    notes TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE order_items (
    id BIGSERIAL PRIMARY KEY,
    order_id BIGINT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id BIGINT NOT NULL REFERENCES products(id),
    quantity DECIMAL(12,2) NOT NULL,
    quantity_unit VARCHAR(50) NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    line_total DECIMAL(12,2) GENERATED ALWAYS AS (quantity * unit_price) STORED
);

CREATE TABLE quotes (
    id BIGSERIAL PRIMARY KEY,
    order_id BIGINT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    valid_until TIMESTAMP,
    notes TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Payments
CREATE TABLE exchange_rates (
    id BIGSERIAL PRIMARY KEY,
    from_currency_id BIGINT NOT NULL REFERENCES currencies(id),
    to_currency_id BIGINT NOT NULL REFERENCES currencies(id),
    rate DECIMAL(20,8) NOT NULL,
    recorded_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE payments (
    id BIGSERIAL PRIMARY KEY,
    order_id BIGINT NOT NULL REFERENCES orders(id),
    gateway VARCHAR(50) NOT NULL,
    transaction_id VARCHAR(255),
    amount DECIMAL(12,2) NOT NULL,
    currency_id BIGINT NOT NULL REFERENCES currencies(id),
    status VARCHAR(30) NOT NULL DEFAULT 'PENDING',
    gateway_response TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Shipments
CREATE TABLE shipments (
    id BIGSERIAL PRIMARY KEY,
    order_id BIGINT NOT NULL REFERENCES orders(id),
    logistics_company_id BIGINT REFERENCES logistics_companies(id),
    shipment_type VARCHAR(30) NOT NULL,
    min_temp_celsius DECIMAL(5,2),
    max_temp_celsius DECIMAL(5,2),
    tracking_number VARCHAR(255),
    status VARCHAR(30) NOT NULL DEFAULT 'PENDING',
    estimated_departure TIMESTAMP,
    estimated_arrival TIMESTAMP,
    actual_arrival TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE shipment_tracking_events (
    id BIGSERIAL PRIMARY KEY,
    shipment_id BIGINT NOT NULL REFERENCES shipments(id) ON DELETE CASCADE,
    gps_latitude DECIMAL(10,7),
    gps_longitude DECIMAL(10,7),
    temperature_celsius DECIMAL(5,2),
    humidity_percent DECIMAL(5,2),
    status_event VARCHAR(100) NOT NULL,
    event_source VARCHAR(30) NOT NULL DEFAULT 'MANUAL',
    recorded_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE compliance_documents (
    id BIGSERIAL PRIMARY KEY,
    shipment_id BIGINT NOT NULL REFERENCES shipments(id) ON DELETE CASCADE,
    doc_type VARCHAR(100) NOT NULL,
    file_url VARCHAR(1000) NOT NULL,
    issued_by VARCHAR(255),
    issue_date DATE,
    expiry_date DATE,
    uploaded_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Integrations
CREATE TABLE integration_configs (
    id BIGSERIAL PRIMARY KEY,
    system_type VARCHAR(50) NOT NULL,
    display_name VARCHAR(255) NOT NULL,
    endpoint_url VARCHAR(1000),
    credentials_encrypted TEXT,
    extra_config JSONB,
    is_active BOOLEAN NOT NULL DEFAULT FALSE,
    last_sync_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Market Intelligence
CREATE TABLE market_prices (
    id BIGSERIAL PRIMARY KEY,
    product_id BIGINT NOT NULL REFERENCES products(id),
    country_id BIGINT REFERENCES countries(id),
    price DECIMAL(12,2) NOT NULL,
    currency_id BIGINT NOT NULL REFERENCES currencies(id),
    price_source VARCHAR(100),
    recorded_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ============================================================
-- Seed: Core reference data
-- ============================================================

INSERT INTO roles (name, description) VALUES
    ('ADMIN',     'Platform administrator with full access'),
    ('FARMER',    'Registered farmer / supplier'),
    ('BUYER',     'International buyer / importer'),
    ('LOGISTICS', 'Logistics company representative'),
    ('ANALYST',   'Read-only analytics user');

INSERT INTO currencies (code, name, symbol) VALUES
    ('USD', 'US Dollar',      '$'),
    ('EUR', 'Euro',           '€'),
    ('GBP', 'British Pound',  '£'),
    ('ZWL', 'Zimbabwe Dollar','Z$'),
    ('AED', 'UAE Dirham',     'د.إ'),
    ('ZAR', 'South African Rand', 'R');

INSERT INTO countries (iso_code, name, region) VALUES
    ('ZW', 'Zimbabwe',        'Sub-Saharan Africa'),
    ('ZA', 'South Africa',    'Sub-Saharan Africa'),
    ('GB', 'United Kingdom',  'Europe'),
    ('DE', 'Germany',         'Europe'),
    ('NL', 'Netherlands',     'Europe'),
    ('FR', 'France',          'Europe'),
    ('AE', 'United Arab Emirates', 'Middle East'),
    ('CN', 'China',           'Asia'),
    ('JP', 'Japan',           'Asia'),
    ('US', 'United States',   'North America');

INSERT INTO product_categories (name, description) VALUES
    ('Fresh Produce',   'Fruits and vegetables'),
    ('Flowers',         'Cut flowers and ornamental plants'),
    ('Meat & Livestock','Beef, chicken, pork, and live animals'),
    ('Grains & Cereals','Maize, wheat, sorghum, and other grains'),
    ('Tobacco',         'Tobacco leaf and products'),
    ('Dairy',           'Milk, cheese, and dairy products'),
    ('Herbs & Spices',  'Culinary herbs and spice crops');

INSERT INTO logistics_companies (name, company_type, regions_served) VALUES
    ('DHL Express',  'AIR',       'Global'),
    ('Maersk',       'SEA',       'Global'),
    ('MSC',          'SEA',       'Global'),
    ('ColdChain ZW', 'COLD_CHAIN','Southern Africa'),
    ('Swift Freight','ROAD',      'Southern Africa');

INSERT INTO app_settings (setting_key, setting_value, description) VALUES
    ('platform.name',            'MST Agritech',          'Platform display name'),
    ('platform.default_currency','USD',                   'Default currency code'),
    ('platform.support_email',   'support@mstagritech.co.zw', 'Support email'),
    ('order.reference_prefix',   'ORD',                   'Order reference number prefix'),
    ('payment.stripe_mode',      'sandbox',               'Stripe mode: sandbox or live');
