import { orderEndpoints } from "../../../lib/endpoints";
import { apiClient, readApiData } from "../../../util/apiClient";
import type { ProductQrDetail } from "./qrSearchTypes";

export async function fetchProductQrDetail(productQr: string, signal?: AbortSignal) {
  const response = await apiClient(orderEndpoints.productQrDetail(productQr), { cache: "no-store", signal });
  return readApiData<ProductQrDetail>(response);
}
