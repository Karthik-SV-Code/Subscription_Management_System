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
  Tag,
  Settings,
  Zap,
  ShieldCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { MAIN_NAV_ITEMS } from "@/lib/constants";

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  LayoutDashboard,
  Users,
  Package,
  Layers,
  Repeat,
  Receipt,
  CreditCard,
  Tag,
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
        "flex h-screen w-64 flex-col justify-between bg-white border-r border-[#EAECEF] shadow-sm",
        className
      )}
    >
      <div>
        {/* Brand Logo Header */}
        <div className="flex h-20 items-center px-6 border-b border-[#EAECEF] gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#171717] text-white font-bold shadow-md">
            <Zap className="h-5 w-5 text-indigo-400" />
          </div>
          <div className="flex flex-col">
            <span className="text-base font-bold tracking-tight text-[#171717] leading-none">
              SubscriptIQ
            </span>
            <span className="text-[11px] text-[#737373] font-medium tracking-wide mt-0.5">
              Revenue Engine
            </span>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="p-4 space-y-1.5">
          <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-[#737373]">
            Platform Menu
          </div>
          {MAIN_NAV_ITEMS.map((item) => {
            const Icon = ICON_MAP[item.icon] || LayoutDashboard;
            const isActive =
              pathname === item.href ||
              (item.href !== "/dashboard" && pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onNavigate}
                className={cn(
                  "group flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-150",
                  isActive
                    ? "bg-[#171717] text-white shadow-md shadow-black/10"
                    : "text-[#737373] hover:text-[#171717] hover:bg-slate-100/70"
                )}
              >
                <Icon
                  className={cn(
                    "h-4 w-4 shrink-0 transition-colors",
                    isActive ? "text-white" : "text-[#737373] group-hover:text-[#171717]"
                  )}
                />
                <span className="flex-1 truncate">{item.title}</span>
                {item.title === "Subscriptions" && (
                  <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer / User Profile & Status */}
      <div className="p-4 border-t border-[#EAECEF] space-y-2">
        <div className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-50 border border-[#EAECEF]">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#171717] text-white text-xs font-bold shrink-0">
            AD
          </div>
          <div className="flex flex-col min-w-0 flex-1">
            <span className="font-semibold text-xs text-[#171717] truncate">
              Enterprise Admin
            </span>
            <span className="text-[10px] text-[#737373] truncate">
              admin@subscriptiq.io
            </span>
          </div>
          <ShieldCheck className="h-4 w-4 text-emerald-500 shrink-0" />
        </div>
      </div>
    </aside>
  );
}
