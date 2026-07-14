import type { ReactNode } from "react";
import { OrderSidebarProvider } from "../ordersidebar/OrderSidebarContext";
import LayoutHeader from "./LayoutHeader";
import Sidebar from "./LayoutSidebar";

type MainLayoutProps = {
  children: ReactNode;
};

export default function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col bg-white text-slate-950 md:flex-row">
      <Sidebar />
        <div className="flex min-w-0 flex-1 shrink flex-col">
          <LayoutHeader />
          <div className="flex min-w-0 flex-1 shrink flex-col lg:flex-row">{children}</div>
        </div>
    </div>
  );
}
