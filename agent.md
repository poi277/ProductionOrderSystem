# 프로젝트 작업 규칙

이 문서는 `C:\Users\Adminstor\Downloads\project` 프로젝트에서 작업할 때 따르는 기본 규칙을 정리한다.

## 기본 원칙

- 사용자가 요청한 범위 안에서만 수정한다.
- 불필요한 리팩터링이나 파일 이동은 하지 않는다.
- 기존 폴더 구조와 코드 스타일을 우선 유지한다.
- 실제 API 연동이 필요하다고 명시되지 않으면 임시 데이터와 상태값으로 구현한다.
- 수정 후 가능한 경우 `npm.cmd run lint`로 검증한다.

## Next.js App Router 규칙

- 라우트 진입 파일은 `app` 폴더의 `page.tsx`에서 관리한다.
- `page.tsx`에는 화면 구현을 길게 작성하지 않는다.
- 실제 화면과 기능 컴포넌트는 `src/feature` 아래에 작성하고 `page.tsx`에서 import해서 사용한다.

예시:

```tsx
import { OrdersListPage } from "@/src/feature/orders";

export default function Page() {
  return <OrdersListPage />;
}
```

## Feature 폴더 규칙

- 기능별 코드는 `src/feature/{기능명}` 아래에 작성한다.
- 특정 기능에서만 쓰는 컴포넌트는 해당 feature 폴더 안에 둔다.
- 여러 페이지에서 재사용하는 컴포넌트는 `src/components` 아래에 둔다.

예시:

```text
src/feature/orders/
  OrdersListPage.tsx
  OrderRightPanel.tsx
  OrderDetailPanel.tsx
  OrderCreatePanel.tsx
  types.ts
  index.ts

src/feature/production-orders/
  ProductionOrdersPage.tsx
  index.ts

src/components/list/
  ListToolbar.tsx
  ListCheckbox.tsx
  DataListTable.tsx
  index.ts
```

## 공통 컴포넌트 규칙

- 발주서, 생산지시처럼 같은 형태의 목록 화면은 공통 리스트 컴포넌트를 재사용한다.
- 체크박스, 검색창, 정렬 버튼, 테이블처럼 반복되는 UI는 `src/components` 아래에 둔다.
- 공통 컴포넌트는 특정 업무명에 묶이지 않도록 이름을 일반화한다.

현재 공통 리스트 컴포넌트:

- `ListToolbar`: 정렬 버튼, 검색 필드 선택, 검색어 입력을 담당한다.
- `ListCheckbox`: 목록 체크박스를 담당한다.
- `DataListTable`: 체크박스가 포함된 목록 테이블을 담당한다.

## 사이드바 규칙

- 왼쪽 사이드바는 전체 레이아웃에서 공통으로 사용한다.
- 메뉴 상태가 페이지 이동 후에도 유지되어야 하면 `localStorage`를 사용한다.
- 서버 렌더링과 클라이언트 렌더링 결과가 달라지지 않도록 초기 렌더에서 `window`나 `localStorage`를 직접 기준으로 삼지 않는다.

## UI 구현 규칙

- Tailwind CSS를 사용한다.
- 기존 색상, 간격, 둥근 모서리, hover 스타일을 최대한 유지한다.
- 모바일에서 화면이 깨지지 않도록 `flex`, `overflow-x-auto`, 반응형 클래스 등을 사용한다.
- 사용자가 제공한 참고 이미지가 있으면 해당 이미지의 구조와 분위기를 우선 반영한다.

## 검증 규칙

작업 후 가능한 경우 아래 명령을 실행한다.

```powershell
npm.cmd run lint
```

검증하지 못한 경우에는 이유를 작업 요약에 적는다.
