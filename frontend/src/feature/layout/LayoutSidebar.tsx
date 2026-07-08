"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { getCategoryActiveClass } from "../common/categoryActiveStyles";
import type { CategoryActiveKey } from "../common/categoryActiveStyles";

type IconName =
  | "dashboard"
  | "scan"
  | "orders"
  | "production"
  | "process"
  | "shipment"
  | "label"
  | "history"
  | "qr"
  | "settings"
  | "user"
  | "lock";

type Menu = {
  activeKey: CategoryActiveKey;
  label: string;
  href: string;
  icon: IconName;
};

const mainMenus: Menu[] = [
  { activeKey: "dashboard", label: "대시보드", href: "/dashboard", icon: "dashboard" },
  { activeKey: "order", label: "발주서", href: "/orders", icon: "orders" },
  { activeKey: "production", label: "생산지시", href: "/production-orders", icon: "production" },
  { activeKey: "process", label: "생산현황", href: "/product-processes", icon: "process" },
  { activeKey: "shipment", label: "납품출하", href: "/shipments", icon: "shipment" },
  { activeKey: "label", label: "라벨", href: "/labels", icon: "label" },
  { activeKey: "history", label: "공정이력", href: "/process-histories", icon: "history" },
  { activeKey: "history", label: "제품이력", href: "/histories", icon: "history" },
  { activeKey: "qr", label: "QR조회", href: "/qr-search", icon: "qr" },
  { activeKey: "scan", label: "스캔", href: "/scan", icon: "scan" },
];

const settingMenus: Menu[] = [
  { activeKey: "settings", label: "사용자 관리", href: "/settings/users", icon: "user" },
  { activeKey: "settings", label: "권한 설정", href: "/settings/permissions", icon: "lock" },
];

const SIDEBAR_COLLAPSED_KEY = "sidebar-collapsed";

export default function Sidebar() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(pathname.startsWith("/settings"));
  const isSettingsActive = pathname.startsWith("/settings");
  const shouldShowSettings = isSettingsActive || isSettingsOpen;

  useEffect(() => {
    const frameId = requestAnimationFrame(() => {
      setIsCollapsed(localStorage.getItem(SIDEBAR_COLLAPSED_KEY) === "true");
      document.documentElement.classList.remove("sidebar-prehydrated");
    });

    return () => cancelAnimationFrame(frameId);
  }, []);

  const toggleSidebar = () => {
    setIsCollapsed((current) => {
      const next = !current;
      localStorage.setItem(SIDEBAR_COLLAPSED_KEY, String(next));
      document.documentElement.classList.toggle("sidebar-collapsed", next);
      return next;
    });
  };

  return (
    <aside
      className={`relative w-full shrink-0 border-b border-slate-200 bg-[#f6f7f9] px-4 py-4 text-slate-950 shadow-sm transition-all duration-300 md:min-h-screen md:border-b-0 md:border-r md:px-5 md:py-5 ${
        isCollapsed ? "md:w-[76px]" : "md:w-[220px]"
      }`}
      data-layout-sidebar
    >
      <button
        aria-label={isCollapsed ? "사이드바 펼치기" : "사이드바 접기"}
        className="absolute -right-3 top-8 hidden size-7 appearance-none items-center justify-center overflow-hidden rounded-full border border-gray-300 bg-white p-0 text-sm font-bold leading-none text-gray-500 transition-colors hover:text-gray-700 md:flex"
        onClick={toggleSidebar}
        type="button"
      >
        <svg
          aria-hidden="true"
          className="size-5"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2.4"
          viewBox="0 0 24 24"
        >
          <path d={isCollapsed ? "m9 18 6-6-6-6" : "m15 18-6-6 6-6"} />
        </svg>
      </button>

      <div
        className={`flex h-10 items-center overflow-hidden transition-all duration-300 ${
          isCollapsed ? "md:w-10 md:gap-0" : "w-full gap-3"
        }`}
      >
        <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-rose-100 text-sm font-bold text-rose-700">
          관
        </div>
        <div
          className={`min-w-0 overflow-hidden transition-all duration-300 ${
            isCollapsed ? "md:w-0 md:opacity-0" : "w-36 opacity-100"
          }`}
          data-sidebar-collapsed-hide
        >
          <p className="truncate whitespace-nowrap text-[10px] font-bold uppercase tracking-wide text-slate-400">
            Production Manager
          </p>
          <h1 className="mt-1 truncate text-base font-bold">QR 이력관리</h1>
        </div>
      </div>

      <div className="my-4 h-px bg-slate-300/70 md:my-6" />

      <nav className="flex flex-col">
        <section>
          <h2
            className={`mb-2 h-3 overflow-hidden whitespace-nowrap text-[10px] font-bold tracking-wider text-slate-400 transition-opacity ${
              isCollapsed ? "md:opacity-0" : "opacity-100"
            }`}
            data-sidebar-collapsed-hide
          >
            MAIN
          </h2>
          <ul className="grid grid-cols-2 gap-1 sm:grid-cols-3 md:grid-cols-1">
            {mainMenus.map((menu) => {
              const isActive = pathname === menu.href;

              return (
                <li key={menu.href}>
                  <Link
                    className={`flex h-10 items-center rounded-lg text-sm font-semibold transition-colors duration-300 ${
                      isCollapsed ? "md:w-11 md:px-3" : "w-full px-3"
                    } ${
                      isActive
                        ? getCategoryActiveClass(menu.activeKey)
                        : "text-slate-500 hover:bg-slate-100 hover:text-slate-950"
                    }`}
                    data-sidebar-collapsed-item
                    href={menu.href}
                    title={menu.label}
                  >
                    <SidebarIcon name={menu.icon} />
                    <span
                      className={`ml-3 overflow-hidden whitespace-nowrap transition-opacity ${
                        isCollapsed ? "md:w-0 md:opacity-0" : "opacity-100"
                      }`}
                      data-sidebar-collapsed-hide
                    >
                      {menu.label}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>

        <div className="my-4 h-px bg-slate-300/70" />

        <section className="relative">
          <button
            className={`flex h-10 items-center overflow-hidden rounded-lg text-sm font-semibold transition-colors duration-300 ${
              isCollapsed ? "md:w-11 md:px-3" : "w-full justify-between px-3"
            } ${
              isSettingsActive
                ? getCategoryActiveClass("settings")
                : "text-slate-500 hover:bg-slate-100 hover:text-slate-950"
            }`}
            data-sidebar-collapsed-item
            onClick={() => setIsSettingsOpen((value) => !value)}
            title="환경설정"
            type="button"
          >
            <span className="flex items-center">
              <SidebarIcon name="settings" />
              <span
                className={`ml-3 overflow-hidden whitespace-nowrap transition-opacity ${
                  isCollapsed ? "md:w-0 md:opacity-0" : "opacity-100"
                }`}
                data-sidebar-collapsed-hide
              >
                환경설정
              </span>
            </span>
            <span
              className={`overflow-hidden whitespace-nowrap text-xs text-slate-400 transition-opacity duration-300 ${
                isCollapsed ? "md:w-0 md:opacity-0" : "opacity-100"
              }`}
              data-sidebar-collapsed-hide
            >
              {shouldShowSettings ? "⌃" : "⌄"}
            </span>
          </button>

          {shouldShowSettings && (
            <ul
              className={`mt-1 grid grid-cols-2 gap-1 sm:grid-cols-3 md:grid-cols-1 ${
                isCollapsed
                  ? "md:absolute md:left-[56px] md:top-0 md:z-30 md:w-40 md:rounded-lg md:bg-white md:p-2 md:shadow-xl"
                  : "md:border-l md:border-slate-100 md:pl-4"
              }`}
            >
              {settingMenus.map((menu) => {
                const isActive = pathname === menu.href;

                return (
                  <li key={menu.href}>
                    <Link
                      className={`flex h-9 items-center rounded-lg px-3 text-sm font-semibold transition-colors ${
                        isActive
                          ? getCategoryActiveClass(menu.activeKey)
                          : "text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                      }`}
                      href={menu.href}
                      title={menu.label}
                    >
                      <SidebarIcon name={menu.icon} />
                      <span className="ml-3">{menu.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </nav>
    </aside>
  );
}

function SidebarIcon({ name }: { name: IconName }) {
  const icons: Record<IconName, React.ReactNode> = {
    dashboard: (
      <path d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-5v-6h-4v6H5a1 1 0 0 1-1-1v-9.5Z" />
    ),
    scan: <path d="M4 7V4h3M17 4h3v3M20 17v3h-3M7 20H4v-3M8 8h8v8H8z" />,
    orders: <path d="M7 3h8l4 4v14H7zM15 3v5h4M10 12h6M10 16h6" />,
    production: <path d="M4 7h16M6 7v13h12V7M9 7V4h6v3M9 12h6M9 16h4" />,
    process: <path d="M5 5h6v6H5zM13 13h6v6h-6zM14 8h3v3M8 14v3h3" />,
    shipment: <path d="M3 7h11v9H3zM14 10h4l3 3v3h-7zM6 19a2 2 0 1 0 0-4 2 2 0 0 0 0 4ZM18 19a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" />,
    label: <path d="M4 6a2 2 0 0 1 2-2h8l6 6-8 8a2 2 0 0 1-3 0l-5-5a2 2 0 0 1 0-3zM8 8h.01" />,
    history: <path d="M4 12a8 8 0 1 0 3-6.24M4 4v5h5M12 8v5l4 2" />,
    qr: <path d="M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h2v2h-2zM18 14h2v6h-6v-2h4z" />,
    settings: <path d="M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8ZM4 12h2M18 12h2M12 4v2M12 18v2M6.3 6.3l1.4 1.4M16.3 16.3l1.4 1.4M17.7 6.3l-1.4 1.4M7.7 16.3l-1.4 1.4" />,
    user: <path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM4 21a8 8 0 0 1 16 0" />,
    lock: <path d="M6 10h12v11H6zM8 10V8a4 4 0 0 1 8 0v2M12 15v2" />,
  };

  return (
    <svg
      aria-hidden="true"
      className="size-5 shrink-0"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.8"
      viewBox="0 0 24 24"
    >
      {icons[name]}
    </svg>
  );
}
