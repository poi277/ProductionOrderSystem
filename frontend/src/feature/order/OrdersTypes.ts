export type Order = {
  id: number;
  orderNo: string;
  orderDate: string;
  customer: string;
  product: string;
  quantity: string;
  unitPrice: string;
  dueDate: string;
  status: string;
  memo: string;
  selected?: boolean;
};

export type RightPanelMode = "detail" | "create";
