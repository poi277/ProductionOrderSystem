"use client";

import { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";
import type { Order, RightPanelMode, SidebarFormType } from "../order/OrdersTypes";
import OrderRightPanel from "./OrderRightPanel";

type OrderForm = {
  purchaseId: string;
  customer: string;
  product: string;
  quantity: string;
  unitPrice: string;
  dueDate: string;
  memo: string;
};

type OrderSidebarContextValue = {
  selectedOrder: Order | null;
  sidebarFormType: SidebarFormType;
  rightPanelMode: RightPanelMode;
  isRightPanelOpen: boolean;
  closeOrderSidebar: () => void;
  clearOrderSidebarSelection: () => void;
  openCreateOrderSidebar: (formType?: SidebarFormType) => void;
  openOrderDetailSidebar: (order: Order) => void;
  setOrderSidebarMode: (mode: RightPanelMode, formType?: SidebarFormType) => void;
};

const OrderSidebarContext = createContext<OrderSidebarContextValue | null>(null);

export function OrderSidebarProvider({ children }: { children: ReactNode }) {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [sidebarFormType, setSidebarFormType] = useState<SidebarFormType>("purchase");
  const [rightPanelMode, setRightPanelMode] = useState<RightPanelMode>("detail");
  const [isRightPanelOpen, setIsRightPanelOpen] = useState(false);

  const closeOrderSidebar = () => {
    setIsRightPanelOpen(false);
  };

  const clearOrderSidebarSelection = () => {
    setSelectedOrder(null);
    setRightPanelMode("detail");
    setIsRightPanelOpen(true);
  };

  const openOrderDetailSidebar = (order: Order) => {
    setSelectedOrder(order);
    setSidebarFormType(order.detailType ?? "purchase");
    setRightPanelMode("detail");
    setIsRightPanelOpen(true);
  };

  const openCreateOrderSidebar = (formType: SidebarFormType = "purchase") => {
    setSidebarFormType(formType);
    setRightPanelMode("create");
    setIsRightPanelOpen(true);
  };

  const setOrderSidebarMode = (mode: RightPanelMode, formType?: SidebarFormType) => {
    if (formType) {
      setSidebarFormType(formType);
    }

    setRightPanelMode(mode);
    setIsRightPanelOpen(true);
  };

  const handleSaveCreate = (form: OrderForm) => {
    console.log("\ubc1c\uc8fc\uc11c\u0020\uc0dd\uc131\u0020\uc785\ub825\uac12", form);
    setIsRightPanelOpen(true);
  };

  return (
    <OrderSidebarContext.Provider
      value={{
        selectedOrder,
        sidebarFormType,
        rightPanelMode,
        isRightPanelOpen,
        closeOrderSidebar,
        clearOrderSidebarSelection,
        openCreateOrderSidebar,
        openOrderDetailSidebar,
        setOrderSidebarMode,
      }}
    >
      {children}
      <OrderRightPanel
        isOpen={isRightPanelOpen}
        mode={rightPanelMode}
        onCancelCreate={() => setRightPanelMode("detail")}
        onClose={closeOrderSidebar}
        onOpen={() => setIsRightPanelOpen(true)}
        onSaveCreate={handleSaveCreate}
        onSetMode={setOrderSidebarMode}
        selectedOrder={selectedOrder}
        sidebarFormType={sidebarFormType}
      />
    </OrderSidebarContext.Provider>
  );
}

export function useOrderSidebar() {
  const context = useContext(OrderSidebarContext);

  if (!context) {
    throw new Error("useOrderSidebar must be used inside OrderSidebarProvider");
  }

  return context;
}
