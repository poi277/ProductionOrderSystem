<a id="top"></a>

# 백엔드 구조와 도메인

## 문서 포털

| 분류 | 문서 | 분류 | 문서 |
| --- | --- | --- | --- |
| 백엔드 문서 | [README](README.md) | API·흐름 | [API와 업무 흐름](02-api-and-flow.md) |
| 데이터베이스 | [Database Schema](../../docs/database-schema.md) | 영속성 | [영속성과 성능](03-persistence-and-performance.md) |

## 목차

> [프로젝트 구조](#프로젝트-구조) · [Entity 관계](#entity-관계) · [Enum](#enum) · [Service 책임](#service-책임) · [DTO](#dto) · [Transaction](#transaction) · [Validation과 예외](#validation과-예외) · [핵심 구현 파일](#핵심-구현-파일)

## 프로젝트 구조

```text
orderSystem/src/main/
├─ java/com/poi/orderSystem/
│  ├─ config/                 # Security와 CORS
│  └─ features/
│     ├─ auth/                # JWT 로그인·회원가입
│     ├─ user/                # 사용자와 역할 관리
│     ├─ Order/               # 발주·생산·제품·출하·이력
│     ├─ entity/              # JPA Entity
│     ├─ repository/          # Spring Data Repository
│     ├─ DTO/                 # 요청·응답 데이터
│     └─ util/                # Enum과 공통 응답
└─ resources/db/manual/       # 수동 PostgreSQL SQL
```

## Entity 관계

`OrderPurchase`와 `OrderProduction`은 1:1이며 한 발주에는 한 생산지시만 연결된다. `OrderProduction`과 `OrderProduct`는 1:N이다. `OrderProductProcessHistory`는 QR과 발주 식별자를 값으로 저장하며 JPA 관계가 없다. `InsteckUser`는 업무 Entity와 연결되지 않는다.

## Enum

| Enum | 값 |
| --- | --- |
| `ProcessStatus` | `PURCHASESUBMIT`, `INSTRUCTION`, `ASSEMBLY`, `TEST`, `FINAL_INSPECTION`, `PACKAGING`, `SHIPPED`, `CANCEL` |
| `ProductCategory` | `AUTOMATIC_DAMPER`, `LEAK_SENSOR`, `DISPENSER`, `GATE` |
| `Role` | `USER`, `ADMIN` |
| `HistoryStatus` | `NORMAL`, `DEFECTIVE`, `CANCEL` |

`HistoryStatus`는 현재 Service 흐름에서 사용하지 않는다.

## Service 책임

| Service | 역할 |
| --- | --- |
| `AuthService` | 회원가입, BCrypt 검증, JWT 발급 |
| `UserService` | 내 정보, 이름·비밀번호, 사용자 역할과 삭제 |
| `OrderPurChaseService` | 발주 조회·생성·수정·삭제, 대시보드와 발주이력 |
| `OrderProductionService` | 생산지시와 제품 QR 수량 동기화 |
| `OrderProductService` | 공정·불량 변경, 출하, 라벨, QR 상세, 제품 삭제 |
| `OrderHistoryService` | 출하된 제품 조회 전용 이력 |

빈 `OrderService` 클래스와 빈 `DTO` 클래스는 업무에 사용되지 않는다.

## DTO

- 요청 DTO는 발주, 생산지시, 제품 공정, 인증, 사용자 설정 입력을 받는다.
- 응답 DTO는 Entity를 직접 노출하지 않고 연관 Entity에서 화면 필드를 조합한다.
- `ApiResponse`는 `success`, `message`, `data` 형식을 공통으로 사용한다.
- `OrderProductionResponse.processCounts`는 공정별 제품 수량을 전달한다.
- `ProductQrDetailResponse`는 현재 제품 정보와 `processHistories`를 함께 전달한다.

## Transaction

조회 Service는 `@Transactional(readOnly = true)`를 사용한다. 생성·수정·상태 전환·일괄 출하·삭제는 `@Transactional` 안에서 Entity와 공정 이력을 함께 변경한다.

## Validation과 예외

- 회원가입·로그인 ID와 비밀번호, 발주번호와 제품명은 `@NotBlank`이다.
- 생산지시는 `purchaseDbId`를 필수로 받는다.
- 생산수량은 0 이상, 발주수량 이하이며 기존 QR 수량보다 줄일 수 없다.
- 제품 공정은 `INSTRUCTION`부터 `PACKAGING`까지만 직접 변경할 수 있다.
- QR 상세가 없으면 `ProductQrNotFoundException`을 `404`로 변환한다.
- Controller별 `IllegalArgumentException` 처리는 `400` 응답을 만든다.

## 핵심 구현 파일

- `features/entity`
- `features/Order/purChase/OrderPurChaseService.java`
- `features/Order/production/OrderProductionService.java`
- `features/Order/product/OrderProductService.java`
- `features/auth/service/AuthService.java`

<div align="right">

[문서 맨 위로](#top)

</div>
