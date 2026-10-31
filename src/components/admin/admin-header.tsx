"use client";

import * as React from "react";
import Link from "next/link";
import { Search, Calendar, Bell, Download, ExternalLink, Menu, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface AdminHeaderProps {
  title?: string;
  subtitle?: string;
  searchQuery?: string;
  onSearchChange?: (val: string) => void;
  searchPlaceholder?: string;
  onExportCSV?: () => void;
  exportLoading?: boolean;
  onToggleMobileSidebar?: () => void;
}

export function AdminHeader({
  title = "Admin Dashboard",
  subtitle = "Executive telemetry, platform metrics & customer administration",
  searchQuery = "",
  onSearchChange,
  searchPlaceholder = "Search records...",
  onExportCSV,
  exportLoading = false,
  onToggleMobileSidebar,
}: AdminHeaderProps) {
  const [showNotificationToast, setShowNotificationToast] = React.useState(false);
  const [currentDateFormatted, setCurrentDateFormatted] = React.useState("Oct 31, 2026");

  React.useEffect(() => {
    try {
      const now = new Date();
      setCurrentDateFormatted(
        now.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        })
      );
    } catch {
      // Fallback is already set
    }
  }, []);

  return (
    <>
      <header className="sticky top-0 z-20 h-20 bg-white/90 backdrop-blur border-b border-[#EAECEF] px-4 sm:px-8 flex items-center justify-between">
        {/* Left: Mobile trigger & Page Titles */}
        <div className="flex items-center gap-3 sm:gap-4 min-w-0">
          {onToggleMobileSidebar && (
            <button
              onClick={onToggleMobileSidebar}
              className="p-2 rounded-xl text-[#737373] hover:text-[#171717] hover:bg-slate-100 md:hidden shrink-0 transition-colors"
              aria-label="Toggle navigation menu"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}

          <div className="min-w-0">
            <h1 className="text-lg sm:text-xl font-bold tracking-tight text-[#171717] truncate">
              {title}
            </h1>
            <p className="text-xs text-[#737373] hidden sm:block truncate">
              {subtitle}
            </p>
          </div>
        </div>

        {/* Right: Search, Date, Notification, Export, Portal Switcher */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Global Search Bar */}
          <div className="relative w-36 sm:w-64 md:w-72">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#737373] pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange?.(e.target.value)}
              placeholder={searchPlaceholder}
              className="w-full bg-[#F5F6F8] border border-[#EAECEF] rounded-[12px] pl-10 pr-3 py-2 text-xs text-[#171717] placeholder:text-[#737373] focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
            />
          </div>

          {/* Current Date Badge */}
          <div className="hidden lg:flex items-center gap-1.5 px-3 py-2 rounded-[12px] bg-[#F5F6F8] border border-[#EAECEF] text-xs font-medium text-[#737373] select-none">
            <Calendar className="w-3.5 h-3.5 text-slate-500" />
            <span>{currentDateFormatted}</span>
          </div>

          {/* Notification Bell */}
          <button
            onClick={() => setShowNotificationToast((prev) => !prev)}
            className="relative p-2.5 rounded-[12px] hover:bg-slate-100 text-[#737373] hover:text-[#171717] transition-colors"
            title="System Notifications"
            aria-label="System Notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-indigo-600 ring-2 ring-white"></span>
          </button>

          {/* CSV Export Action Button */}
          {onExportCSV && (
            <Button
              variant="outline"
              size="sm"
              onClick={onExportCSV}
              disabled={exportLoading}
              className="hidden sm:inline-flex items-center gap-1.5 h-9 rounded-[12px] border-[#EAECEF] bg-white hover:bg-slate-50 text-xs font-semibold text-[#171717] shadow-sm px-3"
            >
              <Download className="w-3.5 h-3.5 text-[#737373]" />
              <span>{exportLoading ? "Exporting..." : "Export CSV"}</span>
            </Button>
          )}

          {/* Link to Customer View */}
          <Link
            href="/portal"
            className="hidden xl:inline-flex items-center gap-1.5 px-3 py-2 rounded-[12px] bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold border border-indigo-200 transition-all"
            title="Switch to Customer Facing Portal"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Customer Portal</span>
          </Link>
        </div>
      </header>

      {/* Dismissible Notification Banner */}
      {showNotificationToast && (
        <div className="mx-4 sm:mx-8 mt-3 p-3.5 rounded-[16px] bg-white border border-[#EAECEF] shadow-[0_2px_10px_rgba(0,0,0,0.03)] flex items-center justify-between text-xs animate-in fade-in slide-in-from-top-1 duration-200">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="text-[#171717] font-medium">
              System health: 100% operational. All Stripe & ACH webhook listeners active. Next scheduled renewal sweep in 6 hours.
            </span>
          </div>
          <button
            onClick={() => setShowNotificationToast(false)}
            className="text-xs text-[#737373] hover:text-[#171717] font-semibold ml-4 px-2 py-1 rounded-md hover:bg-slate-100"
          >
            Dismiss
          </button>
        </div>
      )}
    </>
  );
}

