import type { ApiResponse, DashboardOrder } from "./dashboardTypes";
import { orderEndpoints } from "../../../lib/endpoints";
import { apiClient, getApiErrorMessage } from "../../../util/apiClient";

export async function fetchDashboardOrders(signal?: AbortSignal) {
  const response = await apiClient(orderEndpoints.dashboard, {
    cache: "no-store",
    signal,
  });

  if (!response.ok) {
    throw new Error(await getApiErrorMessage(response, "전체 작업 현황을 불러오지 못했습니다."));
  }

  const result = (await response.json()) as ApiResponse<DashboardOrder[]>;

  if (!result.success || !Array.isArray(result.data)) {
    throw new Error(result.message || "전체 작업 현황 응답이 올바르지 않습니다.");
  }

  return result.data;
}
