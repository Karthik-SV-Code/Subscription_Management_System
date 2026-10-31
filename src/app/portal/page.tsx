"use client";

import * as React from "react";
import Link from "next/link";
import {
  Repeat,
  DollarSign,
  Calendar,
  AlertCircle,
  ArrowUpRight,
  CreditCard,
  ChevronRight,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  Clock,
  PauseCircle,
  ArrowRight,
} from "lucide-react";
import { PortalHeader } from "@/components/portal/portal-header";
import {
  PORTAL_CUSTOMER,
  PORTAL_SUBSCRIPTIONS,
  PORTAL_INVOICES,
  PORTAL_ACTIVITIES,
} from "@/features/portal/mock-data";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function PortalDashboardPage() {
  const [searchQuery, setSearchQuery] = React.useState("");

  // Calculate Summary Metrics
  const activeSubs = PORTAL_SUBSCRIPTIONS.filter(
    (s) => s.status === "active"
  );
  const totalMonthlySpending = activeSubs.reduce((acc, sub) => acc + (sub.mrr || 0), 0);
  
  // Outstanding or upcoming pending invoices
  const pendingInvoices = PORTAL_INVOICES.filter(
    (inv) => inv.status === "pending" || inv.status === "overdue"
  );
  const pendingAmount = pendingInvoices.reduce((acc, inv) => acc + (inv.amountDue || 0), 0);

  // Next upcoming payment
  const nextInvoice = pendingInvoices[0] || PORTAL_INVOICES[0];

  const filteredSubscriptions = PORTAL_SUBSCRIPTIONS.filter(
    (sub) =>
      (sub.productName || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (sub.items[0]?.planName || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex-1 flex flex-col min-w-0 pb-16">
      <PortalHeader
        title="Overview"
        subtitle={`Welcome back, ${PORTAL_CUSTOMER.name} • ${PORTAL_CUSTOMER.companyName}`}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Filter subscriptions..."
      />

      <main className="flex-1 px-4 sm:px-8 pt-6 max-w-7xl w-full mx-auto space-y-8">
        {/* Metric Cards Grid */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {/* Card 1: Active Subscriptions */}
          <div className="rounded-[20px] bg-white border border-[#EAECEF] p-6 shadow-[0_2px_10px_rgba(0,0,0,0.03)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.06)] transition-all">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-semibold text-[#737373] uppercase tracking-wider">
                Active Subscriptions
              </span>
              <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Repeat className="w-5 h-5" />
              </div>
            </div>
            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-3xl font-extrabold text-[#171717] tracking-tight">
                {activeSubs.length}
              </span>
              <span className="text-xs text-[#737373]">of {PORTAL_SUBSCRIPTIONS.length} plans</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-600">
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>All systems healthy</span>
            </div>
          </div>

          {/* Card 2: Monthly Spending */}
          <div className="rounded-[20px] bg-white border border-[#EAECEF] p-6 shadow-[0_2px_10px_rgba(0,0,0,0.03)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.06)] transition-all">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-semibold text-[#737373] uppercase tracking-wider">
                Monthly Spending
              </span>
              <div className="w-10 h-10 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <DollarSign className="w-5 h-5" />
              </div>
            </div>
            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-3xl font-extrabold text-[#171717] tracking-tight">
                {formatCurrency(totalMonthlySpending)}
              </span>
              <span className="text-xs text-[#737373]">/mo</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-medium text-indigo-600">
              <span>Normalized MRR across tiers</span>
            </div>
          </div>

          {/* Card 3: Next Billing Amount */}
          <div className="rounded-[20px] bg-white border border-[#EAECEF] p-6 shadow-[0_2px_10px_rgba(0,0,0,0.03)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.06)] transition-all">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-semibold text-[#737373] uppercase tracking-wider">
                Next Billing Amount
              </span>
              <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                <Calendar className="w-5 h-5" />
              </div>
            </div>
            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-3xl font-extrabold text-[#171717] tracking-tight">
                {formatCurrency(nextInvoice?.amountDue || 299)}
              </span>
              <span className="text-xs text-[#737373]">USD</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-medium text-[#737373]">
              <Clock className="w-3.5 h-3.5 text-blue-500" />
              <span>Due {nextInvoice ? formatDate(nextInvoice.dueDate) : "in 15 days"}</span>
            </div>
          </div>

          {/* Card 4: Pending Payments */}
          <div className="rounded-[20px] bg-white border border-[#EAECEF] p-6 shadow-[0_2px_10px_rgba(0,0,0,0.03)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.06)] transition-all">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-semibold text-[#737373] uppercase tracking-wider">
                Pending Invoices
              </span>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                pendingInvoices.length > 0 ? "bg-amber-50 text-amber-600" : "bg-emerald-50 text-emerald-600"
              }`}>
                <AlertCircle className="w-5 h-5" />
              </div>
            </div>
            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-3xl font-extrabold text-[#171717] tracking-tight">
                {pendingInvoices.length}
              </span>
              <span className="text-xs text-[#737373]">
                ({formatCurrency(pendingAmount)})
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-medium">
              {pendingInvoices.length > 0 ? (
                <Link href="/portal/invoices" className="text-amber-600 hover:underline flex items-center gap-1">
                  Action required &rarr;
                </Link>
              ) : (
                <span className="text-emerald-600 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> All invoices paid
                </span>
              )}
            </div>
          </div>
        </section>

        {/* My Current Subscriptions */}
        <section className="rounded-[20px] bg-white border border-[#EAECEF] p-6 sm:p-8 shadow-[0_2px_10px_rgba(0,0,0,0.03)]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-[#171717] tracking-tight">
                My Active Subscriptions
              </h2>
              <p className="text-xs text-[#737373]">
                Manage services, adjust tiers, or configure billing cycles
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/portal/plans">
                <Button
                  size="sm"
                  className="bg-[#171717] hover:bg-black text-white text-xs rounded-xl h-9 px-4 font-semibold"
                >
                  Explore Plans
                </Button>
              </Link>
              <Link href="/portal/subscriptions">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-[#EAECEF] text-xs rounded-xl h-9 px-3.5 text-[#171717]"
                >
                  View All &rarr;
                </Button>
              </Link>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#EAECEF] text-[11px] font-bold uppercase tracking-wider text-[#737373]">
                  <th className="py-3 px-4">Product & Plan</th>
                  <th className="py-3 px-4">Cycle</th>
                  <th className="py-3 px-4">Price</th>
                  <th className="py-3 px-4">Next Renewal</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EAECEF] text-xs">
                {filteredSubscriptions.map((sub) => {
                  const item = sub.items[0];
                  return (
                    <tr
                      key={sub.id}
                      className="hover:bg-[#F5F6F8]/60 transition-colors group"
                    >
                      <td className="py-4 px-4">
                        <div className="font-bold text-[#171717]">{sub.productName}</div>
                        <div className="text-[11px] text-[#737373]">{item?.planName}</div>
                      </td>
                      <td className="py-4 px-4 font-medium text-[#737373]">
                        {sub.billingCycle}
                      </td>
                      <td className="py-4 px-4 font-semibold text-[#171717]">
                        {formatCurrency(item?.unitAmount || sub.mrr)}
                        <span className="text-[10px] text-[#737373] font-normal">
                          /{sub.billingCycle === "Annual" ? "yr" : "mo"}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-[#737373]">
                        {formatDate(sub.currentPeriodEnd)}
                      </td>
                      <td className="py-4 px-4">
                        {sub.status === "active" && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                            Active
                          </span>
                        )}
                        {sub.status === "paused" && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                            <PauseCircle className="w-3 h-3 text-amber-600" />
                            Paused
                          </span>
                        )}
                        {sub.status === "cancelled" && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                            Cancelled
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-4 text-right">
                        <Link href="/portal/subscriptions">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 rounded-lg text-xs font-semibold text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50"
                          >
                            Manage
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        {/* 2-Column Split: Upcoming Invoices & Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
          {/* Upcoming Payments / Pending Invoices */}
          <section className="rounded-[20px] bg-white border border-[#EAECEF] p-6 sm:p-8 shadow-[0_2px_10px_rgba(0,0,0,0.03)] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-[#171717]">
                  Upcoming & Recent Invoices
                </h3>
                <Link
                  href="/portal/invoices"
                  className="text-xs font-semibold text-indigo-600 hover:underline flex items-center gap-1"
                >
                  All Invoices &rarr;
                </Link>
              </div>
              <p className="text-xs text-[#737373] mb-6">
                Direct statements and upcoming settlement dates
              </p>

              <div className="space-y-3">
                {PORTAL_INVOICES.slice(0, 4).map((inv) => (
                  <div
                    key={inv.id}
                    className="flex items-center justify-between p-3.5 rounded-xl border border-[#EAECEF] hover:border-slate-300 hover:bg-[#F5F6F8]/40 transition-all"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-[#171717]">
                          {inv.invoiceNumber}
                        </span>
                        {inv.status === "paid" && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700">
                            Paid
                          </span>
                        )}
                        {inv.status === "pending" && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 text-blue-700">
                            Pending
                          </span>
                        )}
                        {inv.status === "overdue" && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-50 text-rose-700">
                            Overdue
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-[#737373] truncate mt-0.5">
                        Due {formatDate(inv.dueDate)} • {inv.lineItems[0]?.description}
                      </div>
                    </div>
                    <div className="text-right shrink-0 ml-3">
                      <div className="text-xs font-bold text-[#171717]">
                        {formatCurrency(inv.total)}
                      </div>
                      <Link
                        href="/portal/invoices"
                        className="text-[11px] font-medium text-indigo-600 hover:underline"
                      >
                        View &rarr;
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-6 mt-6 border-t border-[#EAECEF] flex items-center justify-between text-xs text-[#737373]">
              <span className="flex items-center gap-1.5">
                <CreditCard className="w-3.5 h-3.5 text-slate-500" />
                Default Method: ACH ••8821
              </span>
              <Link
                href="/portal/payments"
                className="font-semibold text-[#171717] hover:underline"
              >
                Payment Settings
              </Link>
            </div>
          </section>

          {/* Recent Activity Timeline */}
          <section className="rounded-[20px] bg-white border border-[#EAECEF] p-6 sm:p-8 shadow-[0_2px_10px_rgba(0,0,0,0.03)]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-[#171717]">
                Recent Account Activity
              </h3>
              <span className="text-[11px] font-semibold text-[#737373]">
                Live feed
              </span>
            </div>
            <p className="text-xs text-[#737373] mb-6">
              Audit log of changes, renewals, and invoice notifications
            </p>

            <div className="relative pl-6 space-y-6 before:content-[''] before:absolute before:left-2 before:top-2 before:bottom-2 before:w-[2px] before:bg-[#EAECEF]">
              {PORTAL_ACTIVITIES.slice(0, 5).map((act) => {
                const isSuccess =
                  act.type === "payment_succeeded" ||
                  act.type === "subscription_created" ||
                  act.type === "subscription_renewed";
                const isFail = act.type === "payment_failed";

                return (
                  <div key={act.id} className="relative group">
                    <span
                      className={`absolute -left-6 top-1 w-2.5 h-2.5 rounded-full ring-4 ring-white ${
                        isFail
                          ? "bg-rose-500"
                          : isSuccess
                          ? "bg-emerald-500"
                          : "bg-indigo-500"
                      }`}
                    />
                    <div className="flex items-start justify-between gap-2">
                      <div className="text-xs font-bold text-[#171717]">
                        {act.title}
                      </div>
                      <span className="text-[10px] text-[#737373] shrink-0">
                        {formatDate(act.timestamp)}
                      </span>
                    </div>
                    <div className="text-[11px] text-[#737373] mt-0.5">
                      {act.description}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="pt-6 mt-6 border-t border-[#EAECEF] flex items-center justify-between">
              <span className="text-xs text-[#737373]">
                Need assistance with an activity item?
              </span>
              <Link
                href="/portal/support"
                className="text-xs font-semibold text-indigo-600 hover:underline"
              >
                Contact Support &rarr;
              </Link>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
