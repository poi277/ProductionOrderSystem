<a id="top"></a>

# 프론트엔드 문서

## 문서 포털

| 분류 | 문서 | 분류 | 문서 |
| --- | --- | --- | --- |
| 루트 README | [README](../../readme.md) | 전체 문서 | [Documentation](../../docs/DOCUMENTATION.md) |
| 설계·페이지 | [구조와 페이지](01-architecture-and-pages.md) | 기능·Drawer | [기능과 Drawer](02-features-and-drawer.md) |
| 데이터베이스 | [Database Schema](../../docs/database-schema.md) |  |  |

## 개요

`frontend`는 Next.js App Router 기반 관리자 화면이다. 발주·생산·공정·출하 목록과 QR 조회를 제공하고, 공통 오른쪽 Drawer에서 선택 데이터의 상세 확인과 수정을 처리한다.

## 기술 구성

| 영역 | 구현 |
| --- | --- |
| 프레임워크 | Next.js `16.2.10`, React `19.2.4` |
| 언어 | TypeScript strict mode |
| 스타일 | Tailwind CSS 4, `app/globals.css` |
| 라우팅 | App Router와 `(order)` route group |
| 상태 | React Context, 지역 `useState`, `useSyncExternalStore` |
| 인증 | Server Action, HttpOnly JWT 쿠키, API 프록시 |

## 주요 문서

- [프로젝트·페이지·상태·API·UI 구조](01-architecture-and-pages.md)
- [업무 기능과 Drawer 데이터 흐름](02-features-and-drawer.md)

## 핵심 구현 파일

- `app/layout.tsx`
- `app/(order)/layout.tsx`
- `src/feature/layout`
- `src/feature/ordersidebar`
- `util/apiClient.ts`
- `lib/endpoints.ts`

<div align="right">

[문서 맨 위로](#top)

</div>
