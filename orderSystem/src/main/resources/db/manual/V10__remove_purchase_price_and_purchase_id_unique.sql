-- Run this migration against existing PostgreSQL databases before deploying the
-- entity change. Hibernate's ddl-auto=update does not reliably remove columns
-- or unique constraints that disappeared from an entity.
ALTER TABLE order_purchase
    DROP COLUMN IF EXISTS price;

DO $$
DECLARE
    constraint_name TEXT;
BEGIN
    FOR constraint_name IN
        SELECT constraint_info.conname
        FROM pg_constraint constraint_info
        JOIN pg_class table_info ON table_info.oid = constraint_info.conrelid
        JOIN pg_attribute column_info
          ON column_info.attrelid = table_info.oid
         AND column_info.attnum = ANY (constraint_info.conkey)
        WHERE table_info.relname = 'order_purchase'
          AND column_info.attname = 'purchase_id'
          AND constraint_info.contype = 'u'
    LOOP
        EXECUTE format('ALTER TABLE order_purchase DROP CONSTRAINT %I', constraint_name);
    END LOOP;
END $$;
