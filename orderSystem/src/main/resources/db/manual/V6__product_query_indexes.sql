BEGIN;

-- Product list: ORDER BY created_time DESC.
CREATE INDEX IF NOT EXISTS idx_order_product_created_time
    ON order_product (created_time DESC);

-- Shipment list: WHERE process = ? ORDER BY created_time DESC.
CREATE INDEX IF NOT EXISTS idx_order_product_process_created_time
    ON order_product (process, created_time DESC);

-- Product-history cascade deletion and newest-first history list.
CREATE INDEX IF NOT EXISTS idx_order_product_history_purchase_id
    ON order_product_history (purchase_id);

CREATE INDEX IF NOT EXISTS idx_order_product_history_created_time
    ON order_product_history (created_time DESC);

COMMIT;
