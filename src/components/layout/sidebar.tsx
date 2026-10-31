"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutGrid,
  Users,
  Package,
  Layers,
  Repeat,
  ClipboardList,
  CreditCard,
  BadgeDollarSign,
  Settings,
  Zap,
  PanelLeftClose,
  PanelLeftOpen,
  ShieldCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { MAIN_NAV_ITEMS } from "@/lib/constants";

// Icon mapping aligned to reference circular dock
const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  LayoutDashboard: LayoutGrid,
  Users: Users,
  Package: Package,
  Layers: Layers,
  Repeat: Repeat,
  Receipt: ClipboardList,
  CreditCard: CreditCard,
  Tag: BadgeDollarSign,
  Settings: Settings,
};

export interface SidebarProps {
  className?: string;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  onNavigate?: () => void;
}

export function Sidebar({
  className,
  isCollapsed = true,
  onToggleCollapse,
  onNavigate,
}: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "flex h-screen flex-col justify-between bg-white border-r border-[#EAECEF] shadow-sm py-4 transition-all duration-300 select-none",
        isCollapsed ? "w-20" : "w-64",
        className
      )}
    >
      <div className="flex flex-col items-center w-full">
        {/* Brand Logo Header */}
        <div
          className={cn(
            "flex items-center h-14 w-full px-4 mb-2 cursor-pointer",
            isCollapsed ? "justify-center" : "justify-start px-6 gap-3"
          )}
          onClick={onToggleCollapse}
          title={isCollapsed ? "Click to expand" : "Click to shrink"}
        >
          <div className="w-11 h-11 rounded-full bg-[#171717] text-white flex items-center justify-center font-bold shadow-md ring-2 ring-black/5 shrink-0">
            <Zap className="h-5 w-5 text-indigo-400" />
          </div>
          {!isCollapsed && (
            <div className="min-w-0 flex flex-col">
              <span className="text-sm font-bold tracking-tight text-[#171717] leading-none truncate">
                SubscriptIQ
              </span>
              <span className="text-[10px] text-[#737373] font-medium tracking-wide mt-0.5">
                Revenue Engine
              </span>
            </div>
          )}
        </div>

        {/* Navigation Items (Circular Icon Dock) */}
        <nav
          className={cn(
            "w-full px-2.5 space-y-2 mt-2 flex flex-col",
            isCollapsed ? "items-center" : "items-stretch px-4"
          )}
        >
          {MAIN_NAV_ITEMS.map((item) => {
            const Icon = ICON_MAP[item.icon] || LayoutGrid;
            const isActive =
              pathname === item.href ||
              (item.href !== "/dashboard" && pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onNavigate}
                className={cn(
                  "group relative flex items-center gap-3 p-1 rounded-2xl transition-all",
                  isCollapsed ? "justify-center w-full" : "w-full px-2.5 py-1.5"
                )}
              >
                {/* Circular Icon Container matching reference image */}
                <div
                  className={cn(
                    "w-11 h-11 rounded-full flex items-center justify-center transition-all shrink-0",
                    isActive
                      ? "bg-[#171717] text-white shadow-md ring-2 ring-black/5"
                      : "bg-[#F1F3F5] text-[#555] hover:bg-[#E5E7EB] hover:text-[#111]"
                  )}
                >
                  <Icon className="h-5 w-5" />
                </div>

                {!isCollapsed && (
                  <span
                    className={cn(
                      "text-xs font-semibold truncate transition-colors",
                      isActive ? "text-[#171717]" : "text-[#737373] group-hover:text-[#171717]"
                    )}
                  >
                    {item.title}
                  </span>
                )}

                {/* Floating Tooltip when shrunk */}
                {isCollapsed && (
                  <div className="absolute left-full ml-3 px-2.5 py-1 bg-[#171717] text-white text-[11px] font-medium rounded-lg shadow-xl opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 whitespace-nowrap">
                    {item.title}
                  </div>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Sidebar Footer: Settings, Profile & Shrink Toggle */}
      <div
        className={cn(
          "w-full px-2.5 space-y-2 flex flex-col",
          isCollapsed ? "items-center" : "items-stretch px-4 border-t border-[#EAECEF] pt-4"
        )}
      >
        {/* Settings Circular Item */}
        <Link
          href="/settings"
          onClick={onNavigate}
          className={cn(
            "group relative flex items-center gap-3 p-1 rounded-2xl transition-all",
            isCollapsed ? "justify-center w-full" : "w-full px-2.5 py-1.5"
          )}
        >
          <div
            className={cn(
              "w-11 h-11 rounded-full flex items-center justify-center transition-all shrink-0",
              pathname === "/settings"
                ? "bg-[#171717] text-white shadow-md ring-2 ring-black/5"
                : "bg-[#F1F3F5] text-[#555] hover:bg-[#E5E7EB] hover:text-[#111]"
            )}
          >
            <Settings className="h-5 w-5" />
          </div>
          {!isCollapsed && (
            <span className="text-xs font-semibold text-[#737373] group-hover:text-[#171717] truncate">
              Settings
            </span>
          )}
          {isCollapsed && (
            <div className="absolute left-full ml-3 px-2.5 py-1 bg-[#171717] text-white text-[11px] font-medium rounded-lg shadow-xl opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 whitespace-nowrap">
              Settings
            </div>
          )}
        </Link>

        {/* User Profile Avatar */}
        <div
          className={cn(
            "group relative flex items-center gap-3 p-1 rounded-2xl transition-all",
            isCollapsed ? "justify-center w-full" : "p-2 rounded-xl bg-slate-50 border border-[#EAECEF]"
          )}
        >
          <div className="w-11 h-11 rounded-full bg-slate-100 border border-[#EAECEF] text-[#171717] font-bold text-xs flex items-center justify-center shrink-0">
            AD
          </div>
          {!isCollapsed && (
            <div className="min-w-0 flex-1">
              <div className="text-xs font-bold text-[#171717] truncate">
                Enterprise Admin
              </div>
              <div className="text-[10px] text-[#737373] truncate">
                admin@subscriptiq.io
              </div>
            </div>
          )}
          {isCollapsed && (
            <div className="absolute left-full ml-3 px-2.5 py-1 bg-[#171717] text-white text-[11px] font-medium rounded-lg shadow-xl opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 whitespace-nowrap">
              Enterprise Admin
            </div>
          )}
        </div>

        {/* Shrink / Expand Toggle Control Button */}
        {onToggleCollapse && (
          <button
            onClick={onToggleCollapse}
            className="group relative flex items-center justify-center w-11 h-11 rounded-full bg-slate-50 hover:bg-slate-200/80 text-[#737373] hover:text-[#171717] border border-[#EAECEF] transition-all self-center mt-1"
            title={isCollapsed ? "Expand Sidebar" : "Shrink Sidebar"}
          >
            {isCollapsed ? (
              <PanelLeftOpen className="w-4 h-4" />
            ) : (
              <PanelLeftClose className="w-4 h-4" />
            )}
            <div className="absolute left-full ml-3 px-2.5 py-1 bg-[#171717] text-white text-[11px] font-medium rounded-lg shadow-xl opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 whitespace-nowrap">
              {isCollapsed ? "Expand Sidebar" : "Shrink Sidebar"}
            </div>
          </button>
        )}
      </div>
    </aside>
  );
}
