BEGIN;

ALTER TABLE order_purchase_history
    ALTER COLUMN purchase_id SET NOT NULL;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint constraint_info
        JOIN pg_class table_info ON table_info.oid = constraint_info.conrelid
        WHERE table_info.relname = 'order_purchase_history'
          AND constraint_info.conname = 'uk_order_purchase_history_purchase_id'
    ) THEN
        ALTER TABLE order_purchase_history
            ADD CONSTRAINT uk_order_purchase_history_purchase_id UNIQUE (purchase_id);
    END IF;
END $$;

COMMIT;
