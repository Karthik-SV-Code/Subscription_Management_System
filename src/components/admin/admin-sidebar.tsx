"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  UserCog,
  Users,
  Repeat,
  Layers,
  Receipt,
  CreditCard,
  BarChart3,
  Settings,
  Sparkles,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface NavItemConfig {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  tooltip: string;
}

export const ADMIN_NAV_ITEMS: NavItemConfig[] = [
  {
    title: "Admin Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
    tooltip: "Admin Dashboard Overview",
  },
  {
    title: "User Management",
    href: "/admin/users",
    icon: UserCog,
    badge: "7",
    tooltip: "Admin Users & Permissions",
  },
  {
    title: "Customer Overview",
    href: "/admin/customers",
    icon: Users,
    tooltip: "Customer Lifecycle Accounts",
  },
  {
    title: "Subscription Overview",
    href: "/admin/subscriptions",
    icon: Repeat,
    badge: "1.2k",
    tooltip: "Active Subscriber Contracts",
  },
  {
    title: "Product & Plan Overview",
    href: "/admin/products",
    icon: Layers,
    tooltip: "Catalog & Pricing Tiers",
  },
  {
    title: "Invoice Overview",
    href: "/admin/invoices",
    icon: Receipt,
    tooltip: "Billing & Receivables",
  },
  {
    title: "Payment Overview",
    href: "/admin/payments",
    icon: CreditCard,
    tooltip: "Transactions & Gateway Logs",
  },
  {
    title: "Analytics",
    href: "/admin/analytics",
    icon: BarChart3,
    tooltip: "MRR & Retention Analytics",
  },
];

export interface AdminSidebarProps {
  isExpanded?: boolean;
  onToggleExpand?: () => void;
  onNavigateMobile?: () => void;
  className?: string;
}

export function AdminSidebar({
  isExpanded = false,
  onToggleExpand,
  onNavigateMobile,
  className,
}: AdminSidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-40 bg-white border-r border-[#EAECEF] flex flex-col justify-between shadow-[0_2px_10px_rgba(0,0,0,0.03)] transition-all duration-200 select-none py-4",
        isExpanded ? "w-64 px-3" : "w-20 px-2",
        className
      )}
    >
      <div className="flex flex-col items-center w-full">
        {/* Brand Header */}
        <div
          className={cn(
            "h-14 flex items-center w-full mb-3",
            isExpanded ? "px-3 justify-between" : "justify-center"
          )}
        >
          <Link
            href="/admin"
            onClick={onNavigateMobile}
            className="flex items-center gap-3 group"
          >
            <div className="w-11 h-11 rounded-full bg-[#171717] text-white flex items-center justify-center font-bold shadow-md ring-2 ring-black/5 shrink-0 group-hover:scale-105 transition-transform">
              <Sparkles className="w-5 h-5 text-indigo-400" />
            </div>
            {isExpanded && (
              <div className="flex flex-col min-w-0 animate-in fade-in duration-150">
                <span className="text-sm font-extrabold text-[#171717] tracking-tight truncate">
                  SubscriptIQ
                </span>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-indigo-600">
                  Admin Portal
                </span>
              </div>
            )}
          </Link>

          {isExpanded && onToggleExpand && (
            <button
              onClick={onToggleExpand}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              title="Collapse sidebar"
            >
              <PanelLeftClose className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Navigation Items with Circular Icon Buttons */}
        <nav className="w-full space-y-2 flex flex-col items-center">
          {ADMIN_NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive =
              pathname === item.href ||
              (item.href === "/admin" && (pathname === "/admin" || pathname === "/admin/dashboard")) ||
              (item.href !== "/admin" && pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onNavigateMobile}
                className={cn(
                  "group relative flex items-center gap-3 w-full p-1 rounded-2xl transition-all",
                  isExpanded ? "justify-start px-2 hover:bg-slate-100/70" : "justify-center"
                )}
              >
                {/* Circular Icon Button */}
                <div
                  className={cn(
                    "w-11 h-11 rounded-full flex items-center justify-center transition-all shrink-0",
                    isActive
                      ? "bg-[#171717] text-white shadow-md ring-2 ring-black/5"
                      : "bg-[#F1F3F5] text-[#555] hover:bg-[#E5E7EB] hover:text-[#111]"
                  )}
                >
                  <Icon className="w-5 h-5" />
                </div>

                {/* Expanded Label */}
                {isExpanded && (
                  <div className="flex-1 flex items-center justify-between min-w-0 pr-1 animate-in fade-in duration-150">
                    <span
                      className={cn(
                        "text-xs font-semibold truncate",
                        isActive ? "text-[#171717]" : "text-[#737373] group-hover:text-[#171717]"
                      )}
                    >
                      {item.title}
                    </span>
                    {item.badge && (
                      <span
                        className={cn(
                          "px-2 py-0.5 text-[10px] font-bold rounded-full",
                          isActive
                            ? "bg-slate-800 text-white"
                            : "bg-slate-200 text-slate-700"
                        )}
                      >
                        {item.badge}
                      </span>
                    )}
                  </div>
                )}

                {/* Floating Tooltip in Slim Mode */}
                {!isExpanded && (
                  <div className="absolute left-full ml-3 px-2.5 py-1 bg-[#171717] text-white text-[11px] font-medium rounded-lg shadow-xl opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 whitespace-nowrap">
                    {item.tooltip}
                  </div>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Sidebar Bottom: Settings, Profile & Shrink/Expand Toggle */}
      <div className="w-full space-y-2 flex flex-col items-center">
        {/* Settings Circular Button */}
        {(() => {
          const isSettingsActive = pathname === "/admin/settings" || pathname.startsWith("/admin/settings");
          return (
            <Link
              href="/admin/settings"
              onClick={onNavigateMobile}
              className={cn(
                "group relative flex items-center gap-3 w-full p-1 rounded-2xl transition-all",
                isExpanded ? "justify-start px-2 hover:bg-slate-100/70" : "justify-center"
              )}
            >
              <div
                className={cn(
                  "w-11 h-11 rounded-full flex items-center justify-center transition-all shrink-0",
                  isSettingsActive
                    ? "bg-[#171717] text-white shadow-md ring-2 ring-black/5"
                    : "bg-[#F1F3F5] text-[#555] hover:bg-[#E5E7EB] hover:text-[#111]"
                )}
              >
                <Settings className="w-5 h-5" />
              </div>

              {isExpanded && (
                <span
                  className={cn(
                    "text-xs font-semibold truncate",
                    isSettingsActive ? "text-[#171717]" : "text-[#737373] group-hover:text-[#171717]"
                  )}
                >
                  Settings
                </span>
              )}

              {!isExpanded && (
                <div className="absolute left-full ml-3 px-2.5 py-1 bg-[#171717] text-white text-[11px] font-medium rounded-lg shadow-xl opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 whitespace-nowrap">
                  Admin Settings
                </div>
              )}
            </Link>
          );
        })()}

        {/* User Profile Avatar Circle */}
        <div
          className={cn(
            "group relative flex items-center gap-3 w-full p-1 rounded-2xl transition-all cursor-pointer",
            isExpanded ? "justify-start px-2" : "justify-center"
          )}
        >
          <div className="w-11 h-11 rounded-full bg-slate-100 border border-[#EAECEF] text-[#171717] font-bold text-xs flex items-center justify-center shrink-0 shadow-2xs">
            AD
          </div>
          {isExpanded && (
            <div className="min-w-0 flex-1 animate-in fade-in duration-150">
              <div className="text-xs font-bold text-[#171717] truncate">
                Super Admin
              </div>
              <div className="text-[10px] text-[#737373] truncate">
                admin@subscriptiq.io
              </div>
            </div>
          )}
          {!isExpanded && (
            <div className="absolute left-full ml-3 px-2.5 py-1 bg-[#171717] text-white text-[11px] font-medium rounded-lg shadow-xl opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 whitespace-nowrap">
              Super Admin (admin@subscriptiq.io)
            </div>
          )}
        </div>

        {/* Expand / Shrink Toggle Button */}
        {onToggleExpand && (
          <button
            onClick={onToggleExpand}
            className="flex items-center justify-center w-11 h-11 rounded-full bg-slate-50 hover:bg-slate-200/80 text-[#737373] hover:text-[#171717] border border-[#EAECEF] transition-all mt-1"
            title={isExpanded ? "Collapse Sidebar" : "Expand Sidebar"}
          >
            {isExpanded ? (
              <PanelLeftClose className="w-4 h-4" />
            ) : (
              <PanelLeftOpen className="w-4 h-4" />
            )}
          </button>
        )}
      </div>
    </aside>
  );
}

