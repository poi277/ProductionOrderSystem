export type ProcessStatus =
  | "PURCHASESUBMIT"
  | "INSTRUCTION"
  | "ASSEMBLY"
  | "TEST"
  | "FINAL_INSPECTION"
  | "PACKAGING"
  | "SHIPPED";

export type DashboardOrder = {
  id: number;
  purchaseId: string;
  customer: string | null;
  productName: string | null;
  quantity: number | null;
  status: ProcessStatus | null;
  processCompletedTimes: Partial<Record<ProcessStatus, string>>;
  productCategory: import("../order/OrdersTypes").ProductCategory | null;
};

export type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
};

