"use client";

import { usePathname } from "next/navigation";
import { useOrderSidebar } from "../ordersidebar/OrderSidebarContext";
import type { SidebarFormType } from "../order/OrdersTypes";

type HeaderConfig = {
  actionLabel?: string;
  title: string;
};

const DEFAULT_ACTION_LABEL = "+ 생성";

const headerConfigs: Record<string, HeaderConfig> = {
  "/dashboard": { title: "대시보드" },
  "/scan": { title: "스캔" },
  "/orders": {
    actionLabel: "+ 주문 생성",
    title: "발주서",
  },
  "/production-orders": {
    actionLabel: "+ 생산지시 생성",
    title: "생산지시",
  },
  "/product-processes": {
    actionLabel: "+ 생산현황 생성",
    title: "생산현황",
  },
  "/shipments": {
    actionLabel: "+ 납품출하 생성",
    title: "납품출하",
  },
  "/labels": {
    actionLabel: "+ 라벨 생성",
    title: "라벨",
  },
  "/process-histories": {
    actionLabel: "+ 공정이력 생성",
    title: "공정이력",
  },
  "/histories": {
    actionLabel: "+ 제품이력 생성",
    title: "제품이력",
  },
  "/qr-search": { title: "QR조회" },
  "/settings/users": { title: "사용자 관리" },
  "/settings/permissions": { title: "권한 설정" },
};

export default function LayoutHeader() {
  const pathname = usePathname();
  const { openCreateOrderSidebar } = useOrderSidebar();
  const config = headerConfigs[pathname] ?? { title: "QR 이력관리" };
  const actionLabel = config.actionLabel ?? DEFAULT_ACTION_LABEL;
  const sidebarFormType = getSidebarFormType(pathname);
  const categoryDescription = `${config.title} 카테고리는 인스테크 ${config.title}입니다.`;

  return (
    <header className="shrink-0 border-b border-slate-100 px-5 py-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h1 className="truncate text-2xl font-bold">인스테크</h1>
          <p className="mt-2 text-sm text-slate-400">{categoryDescription}</p>
        </div>
        <button
          className="h-10 rounded-lg bg-[#143f80] px-5 text-sm font-bold text-white hover:bg-[#0f3269]"
          onClick={() => openCreateOrderSidebar(sidebarFormType)}
          type="button"
        >
          {actionLabel}
        </button>
      </div>
    </header>
  );
}

function getSidebarFormType(pathname: string): SidebarFormType {
  if (pathname === "/production-orders") return "production";
  if (pathname === "/product-processes") return "process";
  if (pathname === "/shipments") return "shipment";
  if (pathname === "/labels") return "label";
  if (pathname === "/histories") return "history";

  return "purchase";
}
