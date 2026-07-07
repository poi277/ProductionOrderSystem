"use client";

import { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";
import type { Order, RightPanelMode } from "../order/OrdersTypes";
import OrderRightPanel from "./OrderRightPanel";

type OrderForm = {
  customer: string;
  product: string;
  quantity: string;
  unitPrice: string;
  dueDate: string;
  memo: string;
};

type OrderSidebarContextValue = {
  selectedOrder: Order | null;
  rightPanelMode: RightPanelMode;
  isRightPanelOpen: boolean;
  closeOrderSidebar: () => void;
  clearOrderSidebarSelection: () => void;
  openCreateOrderSidebar: () => void;
  openOrderDetailSidebar: (order: Order) => void;
  setOrderSidebarMode: (mode: RightPanelMode) => void;
};

const OrderSidebarContext = createContext<OrderSidebarContextValue | null>(null);

export function OrderSidebarProvider({ children }: { children: ReactNode }) {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [rightPanelMode, setRightPanelMode] = useState<RightPanelMode>("detail");
  const [isRightPanelOpen, setIsRightPanelOpen] = useState(false);

  const closeOrderSidebar = () => {
    setIsRightPanelOpen(false);
  };

  const clearOrderSidebarSelection = () => {
    setSelectedOrder(null);
    setIsRightPanelOpen(false);
  };

  const openOrderDetailSidebar = (order: Order) => {
    setSelectedOrder(order);
    setRightPanelMode("detail");
    setIsRightPanelOpen(true);
  };

  const openCreateOrderSidebar = () => {
    setRightPanelMode("create");
    setIsRightPanelOpen(true);
  };

  const setOrderSidebarMode = (mode: RightPanelMode) => {
    setRightPanelMode(mode);
    setIsRightPanelOpen(true);
  };

  const handleSaveCreate = (form: OrderForm) => {
    console.log("주문 생성 입력값", form);
    setRightPanelMode("detail");
    setIsRightPanelOpen(true);
  };

  return (
    <OrderSidebarContext.Provider
      value={{
        selectedOrder,
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
