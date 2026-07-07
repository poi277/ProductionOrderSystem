import { usePathname } from "next/navigation";
import type { Order, RightPanelMode, SidebarFormType } from "../order/OrdersTypes";
import OrderCreatePanel from "./OrderCreatePanel";
import OrderDetailPanel from "./OrderDetailPanel";
import OrderHistoryCreatePanel from "./OrderHistoryCreatePanel";
import OrderLabelCreatePanel from "./OrderLabelCreatePanel";
import OrderProcessCreatePanel from "./OrderProcessCreatePanel";
import OrderProductionCreatePanel from "./OrderProductionCreatePanel";
import OrderShipmentCreatePanel from "./OrderShipmentCreatePanel";

type OrderRightPanelProps = {
  isOpen: boolean;
  mode: RightPanelMode;
  selectedOrder: Order | null;
  sidebarFormType: SidebarFormType;
  onCancelCreate: () => void;
  onClose: () => void;
  onOpen: () => void;
  onSaveCreate: (form: {
    purchaseId: string;
    customer: string;
    product: string;
    quantity: string;
    unitPrice: string;
    dueDate: string;
    memo: string;
  }) => void;
  onSetMode: (mode: RightPanelMode, formType?: SidebarFormType) => void;
};

export default function OrderRightPanel({
  isOpen,
  mode,
  selectedOrder,
  sidebarFormType,
  onCancelCreate,
  onClose,
  onOpen,
  onSaveCreate,
  onSetMode,
}: OrderRightPanelProps) {
  const pathname = usePathname();
  const currentPageFormType = getCurrentPageFormType(pathname);
  const visibleSelectedOrder =
    (selectedOrder?.detailType ?? "purchase") === currentPageFormType ? selectedOrder : null;

  return (
    <aside
      className={`relative z-40 h-screen shrink-0 overflow-visible transition-[width] duration-300 ${
        isOpen ? "w-full md:w-[420px]" : "w-0"
      }`}
    >
      <button
        className="absolute left-0 top-1/2 z-20 flex h-10 w-10 -translate-x-full -translate-y-1/2 items-center justify-center rounded-l-lg bg-[#f6f7f9] text-slate-500 shadow-sm"
        onClick={isOpen ? onClose : onOpen}
        type="button"
      >
        {isOpen ? "<" : ">"}
      </button>

      <div
        className={`h-full overflow-hidden bg-[#f6f7f9] shadow-xl transition-[width,opacity] duration-300 ${
          isOpen ? "w-full opacity-100 md:w-[420px]" : "pointer-events-none w-0 opacity-0"
        }`}
      >
        <div className="w-full pt-14 md:w-[420px] md:pt-0">
          <div className="px-5 pt-5">
            <div className="grid grid-cols-2 rounded-lg bg-[#eef1f8] p-1 text-xs font-bold text-slate-500">
              <button
                className={`h-8 rounded-md transition-colors ${
                  mode === "detail" ? "bg-white text-[#143f80] shadow-sm" : ""
                }`}
                onClick={() => onSetMode("detail")}
                type="button"
              >
                목록
              </button>
              <button
                className={`h-8 rounded-md transition-colors ${
                  mode === "create" ? "bg-white text-[#143f80] shadow-sm" : ""
                }`}
                onClick={() => onSetMode("create", currentPageFormType)}
                type="button"
              >
                {getCreateTabLabel(currentPageFormType)}
              </button>
            </div>
          </div>
          {mode === "create" ? (
            sidebarFormType === "shipment" ? (
              <OrderShipmentCreatePanel onCancel={onCancelCreate} />
            ) : sidebarFormType === "label" ? (
              <OrderLabelCreatePanel onCancel={onCancelCreate} />
            ) : sidebarFormType === "history" ? (
              <OrderHistoryCreatePanel onCancel={onCancelCreate} />
            ) : sidebarFormType === "process" ? (
              <OrderProcessCreatePanel onCancel={onCancelCreate} />
            ) : sidebarFormType === "production" ? (
              <OrderProductionCreatePanel onCancel={onCancelCreate} />
            ) : (
              <OrderCreatePanel onCancel={onCancelCreate} onSave={onSaveCreate} />
            )
          ) : (
            <OrderDetailPanel
              key={
                visibleSelectedOrder
                  ? `${visibleSelectedOrder.detailType ?? "purchase"}-${visibleSelectedOrder.id}-${visibleSelectedOrder.orderNo}`
                  : "empty"
              }
              order={visibleSelectedOrder}
            />
          )}
        </div>
      </div>
    </aside>
  );
}

function getCurrentPageFormType(pathname: string): SidebarFormType {
  if (pathname === "/production-orders") return "production";
  if (pathname === "/product-processes") return "process";
  if (pathname === "/shipments") return "shipment";
  if (pathname === "/labels") return "label";
  if (pathname === "/histories") return "history";

  return "purchase";
}

function getCreateTabLabel(formType: SidebarFormType) {
  switch (formType) {
    case "production":
      return "생산지시";
    case "process":
      return "생산현황";
    case "shipment":
      return "납품출하";
    case "label":
      return "라벨";
    case "history":
      return "이력";
    default:
      return "주문";
  }
}
