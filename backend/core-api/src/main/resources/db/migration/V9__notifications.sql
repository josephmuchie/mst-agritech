CREATE TABLE notifications (
    id              BIGSERIAL PRIMARY KEY,
    user_id         BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title           VARCHAR(255) NOT NULL,
    message         TEXT NOT NULL,
    notification_type VARCHAR(50) NOT NULL,
    entity_type     VARCHAR(50),
    entity_id       VARCHAR(64),
    is_read         BOOLEAN NOT NULL DEFAULT FALSE,
    created_at      TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_notifications_user_read ON notifications(user_id, is_read);
CREATE INDEX idx_notifications_user_created ON notifications(user_id, created_at DESC);

-- Seed notifications for active admin users from existing platform activity
INSERT INTO notifications (user_id, title, message, notification_type, entity_type, entity_id, is_read, created_at)
SELECT admin.id,
       'Order ' || o.reference,
       'Order status is ' || o.status,
       'ORDER',
       'Order',
       o.id::TEXT,
       FALSE,
       o.updated_at
FROM orders o
CROSS JOIN (
    SELECT u.id
    FROM users u
    JOIN user_roles ur ON ur.user_id = u.id
    JOIN roles r ON r.id = ur.role_id AND r.name = 'ADMIN'
    WHERE u.is_active = TRUE
) admin;

INSERT INTO notifications (user_id, title, message, notification_type, entity_type, entity_id, is_read, created_at)
SELECT admin.id,
       'Payment ' || COALESCE(p.transaction_id, CAST(p.id AS TEXT)),
       'Payment ' || p.status || ' for order #' || p.order_id,
       'PAYMENT',
       'Payment',
       p.id::TEXT,
       FALSE,
       p.created_at
FROM payments p
CROSS JOIN (
    SELECT u.id
    FROM users u
    JOIN user_roles ur ON ur.user_id = u.id
    JOIN roles r ON r.id = ur.role_id AND r.name = 'ADMIN'
    WHERE u.is_active = TRUE
) admin;

INSERT INTO notifications (user_id, title, message, notification_type, entity_type, entity_id, is_read, created_at)
SELECT admin.id,
       'Shipment ' || COALESCE(s.tracking_number, CAST(s.id AS TEXT)),
       'Shipment status is ' || s.status,
       'SHIPMENT',
       'Shipment',
       s.id::TEXT,
       FALSE,
       s.created_at
FROM shipments s
CROSS JOIN (
    SELECT u.id
    FROM users u
    JOIN user_roles ur ON ur.user_id = u.id
    JOIN roles r ON r.id = ur.role_id AND r.name = 'ADMIN'
    WHERE u.is_active = TRUE
) admin;
