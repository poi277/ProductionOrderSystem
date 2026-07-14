"use client";

import { useEffect, useState } from "react";
import DashboardOrdersTable from "./DashboardOrdersTable";
import { fetchDashboardOrders } from "./dashboardApi";
import type { DashboardOrder } from "./dashboardTypes";

export default function DashboardPage() {
  const [orders, setOrders] = useState<DashboardOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    const loadOrders = async () => {
      setIsLoading(true);
      setErrorMessage("");

      try {
        setOrders(await fetchDashboardOrders(controller.signal));
      } catch (error) {
        if (controller.signal.aborted) return;
        setOrders([]);
        setErrorMessage(error instanceof Error ? error.message : "전체 작업 현황 조회 중 오류가 발생했습니다.");
      } finally {
        if (!controller.signal.aborted) setIsLoading(false);
      }
    };

    void loadOrders();
    return () => controller.abort();
  }, []);

  return (
    <main className="flex min-h-0 min-w-0 flex-1 flex-col bg-white text-slate-950">
      <section className="flex min-h-0 min-w-0 flex-1 flex-col px-5 py-5">
        <div className="mb-4">
          <h2 className="text-lg font-extrabold text-slate-950">전체 작업 현황</h2>
          <p className="mt-1 text-sm font-medium text-slate-500">진행 중인 발주서의 공정 상태를 한눈에 확인합니다.</p>
        </div>

        {isLoading ? (
          <StatusMessage>전체 작업 현황을 불러오는 중입니다.</StatusMessage>
        ) : errorMessage ? (
          <StatusMessage tone="error">{errorMessage}</StatusMessage>
        ) : orders.length === 0 ? (
          <StatusMessage>현재 진행 중인 작업이 없습니다.</StatusMessage>
        ) : (
          <DashboardOrdersTable orders={orders} />
        )}
      </section>
    </main>
  );
}

function StatusMessage({ children, tone = "default" }: { children: React.ReactNode; tone?: "default" | "error" }) {
  return (
    <div className={`flex min-h-64 flex-1 items-center justify-center rounded-xl border px-6 text-center text-sm font-bold ${
      tone === "error" ? "border-rose-200 bg-rose-50 text-rose-700" : "border-slate-200 bg-slate-50 text-slate-500"
    }`}>
      {children}
    </div>
  );
}
