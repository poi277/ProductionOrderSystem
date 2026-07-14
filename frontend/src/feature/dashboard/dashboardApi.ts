import type { ApiResponse, DashboardOrder } from "./dashboardTypes";

const orderApiBaseUrl = process.env.NEXT_PUBLIC_ORDER_API_BASE_URL ?? "http://localhost:8080/order";

export async function fetchDashboardOrders(signal?: AbortSignal) {
  const response = await fetch(`${orderApiBaseUrl}/getDashBoard`, {
    cache: "no-store",
    signal,
  });

  if (!response.ok) {
    throw new Error("전체 작업 현황을 불러오지 못했습니다.");
  }

  const result = (await response.json()) as ApiResponse<DashboardOrder[]>;

  if (!result.success || !Array.isArray(result.data)) {
    throw new Error(result.message || "전체 작업 현황 응답이 올바르지 않습니다.");
  }

  return result.data;
}
