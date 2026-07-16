BEGIN;

-- 애플리케이션 배포 전에 실행하여 기존 enum 문자열을 새 이름으로 변환한다.
UPDATE order_product_process_history
SET process = 'SHIPPED'
WHERE process = 'WAITING_FOR_SHIPMENT';

UPDATE order_product
SET process = 'SHIPPED'
WHERE process = 'WAITING_FOR_SHIPMENT';

UPDATE order_purchase
SET status = 'SHIPPED'
WHERE status = 'WAITING_FOR_SHIPMENT';

COMMIT;
