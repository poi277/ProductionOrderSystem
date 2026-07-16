BEGIN;

-- Flyway is not enabled. Apply this migration manually before deploying the QR detail API.
CREATE TABLE IF NOT EXISTS order_product_process_history (
    id BIGSERIAL PRIMARY KEY,
    product_qr VARCHAR(255) NOT NULL,
    purchase_id VARCHAR(255),
    process VARCHAR(255) NOT NULL,
    completed_time TIMESTAMP NOT NULL,
    defect BOOLEAN NOT NULL DEFAULT FALSE
);

ALTER TABLE order_product_process_history
    ADD COLUMN IF NOT EXISTS purchase_id VARCHAR(255),
    ADD COLUMN IF NOT EXISTS completed_time TIMESTAMP,
    ADD COLUMN IF NOT EXISTS defect BOOLEAN NOT NULL DEFAULT FALSE;

-- Backfill rows created by the previous relation-based draft while active products still exist.
UPDATE order_product_process_history history
SET purchase_id = purchase.purchase_id
FROM order_product product
JOIN order_production production ON production.id = product.production_id
JOIN order_purchase purchase ON purchase.id = production.purchase_order_id
WHERE history.product_qr = product.product_qr
  AND history.purchase_id IS NULL;

-- Historical products can supply a purchase id after the active product has been archived.
UPDATE order_product_process_history history
SET purchase_id = product_history.purchase_id
FROM order_product_history product_history
WHERE history.product_qr = product_history.product_qr
  AND history.purchase_id IS NULL;

DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM order_product_process_history WHERE purchase_id IS NULL
    ) THEN
        RAISE EXCEPTION 'Process history migration stopped: purchase_id backfill is incomplete';
    END IF;
END $$;

ALTER TABLE order_product_process_history
    ALTER COLUMN purchase_id SET NOT NULL,
    ALTER COLUMN completed_time SET NOT NULL;

-- Process history is intentionally independent and must survive product deletion.
DO $$
DECLARE
    constraint_name TEXT;
BEGIN
    FOR constraint_name IN
        SELECT con.conname
        FROM pg_constraint con
        WHERE con.conrelid = 'order_product_process_history'::regclass
          AND con.contype = 'f'
    LOOP
        EXECUTE format(
            'ALTER TABLE order_product_process_history DROP CONSTRAINT %I',
            constraint_name
        );
    END LOOP;
END $$;

CREATE INDEX IF NOT EXISTS idx_product_process_history_product_time
    ON order_product_process_history (product_qr, completed_time);

CREATE INDEX IF NOT EXISTS idx_product_process_history_purchase
    ON order_product_process_history (purchase_id);

COMMIT;
