"use client";

import * as React from "react";
import Link from "next/link";
import {
  Users,
  Repeat,
  DollarSign,
  TrendingUp,
  CreditCard,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle2,
  Clock,
  AlertCircle,
  Eye,
  RefreshCw,
  Search,
  Filter,
  ShieldCheck,
  Building,
  UserCheck,
} from "lucide-react";
import { AdminHeader } from "@/components/admin/admin-header";
import { AdminRevenueChart } from "@/components/admin/admin-revenue-chart";
import { AdminChurnChart } from "@/components/admin/admin-churn-chart";
import {
  MOCK_ACCOUNT_ACTIVITIES,
  MOCK_TRANSACTIONS,
  MOCK_SUBSCRIPTION_ACTIVITIES,
} from "@/features/admin/mock-data";
import {
  AccountActivity,
  TransactionRecord,
  SubscriptionActivity,
} from "@/features/admin/types";
import { formatCurrency, downloadCSV } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function AdminDashboardPage() {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedActivity, setSelectedActivity] = React.useState<AccountActivity | null>(null);
  const [selectedTxn, setSelectedTxn] = React.useState<TransactionRecord | null>(null);
  const [selectedSubActivity, setSelectedSubActivity] = React.useState<SubscriptionActivity | null>(null);
  const [exportNotice, setExportNotice] = React.useState<string | null>(null);

  // Search filtering
  const filteredActivities = React.useMemo(() => {
    if (!searchQuery.trim()) return MOCK_ACCOUNT_ACTIVITIES;
    const q = searchQuery.toLowerCase();
    return MOCK_ACCOUNT_ACTIVITIES.filter(
      (a) =>
        a.customerName.toLowerCase().includes(q) ||
        a.customerEmail.toLowerCase().includes(q) ||
        a.activityType.toLowerCase().includes(q) ||
        a.planName.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  const filteredTransactions = React.useMemo(() => {
    if (!searchQuery.trim()) return MOCK_TRANSACTIONS;
    const q = searchQuery.toLowerCase();
    return MOCK_TRANSACTIONS.filter(
      (t) =>
        t.transactionRef.toLowerCase().includes(q) ||
        t.customerName.toLowerCase().includes(q) ||
        t.customerEmail.toLowerCase().includes(q) ||
        t.paymentMethod.toLowerCase().includes(q) ||
        t.status.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  const filteredSubActivities = React.useMemo(() => {
    if (!searchQuery.trim()) return MOCK_SUBSCRIPTION_ACTIVITIES;
    const q = searchQuery.toLowerCase();
    return MOCK_SUBSCRIPTION_ACTIVITIES.filter(
      (s) =>
        s.subscriptionId.toLowerCase().includes(q) ||
        s.customerName.toLowerCase().includes(q) ||
        s.eventType.toLowerCase().includes(q) ||
        s.planName.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  // Export Dashboard Data as CSV
  const handleExportCSV = React.useCallback(() => {
    const exportRows = filteredTransactions.map((tx) => ({
      TransactionRef: tx.transactionRef,
      Customer: tx.customerName,
      Email: tx.customerEmail,
      Amount: tx.amount,
      Currency: tx.currency,
      Method: tx.paymentMethod,
      Status: tx.status,
      Invoice: tx.invoiceId,
      Date: tx.date,
    }));

    const success = downloadCSV(
      `subscriptiq_admin_transactions_${new Date().toISOString().slice(0, 10)}`,
      exportRows as unknown as Record<string, unknown>[]
    );

    if (success) {
      setExportNotice("Transaction records exported successfully to CSV.");
      setTimeout(() => setExportNotice(null), 4000);
    }
  }, [filteredTransactions]);

  return (
    <>
      <AdminHeader
        title="Admin Portal Dashboard"
        subtitle="Platform governance, recurring revenue trajectory & system telemetry"
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Filter activities, txns, subscribers..."
        onExportCSV={handleExportCSV}
      />

      <main className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto space-y-6">
        {/* Status Notice */}
        {exportNotice && (
          <div className="p-3.5 rounded-[16px] bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center justify-between animate-in fade-in">
            <span>✓ {exportNotice}</span>
            <button
              onClick={() => setExportNotice(null)}
              className="text-emerald-700 hover:text-emerald-900 underline text-xs ml-4"
            >
              Close
            </button>
          </div>
        )}

        {/* ================= 4 SUMMARY CARDS ================= */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Total Customers */}
          <div className="bg-white p-6 rounded-[20px] border border-[#EAECEF] shadow-[0_2px_10px_rgba(0,0,0,0.03)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.06)] transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#737373]">
                Total Customers
              </span>
              <div className="w-10 h-10 rounded-[12px] bg-purple-50 text-purple-600 flex items-center justify-center shadow-xs">
                <Users className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4">
              <div className="text-3xl font-extrabold text-[#171717] tracking-tight">
                942
              </div>
              <div className="mt-2 flex items-center gap-2 text-xs">
                <span className="inline-flex items-center gap-1 font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                  <TrendingUp className="w-3 h-3" /> +12.1%
                </span>
                <span className="text-[#737373]">112 added this mo.</span>
              </div>
            </div>
          </div>

          {/* Card 2: Active Subscriptions */}
          <div className="bg-white p-6 rounded-[20px] border border-[#EAECEF] shadow-[0_2px_10px_rgba(0,0,0,0.03)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.06)] transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#737373]">
                Active Subscriptions
              </span>
              <div className="w-10 h-10 rounded-[12px] bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-xs">
                <Repeat className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4">
              <div className="text-3xl font-extrabold text-[#171717] tracking-tight">
                1,284
              </div>
              <div className="mt-2 flex items-center gap-2 text-xs">
                <span className="inline-flex items-center gap-1 font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                  <TrendingUp className="w-3 h-3" /> +8.5%
                </span>
                <span className="text-[#737373]">94.2% retention rate</span>
              </div>
            </div>
          </div>

          {/* Card 3: Monthly Recurring Revenue */}
          <div className="bg-white p-6 rounded-[20px] border border-[#EAECEF] shadow-[0_2px_10px_rgba(0,0,0,0.03)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.06)] transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#737373]">
                Monthly Recurring Revenue
              </span>
              <div className="w-10 h-10 rounded-[12px] bg-indigo-50 text-indigo-600 flex items-center justify-center shadow-xs">
                <DollarSign className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4">
              <div className="text-3xl font-extrabold text-[#171717] tracking-tight">
                $68,450
              </div>
              <div className="mt-2 flex items-center gap-2 text-xs">
                <span className="inline-flex items-center gap-1 font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                  <TrendingUp className="w-3 h-3" /> +14.2%
                </span>
                <span className="text-[#737373]">+$8,490 expansion</span>
              </div>
            </div>
          </div>

          {/* Card 4: Total Revenue */}
          <div className="bg-white p-6 rounded-[20px] border border-[#EAECEF] shadow-[0_2px_10px_rgba(0,0,0,0.03)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.06)] transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#737373]">
                Total Revenue
              </span>
              <div className="w-10 h-10 rounded-[12px] bg-blue-50 text-blue-600 flex items-center justify-center shadow-xs">
                <CreditCard className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4">
              <div className="text-3xl font-extrabold text-[#171717] tracking-tight">
                $842,600
              </div>
              <div className="mt-2 flex items-center gap-2 text-xs">
                <span className="inline-flex items-center gap-1 font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                  <TrendingUp className="w-3 h-3" /> +18.4%
                </span>
                <span className="text-[#737373]">YTD Gross Collections</span>
              </div>
            </div>
          </div>
        </div>

        {/* ================= 2 ANALYTICS SECTIONS ================= */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <AdminRevenueChart />
          <AdminChurnChart />
        </div>

        {/* Quick Admin Operations Strip */}
        <div className="bg-white p-4 sm:p-5 rounded-[20px] border border-[#EAECEF] shadow-[0_2px_10px_rgba(0,0,0,0.03)] flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs">
              <ShieldCheck className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <div className="text-xs font-bold text-[#171717]">
                Admin Command Center
              </div>
              <div className="text-[11px] text-[#737373]">
                Manage role access, inspect customer accounts, and monitor invoice ledgers
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            <Link
              href="/admin/users"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[12px] bg-slate-100 hover:bg-slate-200 text-[#171717] text-xs font-semibold transition-all"
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>User Management</span>
            </Link>
            <Link
              href="/admin/customers"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[12px] bg-slate-100 hover:bg-slate-200 text-[#171717] text-xs font-semibold transition-all"
            >
              <Building className="w-3.5 h-3.5" />
              <span>Customers</span>
            </Link>
            <Link
              href="/admin/subscriptions"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[12px] bg-slate-100 hover:bg-slate-200 text-[#171717] text-xs font-semibold transition-all"
            >
              <Repeat className="w-3.5 h-3.5" />
              <span>Subscriptions</span>
            </Link>
            <Link
              href="/admin/invoices"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[12px] bg-slate-100 hover:bg-slate-200 text-[#171717] text-xs font-semibold transition-all"
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span>Invoices</span>
            </Link>
          </div>
        </div>

        {/* ================= 3 TABLES SECTION ================= */}
        <div className="space-y-6">
          {/* Table 1: Recent Account Activity */}
          <div className="bg-white rounded-[20px] border border-[#EAECEF] shadow-[0_2px_10px_rgba(0,0,0,0.03)] overflow-hidden">
            <div className="p-6 border-b border-[#EAECEF] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-[#171717]">
                  Recent Account Activity
                </h3>
                <p className="text-xs text-[#737373] mt-0.5">
                  Platform events, subscription upgrades, and webhook state updates
                </p>
              </div>
              <span className="text-xs text-[#737373] self-start sm:self-center font-medium">
                Showing {filteredActivities.length} of {MOCK_ACCOUNT_ACTIVITIES.length} events
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#EAECEF] bg-[#F5F6F8]/60 text-[#737373] font-semibold">
                    <th className="py-3.5 px-6">Customer</th>
                    <th className="py-3.5 px-6">Activity Type</th>
                    <th className="py-3.5 px-6">Plan / Details</th>
                    <th className="py-3.5 px-6">Impact Amount</th>
                    <th className="py-3.5 px-6">Status</th>
                    <th className="py-3.5 px-6">Timestamp</th>
                    <th className="py-3.5 px-6 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EAECEF]">
                  {filteredActivities.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-[#737373]">
                        No account activities matching &quot;{searchQuery}&quot;
                      </td>
                    </tr>
                  ) : (
                    filteredActivities.map((act) => (
                      <tr
                        key={act.id}
                        className="hover:bg-slate-50/70 transition-colors group"
                      >
                        <td className="py-4 px-6">
                          <div className="font-semibold text-[#171717]">
                            {act.customerName}
                          </div>
                          <div className="text-[11px] text-[#737373]">
                            {act.customerEmail}
                          </div>
                        </td>
                        <td className="py-4 px-6 font-medium text-[#171717]">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-slate-100 text-[#171717]">
                            {act.activityType}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-[#737373] max-w-xs truncate">
                          {act.description}
                        </td>
                        <td className="py-4 px-6 font-semibold text-[#171717]">
                          {act.amount ? formatCurrency(act.amount) : "—"}
                        </td>
                        <td className="py-4 px-6">
                          {act.status === "Completed" && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100">
                              <CheckCircle2 className="w-3 h-3" /> Completed
                            </span>
                          )}
                          {act.status === "Pending" && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                              <Clock className="w-3 h-3" /> Pending
                            </span>
                          )}
                          {act.status === "Attention" && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                              <AlertCircle className="w-3 h-3" /> Attention
                            </span>
                          )}
                        </td>
                        <td className="py-4 px-6 text-[#737373]">
                          {act.timestamp}
                        </td>
                        <td className="py-4 px-6 text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedActivity(act)}
                            className="h-8 px-2.5 rounded-[10px] text-xs text-indigo-600 hover:text-indigo-900 hover:bg-indigo-50"
                          >
                            <Eye className="w-3.5 h-3.5 mr-1" />
                            Inspect
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Table 2: Recent Transactions */}
          <div className="bg-white rounded-[20px] border border-[#EAECEF] shadow-[0_2px_10px_rgba(0,0,0,0.03)] overflow-hidden">
            <div className="p-6 border-b border-[#EAECEF] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-[#171717]">
                  Recent Payment Transactions
                </h3>
                <p className="text-xs text-[#737373] mt-0.5">
                  Settlements, gateway payouts, card charges, and wire receipts
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleExportCSV}
                  className="h-8 px-3 rounded-[10px] text-xs font-semibold border-[#EAECEF]"
                >
                  Export Table
                </Button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#EAECEF] bg-[#F5F6F8]/60 text-[#737373] font-semibold">
                    <th className="py-3.5 px-6">Transaction Ref</th>
                    <th className="py-3.5 px-6">Customer</th>
                    <th className="py-3.5 px-6">Amount</th>
                    <th className="py-3.5 px-6">Method</th>
                    <th className="py-3.5 px-6">Status</th>
                    <th className="py-3.5 px-6">Invoice Ref</th>
                    <th className="py-3.5 px-6">Date</th>
                    <th className="py-3.5 px-6 text-right">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EAECEF]">
                  {filteredTransactions.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-[#737373]">
                        No transactions found
                      </td>
                    </tr>
                  ) : (
                    filteredTransactions.map((tx) => (
                      <tr
                        key={tx.id}
                        className="hover:bg-slate-50/70 transition-colors"
                      >
                        <td className="py-4 px-6 font-mono font-bold text-[#171717]">
                          {tx.transactionRef}
                        </td>
                        <td className="py-4 px-6">
                          <div className="font-semibold text-[#171717]">
                            {tx.customerName}
                          </div>
                          <div className="text-[11px] text-[#737373]">
                            {tx.customerEmail}
                          </div>
                        </td>
                        <td className="py-4 px-6 font-bold text-[#171717]">
                          {formatCurrency(tx.amount)}
                        </td>
                        <td className="py-4 px-6 text-[#737373]">
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-slate-100 text-[11px] font-medium text-[#171717]">
                            <CreditCard className="w-3 h-3 text-slate-500" />
                            {tx.paymentMethod}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          {tx.status === "Succeeded" && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100">
                              <CheckCircle2 className="w-3 h-3" /> Succeeded
                            </span>
                          )}
                          {tx.status === "Processing" && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                              <RefreshCw className="w-3 h-3 animate-spin" /> Processing
                            </span>
                          )}
                          {tx.status === "Failed" && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                              <AlertCircle className="w-3 h-3" /> Failed
                            </span>
                          )}
                          {tx.status === "Refunded" && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                              Refunded
                            </span>
                          )}
                        </td>
                        <td className="py-4 px-6 text-[#737373] font-mono">
                          {tx.invoiceId}
                        </td>
                        <td className="py-4 px-6 text-[#737373]">
                          {tx.date}
                        </td>
                        <td className="py-4 px-6 text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedTxn(tx)}
                            className="h-8 px-2.5 rounded-[10px] text-xs text-slate-700 hover:text-[#171717] hover:bg-slate-100"
                          >
                            Inspect
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Table 3: Latest Subscription Activities */}
          <div className="bg-white rounded-[20px] border border-[#EAECEF] shadow-[0_2px_10px_rgba(0,0,0,0.03)] overflow-hidden">
            <div className="p-6 border-b border-[#EAECEF] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-[#171717]">
                  Latest Subscription Activities
                </h3>
                <p className="text-xs text-[#737373] mt-0.5">
                  Plan renewals, expansion MRR shifts, and churn logs
                </p>
              </div>
              <Link
                href="/admin/subscriptions"
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 self-start sm:self-center"
              >
                View all contracts →
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#EAECEF] bg-[#F5F6F8]/60 text-[#737373] font-semibold">
                    <th className="py-3.5 px-6">Subscription ID</th>
                    <th className="py-3.5 px-6">Customer</th>
                    <th className="py-3.5 px-6">Event Type</th>
                    <th className="py-3.5 px-6">Plan Name</th>
                    <th className="py-3.5 px-6">MRR Shift</th>
                    <th className="py-3.5 px-6">Cadence</th>
                    <th className="py-3.5 px-6">Timestamp</th>
                    <th className="py-3.5 px-6 text-right">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EAECEF]">
                  {filteredSubActivities.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-[#737373]">
                        No subscription activities match the filter
                      </td>
                    </tr>
                  ) : (
                    filteredSubActivities.map((sub) => {
                      const isPositive = sub.mrrDelta > 0;
                      return (
                        <tr
                          key={sub.id}
                          className="hover:bg-slate-50/70 transition-colors"
                        >
                          <td className="py-4 px-6 font-mono font-bold text-[#171717]">
                            {sub.subscriptionId}
                          </td>
                          <td className="py-4 px-6 font-semibold text-[#171717]">
                            {sub.customerName}
                          </td>
                          <td className="py-4 px-6">
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-[#171717]">
                              {sub.eventType}
                            </span>
                          </td>
                          <td className="py-4 px-6 font-medium text-[#737373]">
                            {sub.planName}
                          </td>
                          <td className="py-4 px-6 font-bold">
                            <span
                              className={`inline-flex items-center gap-0.5 ${
                                isPositive
                                  ? "text-emerald-600"
                                  : "text-rose-600"
                              }`}
                            >
                              {isPositive ? (
                                <ArrowUpRight className="w-3.5 h-3.5" />
                              ) : (
                                <ArrowDownRight className="w-3.5 h-3.5" />
                              )}
                              {isPositive ? "+" : ""}
                              {formatCurrency(sub.mrrDelta)}/mo
                            </span>
                          </td>
                          <td className="py-4 px-6 text-[#737373]">
                            <span className="px-2 py-0.5 rounded-md bg-slate-100 text-[11px]">
                              {sub.cadence}
                            </span>
                          </td>
                          <td className="py-4 px-6 text-[#737373]">
                            {sub.timestamp}
                          </td>
                          <td className="py-4 px-6 text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setSelectedSubActivity(sub)}
                              className="h-8 px-2.5 rounded-[10px] text-xs text-slate-700 hover:text-[#171717] hover:bg-slate-100"
                            >
                              Inspect
                            </Button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>

      {/* Activity Details Dialog */}
      <Dialog open={!!selectedActivity} onOpenChange={(open) => !open && setSelectedActivity(null)}>
        <DialogContent className="max-w-md rounded-[20px] bg-white border border-[#EAECEF] p-6 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-[#171717]">
              Account Event Inspector
            </DialogTitle>
            <DialogDescription className="text-xs text-[#737373]">
              Audit trail event details from the SubscriptIQ ledger
            </DialogDescription>
          </DialogHeader>

          {selectedActivity && (
            <div className="space-y-4 pt-2 text-xs">
              <div className="p-3 rounded-[12px] bg-[#F5F6F8] border border-[#EAECEF] space-y-1.5">
                <div className="text-[10px] uppercase font-bold text-[#737373] tracking-wider">
                  Customer
                </div>
                <div className="text-sm font-bold text-[#171717]">
                  {selectedActivity.customerName}
                </div>
                <div className="text-[#737373]">{selectedActivity.customerEmail}</div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-[12px] bg-[#F5F6F8] border border-[#EAECEF]">
                  <div className="text-[10px] uppercase font-bold text-[#737373]">
                    Event Type
                  </div>
                  <div className="font-bold text-[#171717] mt-1">
                    {selectedActivity.activityType}
                  </div>
                </div>
                <div className="p-3 rounded-[12px] bg-[#F5F6F8] border border-[#EAECEF]">
                  <div className="text-[10px] uppercase font-bold text-[#737373]">
                    Status
                  </div>
                  <div className="font-bold text-[#171717] mt-1">
                    {selectedActivity.status}
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-[12px] bg-[#F5F6F8] border border-[#EAECEF]">
                <div className="text-[10px] uppercase font-bold text-[#737373]">
                  Description
                </div>
                <div className="text-[#171717] mt-1 font-medium">
                  {selectedActivity.description}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedActivity(null)}
                  className="rounded-[10px]"
                >
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Transaction Details Dialog */}
      <Dialog open={!!selectedTxn} onOpenChange={(open) => !open && setSelectedTxn(null)}>
        <DialogContent className="max-w-md rounded-[20px] bg-white border border-[#EAECEF] p-6 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-[#171717]">
              Transaction Receipt & Metadata
            </DialogTitle>
            <DialogDescription className="text-xs text-[#737373]">
              Settlement records and gateway authorization logs
            </DialogDescription>
          </DialogHeader>

          {selectedTxn && (
            <div className="space-y-4 pt-2 text-xs">
              <div className="p-3 rounded-[12px] bg-[#F5F6F8] border border-[#EAECEF] flex justify-between items-center">
                <div>
                  <div className="text-[10px] uppercase font-bold text-[#737373]">
                    Reference Number
                  </div>
                  <div className="text-sm font-mono font-bold text-[#171717]">
                    {selectedTxn.transactionRef}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] uppercase font-bold text-[#737373]">
                    Settled Amount
                  </div>
                  <div className="text-sm font-bold text-emerald-700">
                    {formatCurrency(selectedTxn.amount)}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-[12px] bg-[#F5F6F8] border border-[#EAECEF]">
                  <div className="text-[10px] uppercase font-bold text-[#737373]">
                    Payment Rail
                  </div>
                  <div className="font-semibold text-[#171717] mt-1">
                    {selectedTxn.paymentMethod}
                  </div>
                </div>
                <div className="p-3 rounded-[12px] bg-[#F5F6F8] border border-[#EAECEF]">
                  <div className="text-[10px] uppercase font-bold text-[#737373]">
                    Linked Invoice
                  </div>
                  <div className="font-mono font-semibold text-[#171717] mt-1">
                    {selectedTxn.invoiceId}
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-[12px] bg-[#F5F6F8] border border-[#EAECEF]">
                <div className="text-[10px] uppercase font-bold text-[#737373]">
                  Customer Account
                </div>
                <div className="text-sm font-bold text-[#171717] mt-0.5">
                  {selectedTxn.customerName}
                </div>
                <div className="text-[#737373]">{selectedTxn.customerEmail}</div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedTxn(null)}
                  className="rounded-[10px]"
                >
                  Dismiss
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Subscription Activity Details Dialog */}
      <Dialog
        open={!!selectedSubActivity}
        onOpenChange={(open) => !open && setSelectedSubActivity(null)}
      >
        <DialogContent className="max-w-md rounded-[20px] bg-white border border-[#EAECEF] p-6 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-[#171717]">
              Subscription Contract Event
            </DialogTitle>
            <DialogDescription className="text-xs text-[#737373]">
              Subscriber lifecycle audit and MRR attribution
            </DialogDescription>
          </DialogHeader>

          {selectedSubActivity && (
            <div className="space-y-4 pt-2 text-xs">
              <div className="p-3 rounded-[12px] bg-[#F5F6F8] border border-[#EAECEF]">
                <div className="text-[10px] uppercase font-bold text-[#737373]">
                  Subscription Contract
                </div>
                <div className="text-sm font-mono font-bold text-[#171717] mt-0.5">
                  {selectedSubActivity.subscriptionId}
                </div>
                <div className="text-xs font-semibold text-[#171717] mt-1">
                  {selectedSubActivity.customerName}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-[12px] bg-[#F5F6F8] border border-[#EAECEF]">
                  <div className="text-[10px] uppercase font-bold text-[#737373]">
                    Event Type
                  </div>
                  <div className="font-semibold text-[#171717] mt-1">
                    {selectedSubActivity.eventType}
                  </div>
                </div>
                <div className="p-3 rounded-[12px] bg-[#F5F6F8] border border-[#EAECEF]">
                  <div className="text-[10px] uppercase font-bold text-[#737373]">
                    Cadence
                  </div>
                  <div className="font-semibold text-[#171717] mt-1">
                    {selectedSubActivity.cadence}
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-[12px] bg-[#F5F6F8] border border-[#EAECEF]">
                <div className="text-[10px] uppercase font-bold text-[#737373]">
                  Monthly MRR Delta
                </div>
                <div
                  className={`text-base font-extrabold mt-1 ${
                    selectedSubActivity.mrrDelta > 0
                      ? "text-emerald-600"
                      : "text-rose-600"
                  }`}
                >
                  {selectedSubActivity.mrrDelta > 0 ? "+" : ""}
                  {formatCurrency(selectedSubActivity.mrrDelta)} / month
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedSubActivity(null)}
                  className="rounded-[10px]"
                >
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

