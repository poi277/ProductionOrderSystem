BEGIN;

-- Flyway is not enabled. Apply this migration manually to existing PostgreSQL
-- databases so process histories are grouped by the purchase primary key.
ALTER TABLE order_product_process_history
    ADD COLUMN IF NOT EXISTS purchase_db_id BIGINT;

UPDATE order_product_process_history history
SET purchase_db_id = production.purchase_order_id
FROM order_product product
JOIN order_production production ON production.id = product.production_id
WHERE history.product_qr = product.product_qr
  AND history.purchase_db_id IS NULL;

CREATE INDEX IF NOT EXISTS idx_product_process_history_purchase_db_id
    ON order_product_process_history (purchase_db_id);

COMMIT;
