-- ============================================================
-- V4: Oracle-style invoice domain + demo transactional data
-- ============================================================

CREATE TABLE invoice_headers (
    id BIGSERIAL PRIMARY KEY,
    invoice_id VARCHAR(50) NOT NULL UNIQUE,
    invoice_number VARCHAR(50) NOT NULL,
    business_unit VARCHAR(100),
    legal_entity VARCHAR(100),
    invoice_type VARCHAR(50),
    invoice_date DATE,
    accounting_date DATE,
    invoice_amount DECIMAL(12,2) NOT NULL,
    invoice_currency_code CHAR(3) NOT NULL DEFAULT 'USD',
    payment_status_flag VARCHAR(30),
    validation_status VARCHAR(30),
    supplier_number VARCHAR(50),
    supplier_site VARCHAR(100),
    bill_to_customer_name VARCHAR(255),
    purchase_order_number VARCHAR(50),
    payment_terms VARCHAR(50),
    due_date DATE,
    description TEXT,
    conversion_rate DECIMAL(20,8),
    order_id BIGINT REFERENCES orders(id),
    integration_config_id BIGINT REFERENCES integration_configs(id),
    created_by VARCHAR(100),
    creation_date TIMESTAMP NOT NULL DEFAULT NOW(),
    last_update_date TIMESTAMP NOT NULL DEFAULT NOW(),
    last_updated_by VARCHAR(100)
);

CREATE TABLE invoice_lines (
    id BIGSERIAL PRIMARY KEY,
    invoice_line_id VARCHAR(50) NOT NULL UNIQUE,
    invoice_header_id BIGINT NOT NULL REFERENCES invoice_headers(id) ON DELETE CASCADE,
    line_number INT NOT NULL,
    line_type_lookup_code VARCHAR(50),
    amount DECIMAL(12,2) NOT NULL,
    quantity_invoiced DECIMAL(12,4),
    unit_price DECIMAL(12,4),
    item_description VARCHAR(500),
    uom_code VARCHAR(20),
    tax_classification_code VARCHAR(50),
    line_source VARCHAR(50),
    created_by VARCHAR(100),
    creation_date TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE invoice_distributions (
    id BIGSERIAL PRIMARY KEY,
    invoice_distribution_id VARCHAR(50) NOT NULL UNIQUE,
    invoice_line_id BIGINT NOT NULL REFERENCES invoice_lines(id) ON DELETE CASCADE,
    distribution_line_number INT NOT NULL,
    amount DECIMAL(12,2) NOT NULL,
    dist_code_combination_id VARCHAR(100),
    accounting_date DATE,
    description VARCHAR(500),
    distribution_class VARCHAR(50),
    created_by VARCHAR(100),
    creation_date TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_invoice_headers_order ON invoice_headers(order_id);
CREATE INDEX idx_invoice_lines_header ON invoice_lines(invoice_header_id);
CREATE INDEX idx_invoice_distributions_line ON invoice_distributions(invoice_line_id);

-- Demo products
INSERT INTO products (name, category_id, unit_of_measure, description, requires_cold_chain) VALUES
    ('Premium Roses',  (SELECT id FROM product_categories WHERE name = 'Flowers'),         'STEM',  'Export-grade cut roses', TRUE),
    ('Beef Sirloin',   (SELECT id FROM product_categories WHERE name = 'Meat & Livestock'),'KG',    'Chilled beef sirloin cuts', TRUE),
    ('Tobacco Leaf',   (SELECT id FROM product_categories WHERE name = 'Tobacco'),         'KG',    'Flue-cured tobacco leaf', FALSE),
    ('Baby Corn',      (SELECT id FROM product_categories WHERE name = 'Fresh Produce'),   'KG',    'Fresh baby corn cobs', TRUE);

-- Demo users (password: Admin123!)
INSERT INTO users (email, password_hash, full_name) VALUES
    ('admin@mstagritech.co.zw',  '$2a$12$8fT8OLxkwKhEEI7fdU8tj.FT02ObuPNwYpc.DvKRiPxGzOBnVRN7i', 'MST Admin'),
    ('farmer@mstagritech.co.zw', '$2a$12$8fT8OLxkwKhEEI7fdU8tj.FT02ObuPNwYpc.DvKRiPxGzOBnVRN7i', 'Tendai Moyo'),
    ('buyer@mstagritech.co.zw',  '$2a$12$8fT8OLxkwKhEEI7fdU8tj.FT02ObuPNwYpc.DvKRiPxGzOBnVRN7i', 'Sarah van der Berg'),
    ('analyst@mstagritech.co.zw','$2a$12$8fT8OLxkwKhEEI7fdU8tj.FT02ObuPNwYpc.DvKRiPxGzOBnVRN7i', 'James Analyst');

INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id FROM users u, roles r
WHERE (u.email = 'admin@mstagritech.co.zw'  AND r.name = 'ADMIN')
   OR (u.email = 'farmer@mstagritech.co.zw' AND r.name = 'FARMER')
   OR (u.email = 'buyer@mstagritech.co.zw'  AND r.name = 'BUYER')
   OR (u.email = 'analyst@mstagritech.co.zw' AND r.name = 'ANALYST');

INSERT INTO farmers (user_id, country_id, farm_name, province, total_hectares, is_verified) VALUES
    ((SELECT id FROM users WHERE email = 'farmer@mstagritech.co.zw'),
     (SELECT id FROM countries WHERE iso_code = 'ZW'),
     'Moyo Fresh Farms', 'Mashonaland East', 45.50, TRUE),
    ((SELECT id FROM users WHERE email = 'admin@mstagritech.co.zw'),
     (SELECT id FROM countries WHERE iso_code = 'ZW'),
     'Highveld Horticulture', 'Manicaland', 28.00, TRUE);

INSERT INTO buyers (user_id, company_name, country_id, buyer_type, contact_email, is_verified) VALUES
    ((SELECT id FROM users WHERE email = 'buyer@mstagritech.co.zw'),
     'Woolworths SA', (SELECT id FROM countries WHERE iso_code = 'ZA'), 'RETAIL', 'procurement@woolworths.co.za', TRUE),
    ((SELECT id FROM users WHERE email = 'admin@mstagritech.co.zw'),
     'Al Ain Farms UAE', (SELECT id FROM countries WHERE iso_code = 'AE'), 'RETAIL', 'imports@alainfarms.ae', TRUE),
    ((SELECT id FROM users WHERE email = 'analyst@mstagritech.co.zw'),
     'Tesco UK', (SELECT id FROM countries WHERE iso_code = 'GB'), 'RETAIL', 'global.sourcing@tesco.com', TRUE),
    ((SELECT id FROM users WHERE email = 'farmer@mstagritech.co.zw'),
     'Carrefour France', (SELECT id FROM countries WHERE iso_code = 'FR'), 'RETAIL', 'import@carrefour.fr', TRUE);

INSERT INTO orders (reference, farmer_id, buyer_id, status, total_amount, currency_id, notes) VALUES
    ('ORD-20260601-001',
     (SELECT id FROM farmers WHERE farm_name = 'Moyo Fresh Farms'),
     (SELECT id FROM buyers WHERE company_name = 'Woolworths SA'),
     'SHIPPED', 4200.00, (SELECT id FROM currencies WHERE code = 'USD'), 'Fresh roses export order'),
    ('ORD-20260603-002',
     (SELECT id FROM farmers WHERE farm_name = 'Highveld Horticulture'),
     (SELECT id FROM buyers WHERE company_name = 'Al Ain Farms UAE'),
     'IN_PRODUCTION', 12800.00, (SELECT id FROM currencies WHERE code = 'USD'), 'Beef cuts cold chain'),
    ('ORD-20260605-003',
     (SELECT id FROM farmers WHERE farm_name = 'Moyo Fresh Farms'),
     (SELECT id FROM buyers WHERE company_name = 'Tesco UK'),
     'QUOTED', 31500.00, (SELECT id FROM currencies WHERE code = 'USD'), 'Tobacco leaf bulk order'),
    ('ORD-20260607-004',
     (SELECT id FROM farmers WHERE farm_name = 'Highveld Horticulture'),
     (SELECT id FROM buyers WHERE company_name = 'Carrefour France'),
     'DELIVERED', 2100.00, (SELECT id FROM currencies WHERE code = 'USD'), 'Baby corn seasonal shipment');

INSERT INTO order_items (order_id, product_id, quantity, quantity_unit, unit_price) VALUES
    ((SELECT id FROM orders WHERE reference = 'ORD-20260601-001'),
     (SELECT id FROM products WHERE name = 'Premium Roses'), 1200, 'STEM', 3.50),
    ((SELECT id FROM orders WHERE reference = 'ORD-20260603-002'),
     (SELECT id FROM products WHERE name = 'Beef Sirloin'), 800, 'KG', 16.00),
    ((SELECT id FROM orders WHERE reference = 'ORD-20260605-003'),
     (SELECT id FROM products WHERE name = 'Tobacco Leaf'), 1500, 'KG', 21.00),
    ((SELECT id FROM orders WHERE reference = 'ORD-20260607-004'),
     (SELECT id FROM products WHERE name = 'Baby Corn'), 700, 'KG', 3.00);

INSERT INTO payments (order_id, gateway, transaction_id, amount, currency_id, status) VALUES
    ((SELECT id FROM orders WHERE reference = 'ORD-20260601-001'), 'STRIPE', 'PAY-001', 4200.00,
     (SELECT id FROM currencies WHERE code = 'USD'), 'COMPLETED'),
    ((SELECT id FROM orders WHERE reference = 'ORD-20260603-002'), 'PAYPAL', 'PAY-002', 8200.00,
     (SELECT id FROM currencies WHERE code = 'USD'), 'COMPLETED'),
    ((SELECT id FROM orders WHERE reference = 'ORD-20260605-003'), 'BANK_TRANSFER', 'PAY-003', 3100.00,
     (SELECT id FROM currencies WHERE code = 'EUR'), 'PENDING'),
    ((SELECT id FROM orders WHERE reference = 'ORD-20260607-004'), 'STRIPE', 'PAY-004', 2100.00,
     (SELECT id FROM currencies WHERE code = 'USD'), 'COMPLETED');

INSERT INTO shipments (order_id, logistics_company_id, shipment_type, min_temp_celsius, max_temp_celsius,
                       tracking_number, status, estimated_departure, estimated_arrival) VALUES
    ((SELECT id FROM orders WHERE reference = 'ORD-20260601-001'),
     (SELECT id FROM logistics_companies WHERE name = 'DHL Express'), 'AIR', 2.00, 8.00,
     'DHL-ZW-001234', 'IN_TRANSIT', NOW() - INTERVAL '2 days', NOW() + INTERVAL '5 days'),
    ((SELECT id FROM orders WHERE reference = 'ORD-20260605-003'),
     (SELECT id FROM logistics_companies WHERE name = 'MSC'), 'SEA', NULL, NULL,
     'MSC-ZW-005678', 'LOADING', NOW() + INTERVAL '3 days', NOW() + INTERVAL '28 days'),
    ((SELECT id FROM orders WHERE reference = 'ORD-20260607-004'),
     (SELECT id FROM logistics_companies WHERE name = 'Maersk'), 'SEA', 0.00, 4.00,
     'MAE-ZW-009012', 'DELIVERED', NOW() - INTERVAL '20 days', NOW() - INTERVAL '2 days');

-- Oracle-style invoice headers (linked to orders)
INSERT INTO invoice_headers (
    invoice_id, invoice_number, business_unit, legal_entity, invoice_type,
    invoice_date, accounting_date, invoice_amount, invoice_currency_code,
    payment_status_flag, validation_status, supplier_number, supplier_site,
    bill_to_customer_name, purchase_order_number, payment_terms, due_date, description,
    conversion_rate, order_id, integration_config_id, created_by, last_updated_by
) VALUES
    ('100001', 'INV-2026-001', 'MST BU ZW', 'MST Agritech ZW Ltd', 'Standard',
     '2026-06-01', '2026-06-01', 4200.00, 'USD', 'Y', 'Validated',
     'SUP-1001', 'Harare Main', 'Woolworths SA', 'ORD-20260601-001', 'Net 30', '2026-07-01',
     'Fresh roses export invoice', 1.00000000,
     (SELECT id FROM orders WHERE reference = 'ORD-20260601-001'),
     (SELECT id FROM integration_configs WHERE system_type = 'ORACLE_ERP'),
     'ORACLE_IMPORT', 'ORACLE_IMPORT'),
    ('100002', 'INV-2026-002', 'MST BU ZW', 'MST Agritech ZW Ltd', 'Standard',
     '2026-06-03', '2026-06-03', 12800.00, 'USD', 'N', 'Validated',
     'SUP-1002', 'Mutare Site', 'Al Ain Farms UAE', 'ORD-20260603-002', 'Net 30', '2026-07-03',
     'Beef cuts cold chain invoice', 1.00000000,
     (SELECT id FROM orders WHERE reference = 'ORD-20260603-002'),
     (SELECT id FROM integration_configs WHERE system_type = 'ORACLE_ERP'),
     'ORACLE_IMPORT', 'ORACLE_IMPORT'),
    ('100003', 'INV-2026-003', 'MST BU ZW', 'MST Agritech ZW Ltd', 'Standard',
     '2026-06-05', '2026-06-05', 31500.00, 'USD', 'N', 'Validated',
     'SUP-1001', 'Harare Main', 'Tesco UK', 'ORD-20260605-003', 'Net 45', '2026-07-20',
     'Tobacco leaf bulk invoice', 1.00000000,
     (SELECT id FROM orders WHERE reference = 'ORD-20260605-003'),
     (SELECT id FROM integration_configs WHERE system_type = 'ORACLE_ERP'),
     'ORACLE_IMPORT', 'ORACLE_IMPORT'),
    ('100004', 'INV-2026-004', 'MST BU ZW', 'MST Agritech ZW Ltd', 'Standard',
     '2026-06-07', '2026-06-07', 2100.00, 'USD', 'Y', 'Validated',
     'SUP-1002', 'Mutare Site', 'Carrefour France', 'ORD-20260607-004', 'Net 30', '2026-07-07',
     'Baby corn seasonal invoice', 1.00000000,
     (SELECT id FROM orders WHERE reference = 'ORD-20260607-004'),
     (SELECT id FROM integration_configs WHERE system_type = 'ORACLE_ERP'),
     'ORACLE_IMPORT', 'ORACLE_IMPORT');

INSERT INTO invoice_lines (
    invoice_line_id, invoice_header_id, line_number, line_type_lookup_code,
    amount, quantity_invoiced, unit_price, item_description, uom_code,
    tax_classification_code, line_source, created_by
) VALUES
    ('200001', (SELECT id FROM invoice_headers WHERE invoice_id = '100001'), 1, 'Item',
     4200.00, 1200.0000, 3.5000, 'Premium Roses - export grade', 'STEM', 'VAT-ZW-15', 'PO', 'ORACLE_IMPORT'),
    ('200002', (SELECT id FROM invoice_headers WHERE invoice_id = '100002'), 1, 'Item',
     12800.00, 800.0000, 16.0000, 'Beef Sirloin - chilled', 'KG', 'VAT-ZW-15', 'PO', 'ORACLE_IMPORT'),
    ('200003', (SELECT id FROM invoice_headers WHERE invoice_id = '100003'), 1, 'Item',
     31500.00, 1500.0000, 21.0000, 'Tobacco Leaf - flue cured', 'KG', 'VAT-ZW-0', 'PO', 'ORACLE_IMPORT'),
    ('200004', (SELECT id FROM invoice_headers WHERE invoice_id = '100004'), 1, 'Item',
     2100.00, 700.0000, 3.0000, 'Baby Corn - fresh', 'KG', 'VAT-ZW-15', 'PO', 'ORACLE_IMPORT');

INSERT INTO invoice_distributions (
    invoice_distribution_id, invoice_line_id, distribution_line_number,
    amount, dist_code_combination_id, accounting_date, description, distribution_class, created_by
) VALUES
    ('300001', (SELECT id FROM invoice_lines WHERE invoice_line_id = '200001'), 1,
     4200.00, '40100-2100-000-0000-000', '2026-06-01', 'Revenue - Flowers export', 'Revenue', 'ORACLE_IMPORT'),
    ('300002', (SELECT id FROM invoice_lines WHERE invoice_line_id = '200002'), 1,
     12800.00, '40100-2200-000-0000-000', '2026-06-03', 'Revenue - Meat export', 'Revenue', 'ORACLE_IMPORT'),
    ('300003', (SELECT id FROM invoice_lines WHERE invoice_line_id = '200003'), 1,
     31500.00, '40100-2300-000-0000-000', '2026-06-05', 'Revenue - Tobacco export', 'Revenue', 'ORACLE_IMPORT'),
    ('300004', (SELECT id FROM invoice_lines WHERE invoice_line_id = '200004'), 1,
     2100.00, '40100-2100-000-0000-000', '2026-06-07', 'Revenue - Produce export', 'Revenue', 'ORACLE_IMPORT');

-- Mirror into external_invoices for integration UI
INSERT INTO external_invoices (
    integration_config_id, external_id, invoice_number, buyer_name, order_reference,
    amount, currency_code, status, issue_date, due_date, raw_payload
) VALUES
    ((SELECT id FROM integration_configs WHERE system_type = 'ORACLE_ERP'), '100001', 'INV-2026-001',
     'Woolworths SA', 'ORD-20260601-001', 4200.00, 'USD', 'IMPORTED', '2026-06-01', '2026-07-01',
     '{"InvoiceId":"100001","InvoiceNumber":"INV-2026-001","InvoiceAmount":4200.00,"InvoiceCurrencyCode":"USD","BillToCustomerName":"Woolworths SA","PurchaseOrder":"ORD-20260601-001","PaymentStatusFlag":"Y","ValidationStatus":"Validated"}'),
    ((SELECT id FROM integration_configs WHERE system_type = 'ORACLE_ERP'), '100002', 'INV-2026-002',
     'Al Ain Farms UAE', 'ORD-20260603-002', 12800.00, 'USD', 'IMPORTED', '2026-06-03', '2026-07-03',
     '{"InvoiceId":"100002","InvoiceNumber":"INV-2026-002","InvoiceAmount":12800.00,"InvoiceCurrencyCode":"USD","BillToCustomerName":"Al Ain Farms UAE","PurchaseOrder":"ORD-20260603-002","PaymentStatusFlag":"N","ValidationStatus":"Validated"}'),
    ((SELECT id FROM integration_configs WHERE system_type = 'ORACLE_ERP'), '100003', 'INV-2026-003',
     'Tesco UK', 'ORD-20260605-003', 31500.00, 'USD', 'IMPORTED', '2026-06-05', '2026-07-20',
     '{"InvoiceId":"100003","InvoiceNumber":"INV-2026-003","InvoiceAmount":31500.00,"InvoiceCurrencyCode":"USD","BillToCustomerName":"Tesco UK","PurchaseOrder":"ORD-20260605-003","PaymentStatusFlag":"N","ValidationStatus":"Validated"}'),
    ((SELECT id FROM integration_configs WHERE system_type = 'ORACLE_ERP'), '100004', 'INV-2026-004',
     'Carrefour France', 'ORD-20260607-004', 2100.00, 'USD', 'IMPORTED', '2026-06-07', '2026-07-07',
     '{"InvoiceId":"100004","InvoiceNumber":"INV-2026-004","InvoiceAmount":2100.00,"InvoiceCurrencyCode":"USD","BillToCustomerName":"Carrefour France","PurchaseOrder":"ORD-20260607-004","PaymentStatusFlag":"Y","ValidationStatus":"Validated"}');
