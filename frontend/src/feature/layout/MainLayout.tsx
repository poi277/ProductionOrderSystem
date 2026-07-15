"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import LayoutHeader from "./LayoutHeader";
import Sidebar from "./LayoutSidebar";

type MainLayoutProps = {
  children: ReactNode;
};

export default function MainLayout({ children }: MainLayoutProps) {
  const pathname = usePathname();

  if (pathname === "/login" || pathname === "/register") return children;

  return (
    <div className="flex h-screen overflow-hidden flex-col bg-white text-slate-950 md:flex-row">
      <Sidebar />
        <div className="flex min-h-0 min-w-0 flex-1 shrink flex-col overflow-hidden">
          <LayoutHeader />
          <div className="flex min-h-0 min-w-0 flex-1 shrink flex-col overflow-hidden lg:flex-row">{children}</div>
        </div>
    </div>
  );
}
