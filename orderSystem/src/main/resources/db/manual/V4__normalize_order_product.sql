BEGIN;

-- This project does not use Flyway. Apply this file manually after deploying
-- the relation-based DTO/service code contained in the same release.

LOCK TABLE order_production IN SHARE ROW EXCLUSIVE MODE;
LOCK TABLE order_product IN SHARE ROW EXCLUSIVE MODE;

ALTER TABLE order_production
    ADD COLUMN IF NOT EXISTS lot VARCHAR(255);

-- Abort without dropping data when one production contains multiple LOT values.
DO $$
DECLARE
    conflicting_production_id BIGINT;
BEGIN
    SELECT product.production_id
    INTO conflicting_production_id
    FROM order_product product
    WHERE product.lot IS NOT NULL
      AND btrim(product.lot) <> ''
    GROUP BY product.production_id
    HAVING count(DISTINCT product.lot) > 1
    LIMIT 1;

    IF conflicting_production_id IS NOT NULL THEN
        RAISE EXCEPTION
            'LOT normalization stopped: production_id % has multiple LOT values',
            conflicting_production_id;
    END IF;
END $$;

-- Move the single production-level LOT value before removing the product column.
UPDATE order_production production
SET lot = source.lot
FROM (
    SELECT product.production_id, min(product.lot) AS lot
    FROM order_product product
    WHERE product.lot IS NOT NULL
      AND btrim(product.lot) <> ''
    GROUP BY product.production_id
) source
WHERE production.id = source.production_id
  AND (production.lot IS NULL OR btrim(production.lot) = '');

-- Preserve the existing misspelled quantity column when present.
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = current_schema()
          AND table_name = 'order_production'
          AND column_name = 'producti_qr_quantity'
    ) AND NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = current_schema()
          AND table_name = 'order_production'
          AND column_name = 'product_qr_quantity'
    ) THEN
        ALTER TABLE order_production
            RENAME COLUMN producti_qr_quantity TO product_qr_quantity;
    ELSIF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = current_schema()
          AND table_name = 'order_production'
          AND column_name = 'producti_qr_quantity'
    ) THEN
        UPDATE order_production
        SET product_qr_quantity = COALESCE(product_qr_quantity, producti_qr_quantity);
        ALTER TABLE order_production DROP COLUMN producti_qr_quantity;
    END IF;
END $$;

-- Product names now resolve through product.production.purchase.
-- Differences are expected when the purchase product name was edited; report them
-- for the operator without blocking normalization to the latest purchase value.
DO $$
DECLARE
    mismatched_product_names BIGINT;
BEGIN
    SELECT count(*)
    INTO mismatched_product_names
    FROM order_product product
    JOIN order_production production ON production.id = product.production_id
    JOIN order_purchase purchase ON purchase.id = production.purchase_order_id
    WHERE product.product_name IS NOT NULL
      AND product.product_name IS DISTINCT FROM purchase.product_name;

    RAISE NOTICE 'product_name values replaced by purchase relation: %', mismatched_product_names;
END $$;

ALTER TABLE order_product
    DROP COLUMN IF EXISTS product_name,
    DROP COLUMN IF EXISTS lot,
    DROP COLUMN IF EXISTS completed_time;

CREATE INDEX IF NOT EXISTS idx_order_product_production_id
    ON order_product (production_id);

CREATE INDEX IF NOT EXISTS idx_order_product_production_created_time
    ON order_product (production_id, created_time DESC);

COMMIT;
