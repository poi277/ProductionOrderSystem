export type ProcessStatus =
  | "PURCHASESUBMIT"
  | "INSTRUCTION"
  | "ASSEMBLY"
  | "TEST"
  | "FINAL_INSPECTION"
  | "PACKAGING"
  | "WAITING_FOR_SHIPMENT";

export type DashboardOrder = {
  id: number;
  purchaseId: string;
  customer: string | null;
  productName: string | null;
  quantity: number | null;
  status: ProcessStatus | null;
};

export type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
};
