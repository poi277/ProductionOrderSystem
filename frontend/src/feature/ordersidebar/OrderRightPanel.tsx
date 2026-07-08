import { usePathname } from "next/navigation";
import { useState } from "react";
import { getCategoryActiveClass } from "../common/categoryActiveStyles";
import type { CategoryActiveKey } from "../common/categoryActiveStyles";
import type { Order, RightPanelMode, SidebarFormType } from "../order/OrdersTypes";
import OrderCreatePanel from "./OrderCreatePanel";
import OrderDetailPanel from "./OrderDetailPanel";
import OrderHistoryCreatePanel from "./OrderHistoryCreatePanel";
import OrderLabelCreatePanel from "./OrderLabelCreatePanel";
import OrderProcessCreatePanel from "./OrderProcessCreatePanel";
import OrderProductionCreatePanel from "./OrderProductionCreatePanel";
import OrderShipmentCreatePanel from "./OrderShipmentCreatePanel";

const formSwitchButtons: Array<{ activeKey: CategoryActiveKey; formType: SidebarFormType; label: string }> = [
  { activeKey: "order", formType: "purchase", label: "발주서" },
  { activeKey: "production", formType: "production", label: "생산지시" },
  { activeKey: "process", formType: "process", label: "생산현황" },
  { activeKey: "shipment", formType: "shipment", label: "납품출하" },
  { activeKey: "label", formType: "label", label: "라벨" },
];

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
  const [selectedFormType, setSelectedFormType] = useState<SidebarFormType>(sidebarFormType);
  const activeFormType = mode === "create" ? sidebarFormType : selectedFormType;
  const visibleSelectedOrder =
    (selectedOrder?.detailType ?? "purchase") === currentPageFormType ? selectedOrder : null;
  const submitButtonClassName = getCategoryActiveClass(getFormActiveKey(sidebarFormType));

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
                  mode === "detail" ? "bg-white text-black" : "hover:text-slate-900"
                }`}
                onClick={() => onSetMode("detail")}
                type="button"
              >
                목록
              </button>
              <button
                className={`h-8 rounded-md transition-colors ${
                  mode === "create" ? "bg-white text-black" : "hover:text-slate-900"
                }`}
                onClick={() => {
                  setSelectedFormType(currentPageFormType);
                  onSetMode("create", currentPageFormType);
                }}
                type="button"
              >
                주문
              </button>
            </div>
            <div className="mt-2 grid grid-cols-5 gap-1 rounded-lg bg-[#eef1f8] p-1 text-[11px] font-bold text-slate-500">
              {formSwitchButtons.map((button) => {
                const isActive = mode === "create" && activeFormType === button.formType;

                return (
                  <button
                    className={`h-8 rounded-md transition-colors ${
                      isActive ? getCategoryActiveClass(button.activeKey) : "hover:text-slate-900"
                    }`}
                    key={button.formType}
                    onClick={() => {
                      setSelectedFormType(button.formType);
                      onSetMode("create", button.formType);
                    }}
                    type="button"
                  >
                    {button.label}
                  </button>
                );
              })}
            </div>
          </div>
          <div className="h-[680px] overflow-y-auto pb-5">
            {mode === "create" ? (
              sidebarFormType === "shipment" ? (
                <OrderShipmentCreatePanel onCancel={onCancelCreate} submitButtonClassName={submitButtonClassName} />
              ) : sidebarFormType === "label" ? (
                <OrderLabelCreatePanel onCancel={onCancelCreate} submitButtonClassName={submitButtonClassName} />
              ) : sidebarFormType === "history" ? (
                <OrderHistoryCreatePanel onCancel={onCancelCreate} submitButtonClassName={submitButtonClassName} />
              ) : sidebarFormType === "process" ? (
                <OrderProcessCreatePanel onCancel={onCancelCreate} submitButtonClassName={submitButtonClassName} />
              ) : sidebarFormType === "production" ? (
                <OrderProductionCreatePanel onCancel={onCancelCreate} submitButtonClassName={submitButtonClassName} />
              ) : (
                <OrderCreatePanel
                  onCancel={onCancelCreate}
                  onSave={onSaveCreate}
                  submitButtonClassName={submitButtonClassName}
                />
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

function getFormActiveKey(formType: SidebarFormType): CategoryActiveKey {
  switch (formType) {
    case "production":
      return "production";
    case "process":
      return "process";
    case "shipment":
      return "shipment";
    case "label":
      return "label";
    case "history":
      return "history";
    default:
      return "order";
  }
}
