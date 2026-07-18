<a id="top"></a>

# 영속성, 보안과 성능

## 문서 포털

| 분류 | 문서 | 분류 | 문서 |
| --- | --- | --- | --- |
| 백엔드 문서 | [README](README.md) | 데이터베이스 | [Database Schema](../../docs/database-schema.md) |
| API·흐름 | [API와 업무 흐름](02-api-and-flow.md) | 데이터베이스 | [Database Schema](../../docs/database-schema.md) |

## 목차

> [Repository](#repository) · [PostgreSQL 설정](#postgresql-설정) · [수동 마이그레이션](#수동-마이그레이션) · [성능 최적화](#성능-최적화) · [인증과 보안](#인증과-보안) · [현재 구현되지 않은 구성](#현재-구현되지-않은-구성) · [핵심 구현 파일](#핵심-구현-파일)

## Repository

- `OrderProductionRepository`는 발주와 제품을 fetch join해 생산·공정 목록을 조회한다.
- `OrderProductRepository`는 제품·생산지시·발주를 fetch join하며 공정·발주 상태별 목록과 QR 상세를 제공한다.
- `OrderProductProcessHistoryRepository`는 QR 시간순 이력, 발주별 최근 공정 시각 집계와 bulk delete를 제공한다.
- `OrderPurchaseRepository`는 상태별·제외 상태별·생성 역순 조회를 제공한다.

## PostgreSQL 설정

`spring.jpa.hibernate.ddl-auto=update`를 사용한다. Hikari 최대 pool은 3, 최소 idle은 1이다. 운영 DB 접속 정보가 `application.properties`에 직접 기록돼 있으므로 환경 변수나 secret 저장소로 이동해야 한다. 문서에는 실제 비밀번호를 기록하지 않는다.

## 수동 마이그레이션

`src/main/resources/db/manual`의 SQL은 기존 PostgreSQL 데이터를 관계형 Entity 구조로 옮기고 컬럼·인덱스·sequence를 정리한다. Flyway 의존성이 없으므로 파일명 순서만으로 자동 실행되지 않는다.

## 성능 최적화

| 구현 | 효과 |
| --- | --- |
| fetch join | 목록 변환 중 연관 Entity N+1 조회 방지 |
| `batch_size=50` | 제품·공정 이력 일괄 insert/update |
| `saveAll` | QR 생성과 출하 이력 일괄 저장 |
| sequence `allocationSize=50` | 공정 이력 ID 선할당 횟수 감소 |
| 제품·공정 시간 인덱스 | 상태별 최신 목록과 QR 이력 조회 지원 |
| 발주별 최근 공정 집계 | 대시보드 진행 시각을 한 번에 계산 |

통합 테스트는 700개 제품의 생성, 관계 기반 목록 1회 조회, 대량 출하와 이력 저장을 검증한다.

## 인증과 보안

- BCrypt로 비밀번호를 저장한다.
- JWT에는 `sub`, `name`, `role`, `type=access`를 기록한다.
- 서버는 stateless session과 JWT filter를 사용한다.
- CORS origin은 `app.frontend-origin` 한 개를 허용하고 credentials를 사용한다.
- 로그아웃 API는 서버 측 토큰 폐기 목록을 관리하지 않는다.

## 현재 구현되지 않은 구성

| 요구 영역 | 실제 상태 |
| --- | --- |
| Redis | 의존성·설정·사용 코드 없음 |
| Batch | Spring Batch 의존성·Job 없음 |
| Scheduler | `@Scheduled`와 scheduling 설정 없음 |
| WebSocket | starter 의존성은 있으나 endpoint·handler·broker 설정 없음 |
| Docker | Dockerfile·Compose 파일 없음 |

## 핵심 구현 파일

- `features/repository`
- `features/entity`
- `config/SecurityConfig.java`
- `features/auth/jwt`
- `src/main/resources/application.properties`
- `src/main/resources/db/manual`

<div align="right">

[문서 맨 위로](#top)

</div>
