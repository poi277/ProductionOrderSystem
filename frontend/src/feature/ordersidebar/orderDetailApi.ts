import { orderEndpoints } from "../../../lib/endpoints";
import { apiClient, getApiErrorMessage } from "../../../util/apiClient";
import type { ProductCategory } from "../order/OrdersTypes";

export type ProcessStatus = "PURCHASESUBMIT" | "INSTRUCTION" | "ASSEMBLY" | "TEST" | "FINAL_INSPECTION" | "PACKAGING" | "SHIPPED" | "CANCEL";

export type PurchaseDetail = {
  id: number; purchaseId: string; customer: string | null; productName: string | null; quantity: number | null;
  dueDate: string | null; status: ProcessStatus | null;
  note: string | null; createdTime: string | null;
  productCategory?: ProductCategory | null;
};

export type ProductDetail = {
  productQr: string; productionId: string | null; customer: string | null; productName: string | null;
  quantity: number | null; lot: string | null; process: ProcessStatus | null; processName: string | null;
  processSequence: string | null; isDefect: boolean | null; createdTime: string | null;
};

type ApiResponse<T> = { success: boolean; message: string; data: T };
async function request<T>(url: string, init?: RequestInit) {
  const response = await apiClient(url, { cache: "no-store", ...init });
  const result = (await response.json()) as ApiResponse<T>;
  if (!response.ok || !result.success) throw new Error(result.message || "요청을 처리하지 못했습니다.");
  return result.data;
}

export const updatePurchaseDetail = (id: number, body: object) =>
  request<PurchaseDetail>(orderEndpoints.detail(id), {
    method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body),
  });

export const updateProductProcess = (productQr: string, body: { processName: ProcessStatus | null; isDefect: boolean }) =>
  request<ProductDetail>(orderEndpoints.productProcess(productQr), {
    method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body),
  });

export const updateProductionProcesses = (purchaseDbId: number, processName: ProcessStatus) =>
  request<ProductDetail[]>(orderEndpoints.productProcessesByProduction(purchaseDbId), {
    method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ processName }),
  });

export async function deletePurchase(id: number) {
  const response = await apiClient(orderEndpoints.detail(id), { method: "DELETE" });
  if (!response.ok) throw new Error(await getApiErrorMessage(response, "발주서를 삭제하지 못했습니다."));
}

export async function deleteProduct(productQr: string) {
  const response = await apiClient(orderEndpoints.productProcess(productQr), { method: "DELETE" });
  if (!response.ok) throw new Error(await getApiErrorMessage(response, "제품을 삭제하지 못했습니다."));
}

