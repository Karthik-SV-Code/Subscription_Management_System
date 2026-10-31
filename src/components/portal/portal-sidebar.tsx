"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Repeat,
  Layers,
  Receipt,
  CreditCard,
  Tag,
  User,
  HelpCircle,
  LogOut,
  Sparkles,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { PORTAL_CUSTOMER } from "@/features/portal/mock-data";

export interface PortalNavItemConfig {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  tooltip: string;
}

export const PORTAL_NAV_ITEMS: PortalNavItemConfig[] = [
  {
    title: "Overview",
    href: "/portal",
    icon: LayoutDashboard,
    tooltip: "My Account Dashboard",
  },
  {
    title: "My Subscriptions",
    href: "/portal/subscriptions",
    icon: Repeat,
    badge: "2",
    tooltip: "Manage Subscriptions",
  },
  {
    title: "Available Plans",
    href: "/portal/plans",
    icon: Layers,
    tooltip: "Browse & Upgrade Plans",
  },
  {
    title: "Billing & Invoices",
    href: "/portal/invoices",
    icon: Receipt,
    badge: "1 due",
    tooltip: "Invoices & Statements",
  },
  {
    title: "Payment History",
    href: "/portal/payments",
    icon: CreditCard,
    tooltip: "Transactions & Methods",
  },
  {
    title: "Discounts & Coupons",
    href: "/portal/discounts",
    icon: Tag,
    tooltip: "Active Deals & Promos",
  },
];

export interface PortalSidebarProps {
  isExpanded?: boolean;
  onToggleExpand?: () => void;
  onNavigateMobile?: () => void;
  className?: string;
}

export function PortalSidebar({
  isExpanded = false,
  onToggleExpand,
  onNavigateMobile,
  className,
}: PortalSidebarProps) {
  const pathname = usePathname();
  const [showLogoutConfirm, setShowLogoutConfirm] = React.useState(false);

  const handleLogout = () => {
    setShowLogoutConfirm(true);
  };

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
            href="/portal"
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
                  Customer Portal
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
          {PORTAL_NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive =
              pathname === item.href ||
              (item.href !== "/portal" && pathname.startsWith(item.href));

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
                            : "bg-indigo-100 text-indigo-700"
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

      {/* Sidebar Bottom: Profile, Help, Logout & Shrink/Expand Toggle */}
      <div className="w-full space-y-2 flex flex-col items-center">
        {/* Help & Support Button */}
        {(() => {
          const isHelpActive = pathname === "/portal/support";
          return (
            <Link
              href="/portal/support"
              onClick={onNavigateMobile}
              className={cn(
                "group relative flex items-center gap-3 w-full p-1 rounded-2xl transition-all",
                isExpanded ? "justify-start px-2 hover:bg-slate-100/70" : "justify-center"
              )}
            >
              <div
                className={cn(
                  "w-11 h-11 rounded-full flex items-center justify-center transition-all shrink-0",
                  isHelpActive
                    ? "bg-[#171717] text-white shadow-md ring-2 ring-black/5"
                    : "bg-[#F1F3F5] text-[#555] hover:bg-[#E5E7EB] hover:text-[#111]"
                )}
              >
                <HelpCircle className="w-5 h-5" />
              </div>

              {isExpanded && (
                <span
                  className={cn(
                    "text-xs font-semibold truncate",
                    isHelpActive ? "text-[#171717]" : "text-[#737373] group-hover:text-[#171717]"
                  )}
                >
                  Help & Support
                </span>
              )}

              {!isExpanded && (
                <div className="absolute left-full ml-3 px-2.5 py-1 bg-[#171717] text-white text-[11px] font-medium rounded-lg shadow-xl opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 whitespace-nowrap">
                  Help & Support
                </div>
              )}
            </Link>
          );
        })()}

        {/* My Profile Button */}
        {(() => {
          const isProfileActive = pathname === "/portal/profile";
          return (
            <Link
              href="/portal/profile"
              onClick={onNavigateMobile}
              className={cn(
                "group relative flex items-center gap-3 w-full p-1 rounded-2xl transition-all",
                isExpanded ? "justify-start px-2 hover:bg-slate-100/70" : "justify-center"
              )}
            >
              <div
                className={cn(
                  "w-11 h-11 rounded-full flex items-center justify-center transition-all shrink-0",
                  isProfileActive
                    ? "bg-[#171717] text-white shadow-md ring-2 ring-black/5"
                    : "bg-[#F1F3F5] text-[#555] hover:bg-[#E5E7EB] hover:text-[#111]"
                )}
              >
                <User className="w-5 h-5" />
              </div>

              {isExpanded && (
                <span
                  className={cn(
                    "text-xs font-semibold truncate",
                    isProfileActive ? "text-[#171717]" : "text-[#737373] group-hover:text-[#171717]"
                  )}
                >
                  My Profile
                </span>
              )}

              {!isExpanded && (
                <div className="absolute left-full ml-3 px-2.5 py-1 bg-[#171717] text-white text-[11px] font-medium rounded-lg shadow-xl opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 whitespace-nowrap">
                  My Profile
                </div>
              )}
            </Link>
          );
        })()}

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className={cn(
            "group relative flex items-center gap-3 w-full p-1 rounded-2xl transition-all",
            isExpanded ? "justify-start px-2 hover:bg-rose-50" : "justify-center"
          )}
        >
          <div className="w-11 h-11 rounded-full bg-[#F1F3F5] text-rose-600 hover:bg-rose-100 flex items-center justify-center transition-all shrink-0">
            <LogOut className="w-5 h-5" />
          </div>

          {isExpanded && (
            <span className="text-xs font-semibold text-rose-600 truncate">
              Logout
            </span>
          )}

          {!isExpanded && (
            <div className="absolute left-full ml-3 px-2.5 py-1 bg-[#171717] text-white text-[11px] font-medium rounded-lg shadow-xl opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 whitespace-nowrap">
              Logout
            </div>
          )}
        </button>

        {/* Customer Profile Avatar Circle */}
        <Link
          href="/portal/profile"
          onClick={onNavigateMobile}
          className={cn(
            "group relative flex items-center gap-3 w-full p-1 rounded-2xl transition-all pt-2 border-t border-[#EAECEF]",
            isExpanded ? "justify-start px-2 hover:bg-slate-50" : "justify-center"
          )}
        >
          <div className="w-11 h-11 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-sm ring-2 ring-indigo-100">
            {PORTAL_CUSTOMER.avatarInitials}
          </div>
          {isExpanded && (
            <div className="min-w-0 flex-1 animate-in fade-in duration-150">
              <div className="text-xs font-bold text-[#171717] truncate">
                {PORTAL_CUSTOMER.name}
              </div>
              <div className="text-[10px] text-[#737373] truncate">
                {PORTAL_CUSTOMER.email}
              </div>
            </div>
          )}
          {!isExpanded && (
            <div className="absolute left-full ml-3 px-2.5 py-1 bg-[#171717] text-white text-[11px] font-medium rounded-lg shadow-xl opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 whitespace-nowrap">
              {PORTAL_CUSTOMER.name} ({PORTAL_CUSTOMER.email})
            </div>
          )}
        </Link>

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

      {/* Logout Notification Toast/Banner Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-[20px] p-6 max-w-sm w-full border border-[#EAECEF] shadow-2xl animate-in zoom-in-95 duration-150">
            <h3 className="text-base font-bold text-[#171717] mb-2">Logout Customer Session</h3>
            <p className="text-xs text-[#737373] mb-6">
              You are currently logged into the Customer Portal as <strong>{PORTAL_CUSTOMER.name}</strong> ({PORTAL_CUSTOMER.companyName}). Are you sure you want to log out?
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-[#737373] hover:bg-slate-100 transition-colors"
              >
                Cancel
              </button>
              <Link
                href="/login"
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#171717] text-white hover:bg-black transition-colors"
              >
                Sign Out
              </Link>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}

