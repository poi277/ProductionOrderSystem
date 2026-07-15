BEGIN;

-- OrderHistory (legacy) -> OrderProductHistory.
-- The history table now mirrors OrderProduct:
-- product_qr PK, production_id FK, is_defect, process, created_time.

LOCK TABLE order_history IN SHARE ROW EXCLUSIVE MODE;

ALTER TABLE order_history
    RENAME COLUMN production_id TO legacy_production_id;

ALTER TABLE order_history
    ADD COLUMN production_id BIGINT;

UPDATE order_history history
SET production_id = production.id
FROM order_production production
JOIN order_purchase purchase ON purchase.id = production.purchase_order_id
WHERE history.legacy_production_id = purchase.purchase_id;

DO $$
DECLARE
    unmapped_count BIGINT;
BEGIN
    SELECT count(*) INTO unmapped_count
    FROM order_history
    WHERE production_id IS NULL;

    IF unmapped_count > 0 THEN
        RAISE EXCEPTION
            'OrderProductHistory migration stopped: % rows cannot be mapped to order_production',
            unmapped_count;
    END IF;
END $$;

-- A product QR is the new identifier. Preserve the most recent legacy row.
DELETE FROM order_history older
USING order_history newer
WHERE older.product_qr = newer.product_qr
  AND older.history_id < newer.history_id;

ALTER TABLE order_history
    DROP CONSTRAINT IF EXISTS order_history_pkey,
    DROP COLUMN IF EXISTS history_id,
    DROP COLUMN IF EXISTS legacy_production_id,
    DROP COLUMN IF EXISTS product_name,
    DROP COLUMN IF EXISTS price,
    DROP COLUMN IF EXISTS note,
    DROP COLUMN IF EXISTS status,
    ADD COLUMN IF NOT EXISTS is_defect BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS process VARCHAR(255);

ALTER TABLE order_history
    ALTER COLUMN product_qr SET NOT NULL,
    ALTER COLUMN production_id SET NOT NULL,
    ADD CONSTRAINT order_history_pkey PRIMARY KEY (product_qr),
    ADD CONSTRAINT fk_order_history_production
        FOREIGN KEY (production_id) REFERENCES order_production(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_order_history_production_id
    ON order_history (production_id);

CREATE INDEX IF NOT EXISTS idx_order_history_created_time
    ON order_history (created_time DESC);

COMMIT;
