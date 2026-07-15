"use client";

import { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";
import type { Order, PurchaseOption } from "../order/OrdersTypes";
import OrderRightPanel from "./OrderRightPanel";

type OrderSidebarContextValue = {
  selectedOrder: Order | null;
  isRightPanelOpen: boolean;
  closeOrderSidebar: () => void;
  clearOrderSidebarSelection: () => void;
  openOrderDetailSidebar: (order: Order) => void;
  purchaseOptions: PurchaseOption[];
  setPurchaseOptions: (options: PurchaseOption[]) => void;
  showSidebarNotification: (message: string, error?: boolean) => void;
};

export type SidebarNotification = { error: boolean; message: string } | null;

const OrderSidebarContext = createContext<OrderSidebarContextValue | null>(null);

export function OrderSidebarProvider({ children }: { children: ReactNode }) {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [purchaseOptions, setPurchaseOptions] = useState<PurchaseOption[]>([]);
  const [sidebarNotification, setSidebarNotification] = useState<SidebarNotification>(null);
  const isRightPanelOpen = true;

  const closeOrderSidebar = () => setSelectedOrder(null);
  const clearOrderSidebarSelection = () => {
    setSelectedOrder(null);
    setSidebarNotification(null);
  };
  const openOrderDetailSidebar = (order: Order) => {
    setSidebarNotification(null);
    setSelectedOrder(order);
  };
  const showSidebarNotification = (message: string, error = false) => setSidebarNotification({ error, message });

  return (
    <OrderSidebarContext.Provider value={{ selectedOrder, isRightPanelOpen, closeOrderSidebar, clearOrderSidebarSelection, openOrderDetailSidebar, purchaseOptions, setPurchaseOptions, showSidebarNotification }}>
      <div className="flex min-w-0 flex-1 flex-col md:pr-[420px]">{children}</div>
      <OrderRightPanel notification={sidebarNotification} onClose={closeOrderSidebar} onResetSelection={clearOrderSidebarSelection} purchaseOptions={purchaseOptions} selectedOrder={selectedOrder} />
    </OrderSidebarContext.Provider>
  );
}

export function useOrderSidebar() {
  const context = useContext(OrderSidebarContext);
  if (!context) throw new Error("useOrderSidebar must be used inside OrderSidebarProvider");
  return context;
}
