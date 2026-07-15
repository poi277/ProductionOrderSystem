"use client";

import { usePathname } from "next/navigation";

type HeaderConfig = {
  title: string;
};

const headerConfigs: Record<string, HeaderConfig> = {
  "/dashboard": { title: "전체 작업 현황" },
  "/scan": { title: "스캔" },
  "/orders": {
    title: "발주서",
  },
  "/production-orders": {
    title: "생산지시",
  },
  "/product-processes": {
    title: "생산현황",
  },
  "/shipments": {
    title: "납품출하",
  },
  "/labels": {
    title: "라벨",
  },
  "/process-histories": {
    title: "공정이력",
  },
  "/histories": {
    title: "제품이력",
  },
  "/order-purchase-histories": {
    title: "발주이력",
  },
  "/qr-search": { title: "QR조회" },
  "/settings/users": { title: "내 정보" },
  "/settings/permissions": { title: "권한 설정" },
};

export default function LayoutHeader() {
  const pathname = usePathname();
  const config = headerConfigs[pathname] ?? { title: "QR 이력관리" };
  const categoryDescription = `${config.title} 카테고리는 인스테크 ${config.title}입니다.`;

  return (
    <header className="shrink-0 border-b border-slate-100 px-5 py-5">
      <div>
        <div className="min-w-0">
          <h1 className="truncate text-2xl font-bold">인스테크</h1>
          <p className="mt-2 text-sm text-slate-400">{categoryDescription}</p>
        </div>
      </div>
    </header>
  );
}
