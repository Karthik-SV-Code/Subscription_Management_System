"use client";

import * as React from "react";
import {
  Copy,
  Check,
  Search,
  ExternalLink,
  Layers,
  Calendar,
  DollarSign,
  AlertCircle,
  PauseCircle,
  PlayCircle,
  XCircle,
  Clock,
  Sparkles,
} from "lucide-react";
import { Subscription } from "@/types/subscription";
import { StatusBadge } from "@/components/shared/status-badge";
import { formatDate, formatCurrency, copyToClipboard } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export interface RecentSubscriptionsTableProps {
  initialData: Subscription[];
  externalSearch?: string;
  onToast?: (message: string) => void;
}

export function RecentSubscriptionsTable({
  initialData,
  externalSearch = "",
  onToast,
}: RecentSubscriptionsTableProps) {
  const [data, setData] = React.useState<Subscription[]>(initialData);
  const [search, setSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<string>("all");
  const [copiedId, setCopiedId] = React.useState<string | null>(null);
  const [selectedSubscription, setSelectedSubscription] = React.useState<Subscription | null>(null);

  const effectiveSearch = externalSearch.trim() || search.trim();

  // Filter subscriptions by status & search query
  const filteredSubscriptions = React.useMemo(() => {
    return data.filter((sub) => {
      // Status match
      if (statusFilter !== "all") {
        const normStatus = sub.status.toLowerCase();
        if (statusFilter === "trial" && (normStatus === "trial" || normStatus === "trialing")) {
          // match
        } else if (
          statusFilter === "cancelled" &&
          (normStatus === "cancelled" || normStatus === "canceled")
        ) {
          // match
        } else if (normStatus !== statusFilter) {
          return false;
        }
      }

      // Search match
      if (effectiveSearch) {
        const query = effectiveSearch.toLowerCase();
        const matchesId = sub.id.toLowerCase().includes(query);
        const matchesCustomer = sub.customerName.toLowerCase().includes(query);
        const matchesPlan =
          sub.items[0]?.planName.toLowerCase().includes(query) ||
          sub.productName?.toLowerCase().includes(query);
        const matchesEmail = sub.customerEmail.toLowerCase().includes(query);
        return matchesId || matchesCustomer || matchesPlan || matchesEmail;
      }

      return true;
    });
  }, [data, statusFilter, effectiveSearch]);

  const handleCopy = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const success = await copyToClipboard(id);
    if (success) {
      setCopiedId(id);
      onToast?.(`Copied ${id} to clipboard`);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  const handleUpdateStatus = (subId: string, newStatus: Subscription["status"]) => {
    setData((prev) =>
      prev.map((sub) => (sub.id === subId ? { ...sub, status: newStatus } : sub))
    );
    if (selectedSubscription && selectedSubscription.id === subId) {
      setSelectedSubscription((prev) => (prev ? { ...prev, status: newStatus } : null));
    }
    onToast?.(`Subscription ${subId} status updated to ${newStatus}`);
  };

  // Status counts
  const statusCounts = React.useMemo(() => {
    const counts = { all: data.length, active: 0, trial: 0, paused: 0, cancelled: 0 };
    data.forEach((s) => {
      const st = s.status.toLowerCase();
      if (st === "active") counts.active++;
      else if (st === "trial" || st === "trialing") counts.trial++;
      else if (st === "paused") counts.paused++;
      else if (st === "cancelled" || st === "canceled") counts.cancelled++;
    });
    return counts;
  }, [data]);

  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white shadow-sm overflow-hidden transition-all">
      {/* Table Top Header & Controls */}
      <div className="p-5 sm:p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-slate-900">Recent Subscriptions</h3>
            <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-600">
              {filteredSubscriptions.length} records
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Real-time subscriber lifecycle status, pricing plans, and recurring contract values.
          </p>
        </div>

        {/* Controls: Search & Tabs */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Local Search input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filter subscriptions..."
              className="w-full sm:w-48 pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-slate-50 text-slate-800 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>

          {/* Filter Status Tabs */}
          <div className="flex items-center rounded-xl bg-slate-100 p-1 text-xs font-medium text-slate-600 overflow-x-auto">
            <button
              onClick={() => setStatusFilter("all")}
              className={`rounded-lg px-2.5 py-1 whitespace-nowrap transition-all ${
                statusFilter === "all"
                  ? "bg-white text-slate-900 shadow-2xs font-semibold"
                  : "hover:text-slate-900"
              }`}
            >
              All ({statusCounts.all})
            </button>
            <button
              onClick={() => setStatusFilter("active")}
              className={`rounded-lg px-2.5 py-1 whitespace-nowrap transition-all ${
                statusFilter === "active"
                  ? "bg-white text-slate-900 shadow-2xs font-semibold"
                  : "hover:text-slate-900"
              }`}
            >
              Active ({statusCounts.active})
            </button>
            <button
              onClick={() => setStatusFilter("trial")}
              className={`rounded-lg px-2.5 py-1 whitespace-nowrap transition-all ${
                statusFilter === "trial"
                  ? "bg-white text-slate-900 shadow-2xs font-semibold"
                  : "hover:text-slate-900"
              }`}
            >
              Trial ({statusCounts.trial})
            </button>
            <button
              onClick={() => setStatusFilter("paused")}
              className={`rounded-lg px-2.5 py-1 whitespace-nowrap transition-all ${
                statusFilter === "paused"
                  ? "bg-white text-slate-900 shadow-2xs font-semibold"
                  : "hover:text-slate-900"
              }`}
            >
              Paused ({statusCounts.paused})
            </button>
            <button
              onClick={() => setStatusFilter("cancelled")}
              className={`rounded-lg px-2.5 py-1 whitespace-nowrap transition-all ${
                statusFilter === "cancelled"
                  ? "bg-white text-slate-900 shadow-2xs font-semibold"
                  : "hover:text-slate-900"
              }`}
            >
              Cancelled ({statusCounts.cancelled})
            </button>
          </div>
        </div>
      </div>

      {/* Data Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm border-collapse">
          <thead className="bg-slate-50/75 border-b border-slate-100 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            <tr>
              <th scope="col" className="px-5 py-3.5">Subscription ID</th>
              <th scope="col" className="px-5 py-3.5">Customer Name</th>
              <th scope="col" className="px-5 py-3.5">Product / Plan</th>
              <th scope="col" className="px-5 py-3.5">Billing Cycle</th>
              <th scope="col" className="px-5 py-3.5">Start Date</th>
              <th scope="col" className="px-5 py-3.5 text-right">Amount</th>
              <th scope="col" className="px-5 py-3.5 text-center">Status</th>
              <th scope="col" className="px-5 py-3.5 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {filteredSubscriptions.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-5 py-12 text-center text-slate-400">
                  <div className="flex flex-col items-center justify-center">
                    <AlertCircle className="h-8 w-8 text-slate-300 mb-2" />
                    <p className="text-sm font-medium text-slate-600">No subscriptions match your filter</p>
                    <p className="text-xs text-slate-400 mt-1">Try adjusting the search query or status tab.</p>
                  </div>
                </td>
              </tr>
            ) : (
              filteredSubscriptions.map((sub) => {
                const plan = sub.items[0];
                const cycle = sub.billingCycle || plan?.billingCycle || "Monthly";
                const isCopied = copiedId === sub.id;

                return (
                  <tr
                    key={sub.id}
                    onClick={() => setSelectedSubscription(sub)}
                    className="hover:bg-slate-50/70 transition-colors cursor-pointer group"
                  >
                    {/* Subscription ID */}
                    <td className="px-5 py-4 font-mono text-xs font-semibold text-slate-900">
                      <div className="flex items-center gap-1.5">
                        <span className="bg-slate-100 text-slate-800 px-2 py-0.5 rounded-md border border-slate-200/80">
                          {sub.id}
                        </span>
                        <button
                          onClick={(e) => handleCopy(sub.id, e)}
                          title="Copy ID"
                          className="p-1 text-slate-400 hover:text-indigo-600 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          {isCopied ? (
                            <Check className="h-3.5 w-3.5 text-emerald-600" />
                          ) : (
                            <Copy className="h-3.5 w-3.5" />
                          )}
                        </button>
                      </div>
                    </td>

                    {/* Customer Name */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-700 font-bold text-xs border border-indigo-100 shrink-0">
                          {sub.customerName
                            .split(" ")
                            .map((w) => w[0])
                            .slice(0, 2)
                            .join("")}
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="font-semibold text-slate-900 text-xs sm:text-sm truncate">
                            {sub.customerName}
                          </span>
                          <span className="text-[11px] text-slate-400 truncate">
                            {sub.customerEmail}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Product / Plan */}
                    <td className="px-5 py-4">
                      <div className="flex flex-col">
                        <span className="font-medium text-slate-900 text-xs">
                          {sub.productName || "SubscriptIQ Cloud"}
                        </span>
                        <span className="text-[11px] text-slate-500">
                          {plan?.planName || "Enterprise Dedicated"}
                        </span>
                      </div>
                    </td>

                    {/* Billing Cycle */}
                    <td className="px-5 py-4">
                      <span className="inline-flex items-center rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700 border border-slate-200/60">
                        {cycle}
                      </span>
                    </td>

                    {/* Start Date */}
                    <td className="px-5 py-4 text-xs text-slate-600 whitespace-nowrap">
                      {formatDate(sub.currentPeriodStart, "MMM dd, yyyy")}
                    </td>

                    {/* Amount */}
                    <td className="px-5 py-4 text-right">
                      <div className="flex flex-col items-end">
                        <span className="font-bold text-slate-900 text-xs sm:text-sm">
                          {formatCurrency(plan?.unitAmount || sub.mrr)}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          /{cycle.toLowerCase().replace("ly", "")}
                        </span>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="px-5 py-4 text-center whitespace-nowrap">
                      <StatusBadge status={sub.status} />
                    </td>

                    {/* Action */}
                    <td className="px-5 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedSubscription(sub)}
                        className="text-xs text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50/70 font-semibold h-8 rounded-lg"
                      >
                        View
                      </Button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Subscription Details Dialog Modal */}
      <Dialog
        open={!!selectedSubscription}
        onOpenChange={(open) => !open && setSelectedSubscription(null)}
      >
        {selectedSubscription && (
          <DialogContent className="sm:max-w-lg rounded-2xl">
            <DialogHeader>
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100">
                    <Layers className="h-5 w-5" />
                  </div>
                  <div>
                    <DialogTitle className="text-base font-bold text-slate-900">
                      Subscription #{selectedSubscription.id}
                    </DialogTitle>
                    <DialogDescription className="text-xs text-slate-500">
                      Contract details and subscriber telemetry
                    </DialogDescription>
                  </div>
                </div>
                <StatusBadge status={selectedSubscription.status} />
              </div>
            </DialogHeader>

            <div className="space-y-4 py-2 text-xs">
              {/* Customer Box */}
              <div className="rounded-xl bg-slate-50 p-3.5 border border-slate-200/80">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                  Customer Profile
                </span>
                <div className="flex items-center justify-between mt-1.5">
                  <p className="font-bold text-sm text-slate-900">{selectedSubscription.customerName}</p>
                  <span className="font-mono text-slate-500">{selectedSubscription.customerId}</span>
                </div>
                <p className="text-slate-500 mt-0.5">{selectedSubscription.customerEmail}</p>
              </div>

              {/* Plan & Pricing */}
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-slate-200/80 p-3">
                  <span className="text-[10px] font-semibold text-slate-400 uppercase">Product & Plan</span>
                  <p className="font-bold text-slate-900 mt-1">
                    {selectedSubscription.productName || "SubscriptIQ Cloud"}
                  </p>
                  <p className="text-slate-500 text-[11px]">
                    {selectedSubscription.items[0]?.planName || "Enterprise"}
                  </p>
                </div>
                <div className="rounded-xl border border-slate-200/80 p-3">
                  <span className="text-[10px] font-semibold text-slate-400 uppercase">Contract Value</span>
                  <p className="font-bold text-indigo-600 text-base mt-1">
                    {formatCurrency(selectedSubscription.items[0]?.unitAmount || selectedSubscription.mrr)}
                  </p>
                  <p className="text-slate-500 text-[11px]">
                    Cadence: {selectedSubscription.billingCycle || "Monthly"}
                  </p>
                </div>
              </div>

              {/* Period Dates */}
              <div className="rounded-xl border border-slate-200/80 p-3 space-y-1.5">
                <div className="flex justify-between text-slate-600">
                  <span>Current Period Start:</span>
                  <span className="font-semibold text-slate-900">
                    {formatDate(selectedSubscription.currentPeriodStart, "MMMM dd, yyyy")}
                  </span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Current Period End:</span>
                  <span className="font-semibold text-slate-900">
                    {formatDate(selectedSubscription.currentPeriodEnd, "MMMM dd, yyyy")}
                  </span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Monthly Recurring Revenue:</span>
                  <span className="font-semibold text-slate-900">
                    {formatCurrency(selectedSubscription.mrr)} / mo
                  </span>
                </div>
              </div>
            </div>

            <DialogFooter className="sm:justify-between items-center gap-2 border-t pt-4 border-slate-100">
              <div className="flex items-center gap-1.5">
                {selectedSubscription.status !== "active" && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleUpdateStatus(selectedSubscription.id, "active")}
                    className="text-xs text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 border-emerald-200"
                  >
                    <PlayCircle className="mr-1.5 h-3.5 w-3.5" />
                    Activate
                  </Button>
                )}
                {selectedSubscription.status === "active" && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleUpdateStatus(selectedSubscription.id, "paused")}
                    className="text-xs text-amber-600 hover:text-amber-700 hover:bg-amber-50 border-amber-200"
                  >
                    <PauseCircle className="mr-1.5 h-3.5 w-3.5" />
                    Pause
                  </Button>
                )}
                {selectedSubscription.status !== "cancelled" && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleUpdateStatus(selectedSubscription.id, "cancelled")}
                    className="text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 border-rose-200"
                  >
                    <XCircle className="mr-1.5 h-3.5 w-3.5" />
                    Cancel
                  </Button>
                )}
              </div>

              <Button
                type="button"
                variant="ghost"
                onClick={() => setSelectedSubscription(null)}
                className="text-xs"
              >
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
}

