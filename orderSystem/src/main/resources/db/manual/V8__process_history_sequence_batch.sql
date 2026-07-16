BEGIN;

CREATE SEQUENCE IF NOT EXISTS order_product_process_history_seq;

-- Hibernate allocationSize=50과 DB sequence 증가 폭을 일치시킨다.
ALTER SEQUENCE order_product_process_history_seq INCREMENT BY 50;

-- 기존 데이터의 최대 id 다음 값부터 할당하여 PK 충돌을 방지한다.
SELECT setval(
    'order_product_process_history_seq',
    GREATEST(COALESCE(MAX(id), 0) + 1, 1),
    false
)
FROM order_product_process_history;

ALTER SEQUENCE order_product_process_history_seq
    OWNED BY order_product_process_history.id;

ALTER TABLE order_product_process_history
    ALTER COLUMN id SET DEFAULT nextval('order_product_process_history_seq');

COMMIT;
