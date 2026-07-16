프론트엔드의 홈페이지

왼쪽 카테고리별 페이지

-  전체현황 페이지
1.전체현황페이지는 발주서(OrderPurchase)의 내용과 enum으로 progreebar가 나온다. 
조건:발주서 조회는 WAITING_FOR_SHIPMENT와 CANCEL는 제외된다.백엔드에서 이 앞의 enum빼고 조회하면된다.

- 발주서 접수 페이지
1.발주서접수는 발주서(OrderPurchase) 리스트가 출력한다.
2:발주서조회의 enum은 PURCHASESUBMIT인것만 조회된다.
3.발주서 입력시 발주서는 초기값으로 (PURCHASESUBMIT)를 들어간다.  


- 생산지시
1.생산지시 리스트(production)이 조회된다. 
2.생산지시와 연결된 발주서 enum이 WAITING_FOR_SHIPMENT와 CANCEL는 제외된다.백엔드에서 이 앞의 enum빼고 조회하면된다.
3.생산지시에서 제품을 만드는 로직 수행시 발주서는 INSTRUCTION으로 enum이 바뀐다.


- 공정현황
1.생산지시 리스트(production)이 조회된다. 
2.생산지시와 연결된 발주서 enum이 WAITING_FOR_SHIPMENT와 CANCEL과 PURCHASESUBMIT는 제외된다.백엔드에서 이 앞의 enum빼고 조회하면된다.
3.프론트에서 생산지시부터 포장(packing)까지 값을 바꿀수있다.

- 공정현황(세부)
1.제품리스트(OrderProduct)이 조회된다.
2.WAITING_FOR_SHIPMENT와 CANCEL과 PURCHASESUBMIT는 제외된다.백엔드에서 이 앞의 enum빼고 조회하면된다.
3.프론트에서 생산지시부터 포장(packing)까지 값을 바꿀수있다.

- 납품/출하
1.생산지시 리스트(production)이 조회된다.
2.PACKAGING만 조회된다.백엔드에서 이 앞의 enum빼고 조회하면된다.
3.출하랑 납품출하버튼을 누르면 WAITING_FOR_SHIPMENT로 변경된다.

- 출하이력
1.WAITING_FOR_SHIPMENT만 조회된다.

- 발주이력
1.모든 발주서가 조회된다.


- 스캔
1.한가지의 제품과 그 제품의 productprocesshitory가 조회된다.


삭제 매커니즘
1.발주서를 삭제하면 발주서Id를 기준으로 product(제품)랑 productprocesshistory(제품프로세스이력)과 생산지시(production)과 발주서(purchase)가 데이터베이스에 삭제된다.
2.생산지시를 삭제하면 발주서Id를 기준으로 product(제품)랑 productprocesshistory(제품프로세스이력)과 생산지시(production)과 발주서(purchase)가 데이터베이스에 삭제된다.
3.제품을 삭제하면 제품이랑 productprocesshistory(제품프로세스이력)이 삭제된다.
4.취소는 안쓴다.