import { useEffect } from "react";
import { usePathname } from "next/navigation";
import type { Order, PurchaseOption, SidebarFormType } from "../order/OrdersTypes";
import OrderUnifiedDetailDrawer, { DrawerCategory } from "./OrderUnifiedDetailDrawer";
import type { SidebarNotification } from "./OrderSidebarContext";

type OrderRightPanelProps = {
  selectedOrder: Order | null;
  onClose: () => void;
  onResetSelection: () => void;
  purchaseOptions: PurchaseOption[];
  notification: SidebarNotification;
};

export default function OrderRightPanel({ selectedOrder, onClose, onResetSelection, purchaseOptions, notification }: OrderRightPanelProps) {
  const pathname = usePathname();
  const currentPageFormType = getCurrentPageFormType(pathname);
  const visibleSelectedOrder = (selectedOrder?.detailType ?? "purchase") === currentPageFormType ? selectedOrder : null;

  useEffect(() => {
    onResetSelection();
    // 카테고리를 이동할 때 이전 목록 선택을 초기화한다.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  return (
    <aside className="fixed right-0 top-0 z-50 h-screen w-full overflow-visible md:w-[420px]">
      <div className="h-full w-full overflow-hidden bg-[#f6f7f9] md:w-[420px]">
        <OrderUnifiedDetailDrawer
          category={getDrawerCategory(pathname)}
          externalNotification={notification}
          onClose={onClose}
          selectedItem={visibleSelectedOrder}
          processEditable={pathname === "/product-processes" || pathname === "/process-histories"}
          purchaseOptions={purchaseOptions}
        />
      </div>
    </aside>
  );
}

function getDrawerCategory(pathname: string): DrawerCategory {
  if ([
    "/labels",
    "/qr-search",
    "/order-purchase-histories",
    "/histories",
    "/shipments",
    "/scan",
    "/settings/users",
    "/settings/permissions",
  ].includes(pathname)) {
    return DrawerCategory.DISABLED;
  }
  if (pathname === "/production-orders") return DrawerCategory.PRODUCTION;
  if (pathname === "/product-processes") return DrawerCategory.PROCESS_OVERVIEW;
  if (pathname === "/process-histories") return DrawerCategory.PRODUCT;
  return DrawerCategory.PURCHASE;
}

function getCurrentPageFormType(pathname: string): SidebarFormType {
  if (pathname === "/production-orders") return "production";
  if (pathname === "/product-processes") return "process";
  if (pathname === "/process-histories") return "process";
  if (pathname === "/shipments") return "shipment";
  if (pathname === "/labels") return "label";
  if (pathname === "/histories") return "history";
  return "purchase";
}
