-- ============================================================
-- V11: Remove pre-seeded demo notifications.
-- Notifications are now created only by live platform events
-- (order/payment/shipment activity) via NotificationService.
-- ============================================================

DELETE FROM notifications;
