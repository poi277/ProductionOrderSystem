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