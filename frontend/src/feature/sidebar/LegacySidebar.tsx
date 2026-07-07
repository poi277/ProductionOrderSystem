"use client";

import { useState } from "react";

type MenuItem = {
  label: string;
  icon: string;
  active?: boolean;
  children?: string[];
};

const mainMenus: MenuItem[] = [
  { label: "대시보드", icon: "⌂" },
  {
    label: "주문관리",
    icon: "□",
    active: true,
    children: ["주문확인", "발주서", "생산지시", "납품출하"],
  },
  { label: "스캔관리", icon: "⌗", children: ["스캔", "이력", "QR조회"] },
  { label: "제품/공정", icon: "▦", children: ["제품관리", "공정관리", "라벨"] },
  { label: "기준정보", icon: "◎", children: ["작업자", "설비", "거래처"] },
];

const settingMenus: MenuItem[] = [
  { label: "환경설정", icon: "⚙", children: ["사용자 관리", "권한 설정"] },
];

export default function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [openedMenu, setOpenedMenu] = useState("주문관리");

  return (
    <aside
      className={`relative flex min-h-screen shrink-0 flex-col border-r border-slate-200 bg-white px-5 py-5 shadow-sm transition-all duration-300 ${
        isCollapsed ? "w-[70px]" : "w-[220px]"
      }`}
    >
        <button
          aria-label={isCollapsed ? "사이드바 펼치기" : "사이드바 접기"}
          className="absolute -right-3 top-8 flex size-7 items-center justify-center rounded-full bg-white text-sm font-bold text-slate-700 shadow-md"
          onClick={() => setIsCollapsed((value) => !value)}
          type="button"
        >
          {isCollapsed ? "›" : "‹"}
        </button>

        <div className={`flex items-center gap-3 ${isCollapsed ? "justify-center" : ""}`}>
          <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-rose-100 text-sm font-bold text-rose-700">
            관
          </div>
          {!isCollapsed && (
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
                Production Manager
              </p>
              <p className="truncate text-sm font-bold text-slate-950">관리자</p>
            </div>
          )}
        </div>

        <div className="my-6 h-px bg-slate-100" />

        <nav className="flex flex-1 flex-col">
          <MenuSection
            isCollapsed={isCollapsed}
            items={mainMenus}
            openedMenu={openedMenu}
            setOpenedMenu={setOpenedMenu}
            title="MAIN"
          />
          <div className="my-4 h-px bg-slate-100" />
          <MenuSection
            isCollapsed={isCollapsed}
            items={settingMenus}
            openedMenu={openedMenu}
            setOpenedMenu={setOpenedMenu}
            title="SETTINGS"
          />
        </nav>

        <div className="mt-auto flex flex-col gap-3">
          <FooterButton icon="?" isCollapsed={isCollapsed} label="도움말" />
          <FooterButton icon="↪" isCollapsed={isCollapsed} label="로그아웃" danger />
        </div>
    </aside>
  );
}

function MenuSection({
  title,
  items,
  isCollapsed,
  openedMenu,
  setOpenedMenu,
}: {
  title: string;
  items: MenuItem[];
  isCollapsed: boolean;
  openedMenu: string;
  setOpenedMenu: (label: string) => void;
}) {
  return (
    <section>
      <h2
        className={`mb-3 text-[10px] font-bold tracking-wider text-slate-400 ${
          isCollapsed ? "text-center" : ""
        }`}
      >
        {title}
      </h2>
      <ul className="flex flex-col gap-1">
        {items.map((item) => {
          const isOpen = openedMenu === item.label;

          return (
            <li className="group relative" key={item.label}>
              <button
                className={`flex h-10 w-full items-center rounded-lg text-sm font-semibold transition-colors ${
                  isCollapsed ? "justify-center px-0" : "justify-between px-3"
                } ${item.active ? "bg-slate-100 text-slate-950" : "text-slate-500 hover:bg-slate-50"}`}
                onClick={() => item.children && setOpenedMenu(isOpen ? "" : item.label)}
                type="button"
              >
                <span className="flex items-center gap-3">
                  <span className="flex size-5 items-center justify-center text-base">
                    {item.icon}
                  </span>
                  {!isCollapsed && <span>{item.label}</span>}
                </span>
                {!isCollapsed && item.children && (
                  <span className="text-xs text-slate-400">{isOpen ? "⌃" : "⌄"}</span>
                )}
              </button>

              {!isCollapsed && item.children && isOpen && (
                <ul className="ml-8 mt-1 flex flex-col border-l border-slate-100 py-1">
                  {item.children.map((child) => (
                    <li key={child}>
                      <button
                        className={`w-full rounded-md px-3 py-2 text-left text-xs font-semibold ${
                          child === "주문확인"
                            ? "bg-slate-100 text-slate-950"
                            : "text-slate-400 hover:text-slate-700"
                        }`}
                        type="button"
                      >
                        {child}
                      </button>
                    </li>
                  ))}
                </ul>
              )}

              {isCollapsed && !item.children && (
                <div className="pointer-events-none absolute left-[52px] top-0 z-20 hidden min-w-32 rounded-lg bg-black px-3 py-2 text-xs font-semibold text-white shadow-xl group-hover:block">
                  {item.label}
                </div>
              )}

              {isCollapsed && item.children && (
                <div className="absolute left-[56px] top-0 z-30 hidden w-36 rounded-lg bg-white p-2 text-xs font-semibold text-slate-500 shadow-xl group-hover:block">
                  {item.children.map((child) => (
                    <button
                      className={`block w-full rounded-md px-3 py-2 text-left ${
                        child === "주문확인"
                          ? "bg-slate-100 text-slate-950"
                          : "hover:bg-slate-50"
                      }`}
                      key={child}
                      type="button"
                    >
                      {child}
                    </button>
                  ))}
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}

function FooterButton({
  icon,
  label,
  isCollapsed,
  danger = false,
}: {
  icon: string;
  label: string;
  isCollapsed: boolean;
  danger?: boolean;
}) {
  return (
    <button
      className={`flex h-9 items-center gap-3 rounded-lg text-sm font-semibold ${
        isCollapsed ? "justify-center px-0" : "px-3"
      } ${danger ? "text-rose-500" : "text-slate-500 hover:bg-slate-50"}`}
      type="button"
    >
      <span className="flex size-5 items-center justify-center">{icon}</span>
      {!isCollapsed && <span>{label}</span>}
    </button>
  );
}
