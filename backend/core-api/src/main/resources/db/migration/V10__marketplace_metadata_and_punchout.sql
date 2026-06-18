-- ============================================================
-- V10: Richer marketplace product metadata + PunchOut / OCI support
-- ============================================================

-- ── Richer product metadata for standard catalog listings ──
ALTER TABLE products ADD COLUMN IF NOT EXISTS sku                 VARCHAR(100);
ALTER TABLE products ADD COLUMN IF NOT EXISTS image_url           VARCHAR(1000);
ALTER TABLE products ADD COLUMN IF NOT EXISTS origin_region       VARCHAR(255);
ALTER TABLE products ADD COLUMN IF NOT EXISTS packaging           VARCHAR(255);
ALTER TABLE products ADD COLUMN IF NOT EXISTS certifications      VARCHAR(500);
ALTER TABLE products ADD COLUMN IF NOT EXISTS incoterms           VARCHAR(20)  DEFAULT 'FOB';
ALTER TABLE products ADD COLUMN IF NOT EXISTS min_order_quantity  NUMERIC(12,2) DEFAULT 1;
ALTER TABLE products ADD COLUMN IF NOT EXISTS lead_time_days      INT          DEFAULT 7;
ALTER TABLE products ADD COLUMN IF NOT EXISTS shelf_life_days      INT;

-- UNSPSC commodity code used by procurement systems (Ariba/Oracle classification)
ALTER TABLE products ADD COLUMN IF NOT EXISTS unspsc_code         VARCHAR(20);

-- Generate deterministic SKUs for existing products that have none
UPDATE products
SET sku = 'MST-' || LPAD(id::TEXT, 5, '0')
WHERE sku IS NULL;

-- Seed richer metadata for the demo catalog products
UPDATE products SET
    image_url = 'https://images.unsplash.com/photo-1496062031456-07b8f162a322?w=600',
    origin_region = 'Mashonaland, Zimbabwe',
    packaging = 'Bunch of 20 stems, refrigerated box',
    certifications = 'GlobalGAP, Fair Trade',
    incoterms = 'FOB Harare',
    min_order_quantity = 200,
    lead_time_days = 3,
    shelf_life_days = 14,
    unspsc_code = '10161800'
WHERE name = 'Premium Roses';

UPDATE products SET
    image_url = 'https://images.unsplash.com/photo-1603048719537-3a0bd351b53b?w=600',
    origin_region = 'Midlands, Zimbabwe',
    packaging = 'Vacuum-sealed 5kg cartons, cold chain',
    certifications = 'HACCP, Halal',
    incoterms = 'CIF',
    min_order_quantity = 50,
    lead_time_days = 5,
    shelf_life_days = 21,
    unspsc_code = '50111500'
WHERE name = 'Beef Sirloin';

UPDATE products SET
    image_url = 'https://images.unsplash.com/photo-1530507629858-e3759c1c6b4a?w=600',
    origin_region = 'Manicaland, Zimbabwe',
    packaging = 'Baled, 50kg hessian wrap',
    certifications = 'Sustainable Tobacco Programme',
    incoterms = 'FOB Harare',
    min_order_quantity = 1000,
    lead_time_days = 10,
    shelf_life_days = 365,
    unspsc_code = '51161600'
WHERE name = 'Tobacco Leaf';

UPDATE products SET
    image_url = 'https://images.unsplash.com/photo-1601593768799-76d8a6a3e9c8?w=600',
    origin_region = 'Mashonaland East, Zimbabwe',
    packaging = 'Punnets, 100g, ventilated tray',
    certifications = 'GlobalGAP',
    incoterms = 'CIF',
    min_order_quantity = 100,
    lead_time_days = 4,
    shelf_life_days = 10,
    unspsc_code = '50151500'
WHERE name = 'Baby Corn';

-- ── PunchOut buyer credentials (shared-secret auth for cXML / OCI) ──
CREATE TABLE punchout_credentials (
    id              BIGSERIAL PRIMARY KEY,
    buyer_name      VARCHAR(255) NOT NULL,
    domain          VARCHAR(100) NOT NULL,
    identity        VARCHAR(255) NOT NULL,
    shared_secret   VARCHAR(255) NOT NULL,
    protocol        VARCHAR(20)  NOT NULL DEFAULT 'CXML',
    active          BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMP    NOT NULL DEFAULT NOW(),
    UNIQUE (domain, identity)
);

-- Demo credentials for testing with Ariba / Oracle / SAP SRM sandboxes
INSERT INTO punchout_credentials (buyer_name, domain, identity, shared_secret, protocol) VALUES
    ('Ariba Network Test', 'NetworkID', 'AN01000000123', 'mst-punchout-secret', 'CXML'),
    ('Oracle iProcurement Test', 'DUNS', '123456789', 'mst-oci-secret', 'OCI'),
    ('Coupa Test', 'NetworkID', 'coupa-test-001', 'mst-coupa-secret', 'CXML');

-- ── PunchOut sessions (one per buyer browse session) ──
CREATE TABLE punchout_sessions (
    id                     BIGSERIAL PRIMARY KEY,
    session_token          VARCHAR(64) NOT NULL UNIQUE,
    protocol               VARCHAR(20) NOT NULL DEFAULT 'CXML',
    operation              VARCHAR(20),
    buyer_cookie           TEXT,
    from_identity          VARCHAR(255),
    to_identity            VARCHAR(255),
    sender_identity        VARCHAR(255),
    buyer_user             VARCHAR(255),
    browser_form_post_url  TEXT,
    hook_url               TEXT,
    status                 VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    created_at             TIMESTAMP   NOT NULL DEFAULT NOW(),
    expires_at             TIMESTAMP
);

CREATE INDEX idx_punchout_sessions_token ON punchout_sessions(session_token);
CREATE INDEX idx_punchout_sessions_status ON punchout_sessions(status);
