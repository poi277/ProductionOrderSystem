import type { ReactNode } from "react";
import { OrderSidebarProvider } from "../ordersidebar/OrderSidebarContext";

type OrderLayoutProps = {
  children: ReactNode;
};

export default function OrderLayout({ children }: OrderLayoutProps) {
  return <OrderSidebarProvider>{children}</OrderSidebarProvider>;
}
