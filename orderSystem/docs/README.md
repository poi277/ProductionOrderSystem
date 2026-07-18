<a id="top"></a>

# 백엔드 문서

## 문서 포털

| 분류 | 문서 | 분류 | 문서 |
| --- | --- | --- | --- |
| 루트 README | [README](../../readme.md) | 전체 문서 | [Documentation](../../docs/DOCUMENTATION.md) |
| 구조·도메인 | [구조와 도메인](01-architecture-and-domain.md) | API·흐름 | [API와 업무 흐름](02-api-and-flow.md) |
| 영속성·성능 | [영속성과 성능](03-persistence-and-performance.md) | 데이터베이스 | [Database Schema](../../docs/database-schema.md) |

## 개요

`orderSystem`은 발주, 생산지시, 제품 QR, 공정, 출하, 이력과 사용자를 관리하는 Spring Boot 애플리케이션이다.

## 기술 구성

| 영역 | 구현 |
| --- | --- |
| 런타임 | Java 21, Spring Boot 4.1.0 |
| API | Spring MVC |
| 영속성 | Spring Data JPA, PostgreSQL |
| 인증 | Spring Security, JWT, BCrypt |
| 검증 | Jakarta Validation과 Service 규칙 |
| 트랜잭션 | `@Transactional`, read-only 조회 분리 |
| 테스트 | JUnit 5, Mockito, Spring 통합 테스트 |

## 현재 구현 범위

Redis, Batch, Scheduler, WebSocket 구현은 존재하지 않는다. Docker 관련 파일도 프로젝트에 없다.

## 핵심 구현 파일

- `src/main/java/com/poi/orderSystem/features`
- `src/main/java/com/poi/orderSystem/config/SecurityConfig.java`
- `src/main/resources/application.properties`
- `src/main/resources/db/manual`

<div align="right">

[문서 맨 위로](#top)

</div>
