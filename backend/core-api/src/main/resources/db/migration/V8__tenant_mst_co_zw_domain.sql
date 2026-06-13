-- Recognize company email domain for SSO tenant resolution
UPDATE tenants
SET email_domains = 'mst.co.zw,mstagritech.co.zw'
WHERE slug = 'mst-agritech';
