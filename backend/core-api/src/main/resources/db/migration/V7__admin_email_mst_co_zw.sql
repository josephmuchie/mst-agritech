-- Use company domain email for admin login
UPDATE users
SET email = 'info@mst.co.zw'
WHERE email = 'admin@mstagritech.co.zw';
