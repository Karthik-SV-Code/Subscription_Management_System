"use client";

import * as React from "react";
import {
  Bell,
  Menu,
  User,
  Download,
  Calendar,
  Search,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Sparkles,
  Settings,
  LogOut,
  FileSpreadsheet,
  FileJson,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatDate, downloadCSV } from "@/lib/utils";
import { MOCK_SUBSCRIPTIONS } from "@/features/subscriptions/mock-data";
import { MOCK_INVOICES } from "@/features/invoices/mock-data";

export interface HeaderProps {
  onToggleSidebar?: () => void;
  onSearchChange?: (query: string) => void;
}

export function Header({ onToggleSidebar, onSearchChange }: HeaderProps) {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [exportModalOpen, setExportModalOpen] = React.useState(false);
  const [toastMessage, setToastMessage] = React.useState<string | null>(null);
  const [unreadNotifications, setUnreadNotifications] = React.useState([
    {
      id: "notif-1",
      title: "Invoice Overdue Warning",
      description: "Apex Global Systems invoice #INV-2026-0246 ($3,200) is 5 days overdue.",
      time: "10 mins ago",
      type: "danger",
      read: false,
    },
    {
      id: "notif-2",
      title: "Trial Expiration Notice",
      description: "QuantumWave Labs trial ends in 48 hours. Auto-conversion scheduled.",
      time: "1 hour ago",
      type: "warning",
      read: false,
    },
    {
      id: "notif-3",
      title: "Payment Received",
      description: "$9,600.00 processed for Acme Technologies Inc. annual renewal.",
      time: "3 hours ago",
      type: "success",
      read: false,
    },
  ]);

  const currentDateFormatted = React.useMemo(() => {
    return formatDate(new Date(), "EEE, MMM dd, yyyy");
  }, []);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchQuery(val);
    onSearchChange?.(val);
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  const handleExportCSV = () => {
    const exportData = [
      ...MOCK_SUBSCRIPTIONS.map((s) => ({
        Type: "Subscription",
        ID: s.id,
        Customer: s.customerName,
        Email: s.customerEmail,
        Plan: s.items[0]?.planName || "Enterprise",
        Amount: `$${s.mrr}/mo`,
        Status: s.status,
        Date: s.currentPeriodStart,
      })),
      ...MOCK_INVOICES.map((i) => ({
        Type: "Invoice",
        ID: i.invoiceNumber,
        Customer: i.customerName,
        Email: i.customerEmail,
        Plan: i.lineItems[0]?.description || "Contract",
        Amount: `$${i.total}`,
        Status: i.status,
        Date: i.dueDate,
      })),
    ];

    const success = downloadCSV(
      `subscriptiq-report-${formatDate(new Date(), "yyyy-MM-dd")}`,
      exportData
    );

    if (success) {
      showToast("Dashboard report exported to CSV successfully!");
      setExportModalOpen(false);
    }
  };

  const handleExportJSON = () => {
    const exportData = {
      generatedAt: new Date().toISOString(),
      platform: "SubscriptIQ",
      subscriptions: MOCK_SUBSCRIPTIONS,
      invoices: MOCK_INVOICES,
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `subscriptiq-export-${formatDate(new Date(), "yyyy-MM-dd")}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    showToast("Dashboard dataset exported to JSON successfully!");
    setExportModalOpen(false);
  };

  const unreadCount = unreadNotifications.filter((n) => !n.read).length;

  const markAllNotificationsAsRead = () => {
    setUnreadNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    showToast("All notifications marked as read");
  };

  return (
    <>
      <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200/80 bg-white/95 px-4 sm:px-6 lg:px-8 backdrop-blur">
        {/* Left: Mobile Toggle & Global Search */}
        <div className="flex items-center gap-3">
          {onToggleSidebar && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggleSidebar}
              className="md:hidden text-slate-600 hover:text-slate-900"
              aria-label="Toggle menu"
            >
              <Menu className="h-5 w-5" />
            </Button>
          )}

          {/* Search Bar */}
          <div className="relative w-52 sm:w-72 md:w-80 lg:w-96">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearch}
              placeholder="Search subscriptions, customers, invoices..."
              className="w-full pl-10 pr-12 py-2 text-sm rounded-xl border border-slate-200 bg-slate-50/70 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
            />
            <div className="absolute right-2.5 top-1/2 -translate-y-1/2 hidden sm:flex items-center gap-0.5 rounded border border-slate-200 bg-white px-1.5 py-0.5 text-[10px] font-medium text-slate-400 shadow-2xs">
              <span>⌘</span>
              <span>K</span>
            </div>
          </div>
        </div>

        {/* Right: Date, Export Button, Notifications, User Profile */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Current Date Display */}
          <div className="hidden md:flex items-center gap-2 rounded-xl border border-slate-200/80 bg-slate-50/80 px-3 py-1.5 text-xs font-medium text-slate-700 shadow-2xs">
            <Calendar className="h-3.5 w-3.5 text-indigo-600" />
            <span>{currentDateFormatted}</span>
          </div>

          {/* Functional Export Button */}
          <Button
            onClick={() => setExportModalOpen(true)}
            variant="outline"
            size="sm"
            className="flex items-center gap-2 rounded-xl border-slate-200/90 bg-white hover:bg-slate-50 text-slate-700 font-medium text-xs sm:text-sm px-3 shadow-2xs"
          >
            <Download className="h-4 w-4 text-indigo-600" />
            <span>Export</span>
          </Button>

          {/* Notification Icon & Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="relative text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-xl"
                aria-label="Notifications"
              >
                <Bell className="h-4 w-4" />
                {unreadCount > 0 && (
                  <span className="absolute top-2 right-2 flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
                  </span>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-80 sm:w-96 p-0 rounded-2xl shadow-lg border-slate-200" align="end">
              <div className="flex items-center justify-between p-4 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <h4 className="font-semibold text-sm text-slate-900">Notifications</h4>
                  {unreadCount > 0 && (
                    <span className="rounded-full bg-rose-50 px-2 py-0.5 text-[11px] font-semibold text-rose-600 border border-rose-200">
                      {unreadCount} new
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllNotificationsAsRead}
                    className="text-xs text-indigo-600 hover:text-indigo-700 font-medium cursor-pointer"
                  >
                    Mark all read
                  </button>
                )}
              </div>
              <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto">
                {unreadNotifications.map((notif) => (
                  <div
                    key={notif.id}
                    className={`p-3.5 hover:bg-slate-50 transition-colors flex gap-3 ${
                      !notif.read ? "bg-indigo-50/20" : ""
                    }`}
                  >
                    <div className="mt-0.5 shrink-0">
                      {notif.type === "danger" ? (
                        <div className="h-7 w-7 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-200">
                          <AlertTriangle className="h-3.5 w-3.5" />
                        </div>
                      ) : notif.type === "warning" ? (
                        <div className="h-7 w-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-200">
                          <Clock className="h-3.5 w-3.5" />
                        </div>
                      ) : (
                        <div className="h-7 w-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-200">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-slate-900">{notif.title}</p>
                      <p className="text-xs text-slate-600 mt-0.5 line-clamp-2">{notif.description}</p>
                      <p className="text-[10px] text-slate-400 mt-1">{notif.time}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-2 border-t border-slate-100 text-center">
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full text-xs text-slate-500 hover:text-slate-900 h-8"
                  onClick={() => showToast("Navigating to notification center")}
                >
                  View all activity history
                </Button>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* User Profile / Avatar Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="flex items-center gap-2.5 pl-2 pr-3 py-1.5 rounded-xl hover:bg-slate-100 ring-1 ring-slate-200/80 transition-all"
              >
                <Avatar className="h-8 w-8 rounded-lg bg-indigo-600 text-white font-semibold text-xs ring-2 ring-indigo-50">
                  <AvatarFallback className="bg-gradient-to-br from-indigo-600 to-indigo-700 text-white font-bold">
                    SM
                  </AvatarFallback>
                </Avatar>
                <div className="hidden sm:flex flex-col text-left">
                  <span className="text-xs font-semibold text-slate-900 leading-tight">
                    Sarah Miller
                  </span>
                  <span className="text-[10px] text-slate-500 font-medium">
                    RevOps Lead
                  </span>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 rounded-2xl p-1.5 shadow-lg border-slate-200" align="end" forceMount>
              <DropdownMenuLabel className="font-normal px-3 py-2">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-semibold leading-none text-slate-900">
                    Sarah Miller
                  </p>
                  <p className="text-xs leading-none text-slate-500">
                    sarah.miller@subscriptiq.io
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="my-1" />
              <DropdownMenuItem
                onClick={() => showToast("Opening Account Profile")}
                className="cursor-pointer rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-100"
              >
                <User className="mr-2 h-3.5 w-3.5 text-slate-500" />
                <span>Account Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => showToast("Opening Workspace Settings")}
                className="cursor-pointer rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-100"
              >
                <Settings className="mr-2 h-3.5 w-3.5 text-slate-500" />
                <span>Workspace Settings</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="my-1" />
              <DropdownMenuItem
                onClick={() => showToast("Signed out successfully")}
                className="cursor-pointer rounded-lg text-xs font-medium text-rose-600 focus:text-rose-600 hover:bg-rose-50"
              >
                <LogOut className="mr-2 h-3.5 w-3.5 text-rose-500" />
                <span>Sign Out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Export Options Dialog */}
      <Dialog open={exportModalOpen} onOpenChange={setExportModalOpen}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 mb-2 border border-indigo-100">
              <Download className="h-5 w-5" />
            </div>
            <DialogTitle className="text-lg font-bold text-slate-900">
              Export SubscriptIQ Data
            </DialogTitle>
            <DialogDescription className="text-sm text-slate-500">
              Choose your preferred report format to export current subscriptions, active customer contracts, and invoice schedules.
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-3 py-3">
            <button
              onClick={handleExportCSV}
              className="group flex flex-col items-center justify-center p-4 rounded-xl border border-slate-200 hover:border-indigo-500 hover:bg-indigo-50/30 transition-all text-center cursor-pointer"
            >
              <FileSpreadsheet className="h-8 w-8 text-indigo-600 mb-2 group-hover:scale-105 transition-transform" />
              <span className="text-sm font-semibold text-slate-900">CSV Spreadsheet</span>
              <span className="text-[11px] text-slate-500 mt-1">Excel & Sheets compatible</span>
            </button>

            <button
              onClick={handleExportJSON}
              className="group flex flex-col items-center justify-center p-4 rounded-xl border border-slate-200 hover:border-indigo-500 hover:bg-indigo-50/30 transition-all text-center cursor-pointer"
            >
              <FileJson className="h-8 w-8 text-indigo-600 mb-2 group-hover:scale-105 transition-transform" />
              <span className="text-sm font-semibold text-slate-900">JSON Payload</span>
              <span className="text-[11px] text-slate-500 mt-1">Complete API data structure</span>
            </button>
          </div>

          <DialogFooter className="sm:justify-between items-center gap-2 border-t pt-4 border-slate-100">
            <span className="text-xs text-slate-400">Includes active filters & search results</span>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setExportModalOpen(false)}
              className="text-xs"
            >
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Sleek Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2.5 rounded-xl bg-slate-900 px-4 py-3 text-white shadow-xl animate-in fade-in slide-in-from-bottom-3 duration-200">
          <Sparkles className="h-4 w-4 text-indigo-400" />
          <span className="text-xs sm:text-sm font-medium">{toastMessage}</span>
        </div>
      )}
    </>
  );
}
