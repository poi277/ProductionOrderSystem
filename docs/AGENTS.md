## 파일 구조 규칙

- 기능별 코드는 `src/feature` 폴더 아래에 작성한다.
- `src/app` 폴더는 Next.js App Router의 라우팅 진입점으로만 사용한다.
- `app` 폴더의 `page.tsx`는 직접 화면을 길게 구현하지 않고, `src/feature`에 있는 컴포넌트를 import해서 렌더링한다.
- `layout.tsx`도 필요한 경우 `src/feature`에 있는 레이아웃 컴포넌트를 import해서 적용한다.

## feature 폴더 규칙

- 각 기능은 `src/feature/{기능명}` 폴더로 분리한다.
- 기능 폴더 안에는 기본적으로 다음 파일 또는 폴더를 둘 수 있다.

```text
src/feature/
├── login/
│   └── Xxx.tsx
│   └── useXxx.ts
│   └── xxx.css
├── sidebar/
│   └── Xxx.tsx
│   └── useXxx.ts
│   └── xxx.css
├── rightsidebar/
│   └── Xxx.tsx
│   └── useXxx.ts
│   └── xxx.css
├── header/
│   └── Xxx.tsx
│   └── useXxx.ts
│   └── xxx.css
└── 
    └── xxx.css
```

## App Router 연결 규칙
src/app의 각 라우트는 page.tsx를 가진다.
page.tsx는 해당 기능의 페이지 컴포넌트를 import해서 사용한다.

예시:

import OrderPage from "@/feature/order/OrderPage";

export default function Page() {
  return <OrderPage />;
}

공통 레이아웃은 src/app/layout.tsx에서 src/feature/layout의 컴포넌트를 import해서 적용한다.

예시:

import MainLayout from "@/feature/layout/MainLayout";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>
        <MainLayout>{children}</MainLayout>
      </body>
    </html>
  );
}

##  공통 컴포넌트 규칙
여러 기능에서 재사용하는 버튼, 입력창, 드롭다운, 테이블, 모달 등은 src/feature/common에 작성한다.
특정 기능에서만 쓰는 컴포넌트는 해당 기능 폴더 안에 작성한다.
예를 들어 발주서 화면에서만 쓰는 테이블은 src/feature/order/components에 둔다.
여러 화면에서 쓰는 드롭다운은 src/feature/common/components에 둔다.

# AGENTS.md

이 문서는 `C:\Users\Adminstor\Downloads\project` 아래 프로젝트에서 작업할 때 따르는 공통 규칙이다.

## 적용 범위

- 이 파일이 있는 `project` 폴더와 모든 하위 폴더에 적용한다.
- 하위 폴더에 별도의 `AGENTS.md`가 있으면 더 가까운 위치의 규칙을 우선 적용한다.

## 기본 작업 규칙

- 사용자가 요청한 범위 안에서만 파일을 수정한다.
- 기존 코드 스타일과 폴더 구조를 우선 따른다.
- 불필요한 리팩터링이나 파일 이동은 하지 않는다.
- 실제로 확인하지 않은 동작은 구현된 것처럼 설명하지 않는다.
- 파일명, 경로, 명령어, 코드 식별자는 백틱으로 감싼다.

## Next.js 작업 규칙

- 페이지는 `app` 라우터 구조를 기준으로 작성한다.
- 라우트 페이지는 해당 폴더의 `page.js`, `page.jsx`, `page.tsx`에 작성한다.
- 테스트용 화면은 실제 API 연동 전에는 임시 데이터임을 코드나 화면에서 구분한다.
- 화면을 만들 때는 모바일과 데스크톱에서 깨지지 않도록 반응형 레이아웃을 사용한다.
- Tailwind CSS가 설정되어 있으면 기존 Tailwind 방식으로 스타일을 작성한다.

## 검증 규칙

- 코드 수정 후 가능한 경우 `npm.cmd run lint`로 확인한다.
- 개발 서버 확인이 필요하면 `npm.cmd run dev`를 사용한다.
- PowerShell에서 `npm` 실행 정책 문제가 나면 `npm.cmd`를 사용한다.

## 응답 규칙

- 설명은 한국어로 작성한다.
- 수정한 파일과 확인한 명령을 짧게 정리한다.
- 실행하지 못한 검증이 있으면 이유를 명확히 말한다.

## 파일 규칙

- 공통 컴포넌트를 제외한 기능별 코드는 `src/feature` 폴더 아래에 기능 단위로 구성한다.
- 각 기능은 자신의 폴더 안에서 페이지, 컴포넌트, 훅, API 등을 관리한다.
- 다른 기능에서 사용하는 공통 컴포넌트는 `src/components`에 둔다.
- 공통 유틸 함수는 `src/lib` 또는 `src/utils`에 둔다.
