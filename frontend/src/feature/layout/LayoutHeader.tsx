"use client";

import { usePathname } from "next/navigation";
import { useOrderSidebar } from "../ordersidebar/OrderSidebarContext";

type HeaderConfig = {
  actionLabel?: string;
  description?: string;
  title: string;
};

const DEFAULT_ACTION_LABEL = "+ 생성";

const headerConfigs: Record<string, HeaderConfig> = {
  "/dashboard": { title: "대시보드" },
  "/scan": { title: "스캔" },
  "/orders": {
    actionLabel: "+ 주문 생성",
    description: "발주서를 확인하고 오른쪽 패널에서 상세 보기 또는 주문 생성을 진행합니다.",
    title: "발주서",
  },
  "/production-orders": {
    actionLabel: "+ 생산지시 생성",
    description: "발주서를 기준으로 생성된 생산지시와 공정 진행 상태를 확인합니다.",
    title: "생산지시",
  },
  "/product-processes": {
    description: "제품 QR 기준으로 공정 진행 상태와 출하 대상 여부를 확인합니다.",
    title: "생산현황",
  },
  "/shipments": {
    description: "제품 QR 기준으로 납품출하 완료 여부와 출하 이력을 확인합니다.",
    title: "납품출하",
  },
  "/labels": {
    description: "생산지시와 제품 QR 기준으로 라벨 출력 정보를 확인합니다.",
    title: "라벨",
  },
  "/histories": { title: "이력" },
  "/qr-search": { title: "QR조회" },
  "/settings/users": { title: "사용자 관리" },
  "/settings/permissions": { title: "권한 설정" },
};

export default function LayoutHeader() {
  const pathname = usePathname();
  const { openCreateOrderSidebar } = useOrderSidebar();
  const config = headerConfigs[pathname] ?? { title: "QR 이력관리" };
  const actionLabel = config.actionLabel ?? DEFAULT_ACTION_LABEL;

  return (
    <header className="shrink-0 border-b border-slate-100 px-5 py-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h1 className="truncate text-2xl font-bold">{config.title}</h1>
          {config.description && (
            <p className="mt-2 text-sm text-slate-400">{config.description}</p>
          )}
        </div>
        <button
          className="h-10 rounded-lg bg-[#143f80] px-5 text-sm font-bold text-white hover:bg-[#0f3269]"
          onClick={openCreateOrderSidebar}
          type="button"
        >
          {actionLabel}
        </button>
      </div>
    </header>
  );
}
