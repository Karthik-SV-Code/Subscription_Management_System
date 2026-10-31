"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Package,
  Layers,
  Repeat,
  Receipt,
  CreditCard,
  BarChart3,
  Settings,
  Sparkles,
  ShieldCheck,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { MAIN_NAV_ITEMS } from "@/lib/constants";

// Icon mapping helper
const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  LayoutDashboard,
  Users,
  Package,
  Layers,
  Repeat,
  Receipt,
  CreditCard,
  BarChart3,
  Settings,
};

export interface SidebarProps {
  className?: string;
  onNavigate?: () => void;
}

export function Sidebar({ className, onNavigate }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "flex h-screen w-64 flex-col bg-white text-slate-900 border-r border-slate-200/80 shadow-[1px_0_3px_rgba(0,0,0,0.02)] select-none",
        className
      )}
    >
      {/* Brand Header */}
      <div className="flex h-16 items-center px-6 border-b border-slate-100 gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-indigo-700 text-white font-bold shadow-md shadow-indigo-500/20">
          <Sparkles className="h-5 w-5" />
        </div>
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span className="text-base font-bold tracking-tight text-slate-900">
              SubscriptIQ
            </span>
            <span className="inline-block h-2 w-2 rounded-full bg-emerald-500 ring-2 ring-emerald-100" />
          </div>
          <span className="text-[11px] font-medium tracking-wide text-slate-400">
            Subscription Platform
          </span>
        </div>
      </div>

      {/* Main Navigation */}
      <div className="flex-1 overflow-y-auto px-4 py-5 space-y-1.5">
        <div className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
          Main Navigation
        </div>
        {MAIN_NAV_ITEMS.map((item) => {
          const Icon = ICON_MAP[item.icon] || LayoutDashboard;
          const isActive =
            pathname === item.href ||
            (item.href === "/dashboard" && (pathname === "/" || pathname === "")) ||
            (item.href !== "/dashboard" && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                "group flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all duration-150",
                isActive
                  ? "bg-indigo-600 text-white shadow-sm shadow-indigo-500/25 font-semibold"
                  : "text-slate-600 hover:bg-slate-100/80 hover:text-slate-900"
              )}
            >
              <Icon
                className={cn(
                  "h-4 w-4 shrink-0 transition-colors",
                  isActive
                    ? "text-white"
                    : "text-slate-400 group-hover:text-slate-700"
                )}
              />
              <span className="flex-1 truncate">{item.title}</span>
              {item.badge && (
                <span
                  className={cn(
                    "rounded-full px-2 py-0.5 text-[10px] font-semibold transition-colors",
                    isActive
                      ? "bg-white/20 text-white"
                      : "bg-slate-100 text-slate-600 group-hover:bg-slate-200"
                  )}
                >
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </div>

      {/* Footer / Workspace Tier */}
      <div className="p-4 border-t border-slate-100 bg-slate-50/50">
        <div className="flex items-center gap-3 rounded-xl bg-white p-3 border border-slate-200/80 shadow-2xs">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100 shrink-0">
            <ShieldCheck className="h-4 w-4" />
          </div>
          <div className="flex flex-col text-xs min-w-0 flex-1">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-800 truncate">
                SubscriptIQ Enterprise
              </span>
            </div>
            <span className="text-[11px] text-slate-400 truncate">
              Production · Live Sync
            </span>
          </div>
          <ChevronRight className="h-3.5 w-3.5 text-slate-400 shrink-0" />
        </div>
      </div>
    </aside>
  );
}
