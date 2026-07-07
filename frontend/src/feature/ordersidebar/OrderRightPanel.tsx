import type { Order, RightPanelMode } from "../order/OrdersTypes";
import OrderCreatePanel from "./OrderCreatePanel";
import OrderDetailPanel from "./OrderDetailPanel";

type OrderRightPanelProps = {
  isOpen: boolean;
  mode: RightPanelMode;
  selectedOrder: Order | null;
  onCancelCreate: () => void;
  onClose: () => void;
  onOpen: () => void;
  onSaveCreate: (form: {
    customer: string;
    product: string;
    quantity: string;
    unitPrice: string;
    dueDate: string;
    memo: string;
  }) => void;
  onSetMode: (mode: RightPanelMode) => void;
};

export default function OrderRightPanel({
  isOpen,
  mode,
  selectedOrder,
  onCancelCreate,
  onClose,
  onOpen,
  onSaveCreate,
  onSetMode,
}: OrderRightPanelProps) {
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
        {isOpen ? "›" : "‹"}
      </button>

      <div
        className={`h-full overflow-hidden bg-[#f6f7f9] shadow-xl transition-[width,opacity] duration-300 ${
          isOpen ? "w-full opacity-100 md:w-[420px]" : "pointer-events-none w-0 opacity-0"
        }`}
      >
        <div className="w-full pt-14 md:w-[420px] md:pt-0">
          <div className="px-5 pt-5">
            <div className="grid grid-cols-2 rounded-lg bg-[#eef1f8] p-1 text-sm font-bold text-slate-500">
              <button
                className={`h-9 rounded-md transition-colors ${
                  mode === "detail" ? "bg-white text-[#143f80] shadow-sm" : ""
                }`}
                onClick={() => onSetMode("detail")}
                type="button"
              >
                목록
              </button>
              <button
                className={`h-9 rounded-md transition-colors ${
                  mode === "create" ? "bg-white text-[#143f80] shadow-sm" : ""
                }`}
                onClick={() => onSetMode("create")}
                type="button"
              >
                주문
              </button>
            </div>
          </div>
          {mode === "create" ? (
            <OrderCreatePanel onCancel={onCancelCreate} onSave={onSaveCreate} />
          ) : (
            <OrderDetailPanel order={selectedOrder} />
          )}
        </div>
      </div>
    </aside>
  );
}
