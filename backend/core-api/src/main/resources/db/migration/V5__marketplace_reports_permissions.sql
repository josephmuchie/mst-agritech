-- ============================================================
-- V5: Permissions, marketplace data, report catalog
-- ============================================================

INSERT INTO permissions (resource, action) VALUES
    ('users', 'read'), ('users', 'write'),
    ('orders', 'read'), ('orders', 'write'), ('orders', 'all'), ('orders', 'status'),
    ('farmers', 'read'), ('farmers', 'write'),
    ('buyers', 'read'), ('buyers', 'write'),
    ('marketplace', 'read'), ('products', 'write'),
    ('payments', 'read'), ('payments', 'write'),
    ('shipments', 'read'), ('shipments', 'write'),
    ('reports', 'read'), ('reports', 'all'),
    ('analytics', 'read'),
    ('settings', 'all'),
    ('audit', 'read')
ON CONFLICT (resource, action) DO NOTHING;

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p
WHERE r.name = 'ADMIN'
ON CONFLICT DO NOTHING;

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p
WHERE r.name = 'FARMER' AND p.resource IN ('farmers','orders','products') AND p.action IN ('write','read')
ON CONFLICT DO NOTHING;

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p
WHERE r.name = 'BUYER' AND ((p.resource = 'marketplace' AND p.action = 'read') OR (p.resource = 'orders' AND p.action = 'write') OR (p.resource = 'payments' AND p.action = 'read'))
ON CONFLICT DO NOTHING;

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p
WHERE r.name = 'LOGISTICS' AND p.resource IN ('shipments','orders') AND p.action IN ('write','status')
ON CONFLICT DO NOTHING;

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p
WHERE r.name = 'ANALYST' AND p.resource IN ('reports','analytics','orders','farmers') AND p.action = 'read'
ON CONFLICT DO NOTHING;

-- Marketplace prices (USD)
INSERT INTO market_prices (product_id, country_id, price, currency_id, price_source) VALUES
    ((SELECT id FROM products WHERE name = 'Premium Roses'), (SELECT id FROM countries WHERE iso_code = 'ZW'), 4.50, (SELECT id FROM currencies WHERE code = 'USD'), 'MST Marketplace'),
    ((SELECT id FROM products WHERE name = 'Beef Sirloin'), (SELECT id FROM countries WHERE iso_code = 'ZW'), 12.00, (SELECT id FROM currencies WHERE code = 'USD'), 'MST Marketplace'),
    ((SELECT id FROM products WHERE name = 'Tobacco Leaf'), (SELECT id FROM countries WHERE iso_code = 'ZW'), 3.20, (SELECT id FROM currencies WHERE code = 'USD'), 'MST Marketplace'),
    ((SELECT id FROM products WHERE name = 'Baby Corn'), (SELECT id FROM countries WHERE iso_code = 'ZW'), 3.00, (SELECT id FROM currencies WHERE code = 'USD'), 'MST Marketplace');

-- Harvest calendar stock per farmer/product
INSERT INTO harvest_calendars (farmer_id, product_id, harvest_month, expected_quantity, quantity_unit, season_year) VALUES
    ((SELECT id FROM farmers WHERE farm_name = 'Moyo Fresh Farms'), (SELECT id FROM products WHERE name = 'Premium Roses'), 6, 2000, 'STEM', 2026),
    ((SELECT id FROM farmers WHERE farm_name = 'Highveld Horticulture'), (SELECT id FROM products WHERE name = 'Beef Sirloin'), 6, 500, 'KG', 2026),
    ((SELECT id FROM farmers WHERE farm_name = 'Moyo Fresh Farms'), (SELECT id FROM products WHERE name = 'Tobacco Leaf'), 6, 10000, 'KG', 2026),
    ((SELECT id FROM farmers WHERE farm_name = 'Highveld Horticulture'), (SELECT id FROM products WHERE name = 'Baby Corn'), 6, 700, 'KG', 2026);

CREATE TABLE report_definitions (
    id BIGSERIAL PRIMARY KEY,
    report_key VARCHAR(100) NOT NULL UNIQUE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(50) NOT NULL,
    output_format VARCHAR(10) NOT NULL DEFAULT 'PDF',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

INSERT INTO report_definitions (report_key, title, description, category, output_format) VALUES
    ('sales-summary', 'Sales Summary', 'Monthly revenue breakdown by product and buyer country', 'Sales', 'PDF'),
    ('farmer-performance', 'Farmer Performance', 'Yield and delivery metrics per verified farmer', 'Operations', 'PDF'),
    ('shipment-status', 'Shipment Status Report', 'Current in-transit shipments with ETAs and carrier details', 'Logistics', 'PDF'),
    ('payment-reconciliation', 'Payment Reconciliation', 'Matched payments against invoices across all currencies', 'Finance', 'PDF'),
    ('market-prices', 'Market Price Report', 'Weekly commodity price trends and benchmarks', 'Analytics', 'PDF'),
    ('audit-log-export', 'Audit Log Export', 'Full audit trail export with IP tracking', 'Compliance', 'CSV');
