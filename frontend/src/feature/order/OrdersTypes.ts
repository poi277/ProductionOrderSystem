export type Order = {
  id: number;
  purchaseDbId?: number;
  productionDbId?: number;
  purchaseStatus?: string | null;
  purchaseNote?: string | null;
  purchaseCreatedTime?: string | null;
  purchaseDueDate?: string | null;
  productCategory?: ProductCategory | null;
  productQrQuantity?: number | null;
  detailType?: "purchase" | "production" | "process" | "shipment" | "label" | "history";
  orderNo: string;
  orderDate: string;
  historyId?: string | number;
  productionOrderNo?: string;
  productionOrderId?: string;
  customer: string;
  product: string;
  quantity: string;
  instructionQuantity?: string;
  completedQuantity?: string;
  shippedQuantity?: string;
  productQr?: string;
  qrData?: string;
  title?: string;
  line1?: string;
  line2?: string;
  printedAt?: string;
  lotNo?: string;
  processName?: string;
  processSequence?: string;
  productProcessStatus?: string;
  isDefect?: boolean;
  processUpdateScope?: "product" | "production";
  isShipmentTarget?: string;
  startedAt?: string;
  productProcessNo?: string;
  shippedAt?: string;
  createdAt?: string;
  updatedAt?: string;
  judgment?: string;
  defectType?: string;
  worker?: string;
  equipment?: string;
  dueDate: string;
  status: string;
  memo: string;
  selected?: boolean;
};

export type ProductCategory = "AUTOMATIC_DAMPER" | "LEAK_SENSOR" | "DISPENSER" | "GATE";

export type RightPanelMode = "detail" | "create";

export type SidebarFormType = "purchase" | "production" | "process" | "shipment" | "label" | "history";

export type PurchaseOption = {
  id: number;
  purchaseId: string;
  customer: string | null;
  productName: string | null;
  quantity: number | null;
  dueDate: string | null;
  status: "PURCHASESUBMIT" | "INSTRUCTION" | "ASSEMBLY" | "TEST" | "FINAL_INSPECTION" | "PACKAGING" | "SHIPPED" | null;
  note: string | null;
  createdTime: string | null;
  productCategory?: ProductCategory | null;
};

