export type ProductProcessStatus = "INSTRUCTION" | "ASSEMBLY" | "TEST" | "FINAL_INSPECTION" | "PACKAGING" | "SHIPPED";

export interface ProductProcessHistory {
  id: number;
  process: ProductProcessStatus;
  completedTime: string;
  defect: boolean;
}

export interface ProductQrDetail {
  productQr: string;
  purchaseId: string;
  customer: string | null;
  productName: string | null;
  lot: string | null;
  currentProcess: ProductProcessStatus;
  defect: boolean;
  createdTime: string;
  processHistories: ProductProcessHistory[];
  productCategory: import("../order/OrdersTypes").ProductCategory | null;
}

