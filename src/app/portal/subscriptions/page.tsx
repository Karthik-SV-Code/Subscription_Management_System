"use client";

import * as React from "react";
import Link from "next/link";
import {
  Repeat,
  PauseCircle,
  PlayCircle,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Layers,
  ArrowUpRight,
  Info,
  Clock,
  Sparkles,
  XCircle,
} from "lucide-react";
import { PortalHeader } from "@/components/portal/portal-header";
import { PORTAL_SUBSCRIPTIONS } from "@/features/portal/mock-data";
import { Subscription } from "@/types/subscription";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

export default function PortalSubscriptionsPage() {
  const [subscriptions, setSubscriptions] = React.useState<Subscription[]>(
    PORTAL_SUBSCRIPTIONS
  );
  const [searchQuery, setSearchQuery] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<string>("all");

  // Dialog States
  const [selectedSub, setSelectedSub] = React.useState<Subscription | null>(null);
  const [showDetails, setShowDetails] = React.useState(false);
  const [showCancel, setShowCancel] = React.useState(false);
  const [showPause, setShowPause] = React.useState(false);
  const [cancelReason, setCancelReason] = React.useState("");
  const [actionNotice, setActionNotice] = React.useState<string | null>(null);

  // Filter Logic
  const filteredSubs = subscriptions.filter((sub) => {
    const matchesSearch =
      (sub.productName || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (sub.items[0]?.planName || "").toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === "all" ? true : sub.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Action handlers
  const handleOpenCancel = (sub: Subscription) => {
    setSelectedSub(sub);
    setCancelReason("");
    setShowCancel(true);
  };

  const handleConfirmCancel = () => {
    if (!selectedSub) return;
    setSubscriptions((prev) =>
      prev.map((s) =>
        s.id === selectedSub.id
          ? { ...s, status: "cancelled", cancelAtPeriodEnd: true }
          : s
      )
    );
    setShowCancel(false);
    setActionNotice(
      `Subscription for ${selectedSub.productName} scheduled for cancellation at the end of the billing term.`
    );
    setTimeout(() => setActionNotice(null), 5000);
  };

  const handleOpenPause = (sub: Subscription) => {
    setSelectedSub(sub);
    setShowPause(true);
  };

  const handleConfirmPauseToggle = () => {
    if (!selectedSub) return;
    const isPaused = selectedSub.status === "paused";
    const newStatus = isPaused ? "active" : "paused";

    setSubscriptions((prev) =>
      prev.map((s) =>
        s.id === selectedSub.id ? { ...s, status: newStatus } : s
      )
    );
    setShowPause(false);
    setActionNotice(
      isPaused
        ? `Subscription for ${selectedSub.productName} has been resumed.`
        : `Subscription for ${selectedSub.productName} has been temporarily paused.`
    );
    setTimeout(() => setActionNotice(null), 5000);
  };

  return (
    <div className="flex-1 flex flex-col min-w-0 pb-16">
      <PortalHeader
        title="My Subscriptions"
        subtitle="Manage services, adjust tiers, or pause active billing cycles"
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search products or plans..."
      />

      <main className="flex-1 px-4 sm:px-8 pt-6 max-w-7xl w-full mx-auto space-y-6">
        {/* Banner Alert for Recent Actions */}
        {actionNotice && (
          <div className="p-4 rounded-[16px] bg-white border border-[#EAECEF] shadow-xs flex items-center justify-between text-xs animate-in fade-in slide-in-from-top-1">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="text-[#171717] font-medium">{actionNotice}</span>
            </div>
            <button
              onClick={() => setActionNotice(null)}
              className="text-[#737373] hover:text-[#171717] font-semibold"
            >
              &times;
            </button>
          </div>
        )}

        {/* Filters and CTA bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          {/* Status Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
            {["all", "active", "paused", "cancelled"].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold capitalize transition-all shrink-0 ${
                  statusFilter === st
                    ? "bg-[#171717] text-white shadow-xs"
                    : "bg-white text-[#737373] hover:text-[#171717] border border-[#EAECEF]"
                }`}
              >
                {st === "all" ? "All Subscriptions" : st}
              </button>
            ))}
          </div>

          <Link href="/portal/plans">
            <Button className="bg-[#171717] hover:bg-black text-white text-xs rounded-xl h-9 px-4 font-semibold shadow-xs">
              <Sparkles className="w-3.5 h-3.5 mr-1.5 text-indigo-400" />
              Browse New Plans
            </Button>
          </Link>
        </div>

        {/* Subscriptions Grid Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSubs.map((sub) => {
            const item = sub.items[0];
            const isPaused = sub.status === "paused";
            const isCancelled = sub.status === "cancelled";

            return (
              <div
                key={sub.id}
                className="rounded-[20px] bg-white border border-[#EAECEF] p-6 shadow-[0_2px_10px_rgba(0,0,0,0.03)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.06)] transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Top Status & Cycle */}
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 bg-[#F5F6F8] px-2.5 py-1 rounded-md">
                      {sub.billingCycle} Billing
                    </span>
                    <div>
                      {sub.status === "active" && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          Active
                        </span>
                      )}
                      {sub.status === "paused" && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                          Paused
                        </span>
                      )}
                      {sub.status === "cancelled" && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                          Cancelled
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Product & Plan title */}
                  <h3 className="text-base font-extrabold text-[#171717] tracking-tight">
                    {sub.productName}
                  </h3>
                  <p className="text-xs text-[#737373] mt-0.5">
                    {item?.planName}
                  </p>

                  {/* Pricing info */}
                  <div className="my-5 p-4 rounded-xl bg-[#F5F6F8] border border-[#EAECEF]/80">
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-black text-[#171717]">
                        {formatCurrency(item?.unitAmount || sub.mrr)}
                      </span>
                      <span className="text-xs text-[#737373]">
                        /{sub.billingCycle === "Annual" ? "year" : "month"}
                      </span>
                    </div>
                    <div className="text-[11px] text-[#737373] mt-1 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      Renews on: {formatDate(sub.currentPeriodEnd)}
                    </div>
                  </div>

                  {/* Key metadata points */}
                  <div className="space-y-1.5 text-xs text-[#737373] mb-6">
                    <div className="flex justify-between">
                      <span>Subscription ID:</span>
                      <span className="font-mono text-[#171717] text-[11px]">
                        {sub.id}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Term Started:</span>
                      <span className="text-[#171717]">
                        {formatDate(sub.currentPeriodStart)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions Row */}
                <div className="pt-4 border-t border-[#EAECEF] flex flex-wrap items-center justify-between gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedSub(sub);
                      setShowDetails(true);
                    }}
                    className="h-8 rounded-xl text-xs font-semibold border-[#EAECEF] text-[#171717] hover:bg-slate-50"
                  >
                    Details
                  </Button>

                  <div className="flex items-center gap-2">
                    {!isCancelled && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleOpenPause(sub)}
                        className="h-8 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                      >
                        {isPaused ? "Resume" : "Pause"}
                      </Button>
                    )}

                    {!isCancelled && (
                      <Link href="/portal/plans">
                        <Button
                          size="sm"
                          className="h-8 rounded-xl text-xs font-semibold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200"
                        >
                          Upgrade
                        </Button>
                      </Link>
                    )}

                    {!isCancelled && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleOpenCancel(sub)}
                        className="h-8 rounded-xl text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                      >
                        Cancel
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filteredSubs.length === 0 && (
          <div className="rounded-[20px] bg-white border border-[#EAECEF] p-12 text-center">
            <Repeat className="w-10 h-10 text-slate-400 mx-auto mb-3" />
            <h4 className="text-sm font-bold text-[#171717]">
              No subscriptions found
            </h4>
            <p className="text-xs text-[#737373] mt-1">
              Try adjusting your search query or status filter.
            </p>
          </div>
        )}
      </main>

      {/* Subscription Details Dialog */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="max-w-md bg-white rounded-[20px] p-6 border-[#EAECEF]">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-[#171717]">
              Subscription Details
            </DialogTitle>
            <DialogDescription className="text-xs text-[#737373]">
              Contract terms and billing configuration for {selectedSub?.productName}
            </DialogDescription>
          </DialogHeader>

          {selectedSub && (
            <div className="space-y-4 py-2 text-xs">
              <div className="p-3.5 rounded-xl bg-[#F5F6F8] space-y-2">
                <div className="flex justify-between">
                  <span className="text-[#737373]">Product:</span>
                  <span className="font-bold text-[#171717]">{selectedSub.productName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#737373]">Plan Name:</span>
                  <span className="font-semibold text-[#171717]">{selectedSub.items[0]?.planName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#737373]">Status:</span>
                  <span className="capitalize font-semibold text-indigo-600">{selectedSub.status}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#737373]">Billing Cycle:</span>
                  <span className="text-[#171717]">{selectedSub.billingCycle}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#737373]">Unit Amount:</span>
                  <span className="font-bold text-[#171717]">{formatCurrency(selectedSub.items[0]?.unitAmount || selectedSub.mrr)}</span>
                </div>
              </div>

              <div className="space-y-2 text-[#737373]">
                <div className="flex justify-between">
                  <span>Current Period Start:</span>
                  <span className="text-[#171717]">{formatDate(selectedSub.currentPeriodStart)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Current Period End:</span>
                  <span className="text-[#171717]">{formatDate(selectedSub.currentPeriodEnd)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Auto-Renew:</span>
                  <span className="text-[#171717]">{selectedSub.cancelAtPeriodEnd ? "Disabled (Cancels at end)" : "Enabled"}</span>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              onClick={() => setShowDetails(false)}
              className="w-full bg-[#171717] hover:bg-black text-white text-xs rounded-xl"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cancel Confirmation Dialog */}
      <Dialog open={showCancel} onOpenChange={setShowCancel}>
        <DialogContent className="max-w-md bg-white rounded-[20px] p-6 border-[#EAECEF]">
          <DialogHeader>
            <div className="w-10 h-10 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mb-2">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <DialogTitle className="text-base font-bold text-[#171717]">
              Cancel Subscription?
            </DialogTitle>
            <DialogDescription className="text-xs text-[#737373]">
              Are you sure you want to cancel your subscription to{" "}
              <strong>{selectedSub?.productName}</strong>? You will keep full access
              until the end of your billing period on{" "}
              {selectedSub && formatDate(selectedSub.currentPeriodEnd)}.
            </DialogDescription>
          </DialogHeader>

          <div className="py-2">
            <label className="text-[11px] font-semibold text-[#737373] block mb-1">
              Reason for cancellation (optional):
            </label>
            <textarea
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="Tell us what we could have done better..."
              className="w-full h-20 text-xs p-3 rounded-xl border border-[#EAECEF] bg-[#F5F6F8] focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500/20"
            />
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setShowCancel(false)}
              className="rounded-xl text-xs border-[#EAECEF]"
            >
              Keep Subscription
            </Button>
            <Button
              onClick={handleConfirmCancel}
              className="bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold"
            >
              Confirm Cancellation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Pause/Resume Dialog */}
      <Dialog open={showPause} onOpenChange={setShowPause}>
        <DialogContent className="max-w-md bg-white rounded-[20px] p-6 border-[#EAECEF]">
          <DialogHeader>
            <div className="w-10 h-10 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mb-2">
              <PauseCircle className="w-5 h-5" />
            </div>
            <DialogTitle className="text-base font-bold text-[#171717]">
              {selectedSub?.status === "paused" ? "Resume Subscription" : "Pause Subscription"}
            </DialogTitle>
            <DialogDescription className="text-xs text-[#737373]">
              {selectedSub?.status === "paused"
                ? `Ready to reactivate ${selectedSub?.productName}? Billing and full system access will resume immediately.`
                : `Pausing halts future billing cycles for up to 90 days. You will retain read-only access to your records.`}
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setShowPause(false)}
              className="rounded-xl text-xs border-[#EAECEF]"
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirmPauseToggle}
              className="bg-[#171717] hover:bg-black text-white rounded-xl text-xs font-semibold"
            >
              {selectedSub?.status === "paused" ? "Resume Service" : "Confirm Pause"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
