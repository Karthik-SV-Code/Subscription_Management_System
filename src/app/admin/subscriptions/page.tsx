"use client";

import * as React from "react";
import {
  Repeat,
  Search,
  CheckCircle2,
  Clock,
  AlertCircle,
  PauseCircle,
  XCircle,
  Eye,
  Download,
  Filter,
  DollarSign,
  ArrowUpRight,
} from "lucide-react";
import { AdminHeader } from "@/components/admin/admin-header";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatCurrency, downloadCSV } from "@/lib/utils";

interface AdminSubContract {
  id: string;
  subNumber: string;
  customerName: string;
  customerEmail: string;
  planName: string;
  billingCycle: "Monthly" | "Annual" | "Quarterly";
  amount: number;
  status: "active" | "trialing" | "past_due" | "paused" | "canceled";
  nextRenewal: string;
  startDate: string;
}

const INITIAL_SUBSCRIPTIONS: AdminSubContract[] = [
  {
    id: "sub_01",
    subNumber: "SUB-8921",
    customerName: "Acme Technologies Inc.",
    customerEmail: "billing@acme-tech.com",
    planName: "Enterprise Dedicated",
    billingCycle: "Annual",
    amount: 9600,
    status: "active",
    nextRenewal: "Jan 15, 2027",
    startDate: "Jan 15, 2025",
  },
  {
    id: "sub_02",
    subNumber: "SUB-8920",
    customerName: "Nexus Cloud Dynamics",
    customerEmail: "finance@nexuscloud.io",
    planName: "Growth Scale",
    billingCycle: "Monthly",
    amount: 499,
    status: "active",
    nextRenewal: "Nov 30, 2026",
    startDate: "Mar 22, 2025",
  },
  {
    id: "sub_03",
    subNumber: "SUB-8919",
    customerName: "QuantumWave AI Labs",
    customerEmail: "ops@quantumwave.ai",
    planName: "Predictive Intelligence",
    billingCycle: "Monthly",
    amount: 799,
    status: "trialing",
    nextRenewal: "Nov 02, 2026",
    startDate: "Oct 18, 2026",
  },
  {
    id: "sub_04",
    subNumber: "SUB-8918",
    customerName: "Horizon Fintech Corp",
    customerEmail: "treasury@horizonfin.co",
    planName: "Business Pro Tier",
    billingCycle: "Annual",
    amount: 2700,
    status: "active",
    nextRenewal: "May 11, 2027",
    startDate: "May 11, 2025",
  },
  {
    id: "sub_05",
    subNumber: "SUB-8917",
    customerName: "BluePeak Analytics",
    customerEmail: "accounts@bluepeakanalytics.com",
    planName: "Growth Scale",
    billingCycle: "Monthly",
    amount: 499,
    status: "paused",
    nextRenewal: "Paused",
    startDate: "Feb 08, 2025",
  },
  {
    id: "sub_06",
    subNumber: "SUB-8916",
    customerName: "Apex Global Systems",
    customerEmail: "ap@apexglobal.net",
    planName: "Enterprise Suite",
    billingCycle: "Quarterly",
    amount: 3200,
    status: "past_due",
    nextRenewal: "Oct 28, 2026",
    startDate: "Apr 04, 2025",
  },
  {
    id: "sub_07",
    subNumber: "SUB-8915",
    customerName: "Vortex Media Group",
    customerEmail: "billing@vortexmedia.co.uk",
    planName: "Starter Basic",
    billingCycle: "Monthly",
    amount: 199,
    status: "canceled",
    nextRenewal: "Terminated",
    startDate: "Nov 12, 2024",
  },
];

export default function AdminSubscriptionsPage() {
  const [subscriptions, setSubscriptions] = React.useState<AdminSubContract[]>(INITIAL_SUBSCRIPTIONS);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("All");
  const [selectedSub, setSelectedSub] = React.useState<AdminSubContract | null>(null);
  const [actionNotice, setActionNotice] = React.useState<string | null>(null);

  const notify = (msg: string) => {
    setActionNotice(msg);
    setTimeout(() => setActionNotice(null), 4000);
  };

  const filtered = React.useMemo(() => {
    return subscriptions.filter((s) => {
      const q = searchQuery.toLowerCase();
      const matchSearch =
        s.subNumber.toLowerCase().includes(q) ||
        s.customerName.toLowerCase().includes(q) ||
        s.customerEmail.toLowerCase().includes(q) ||
        s.planName.toLowerCase().includes(q);

      const matchStatus =
        statusFilter === "All" || s.status === statusFilter.toLowerCase();

      return matchSearch && matchStatus;
    });
  }, [subscriptions, searchQuery, statusFilter]);

  const handleExport = () => {
    const rows = filtered.map((s) => ({
      ContractID: s.subNumber,
      Customer: s.customerName,
      Email: s.customerEmail,
      Plan: s.planName,
      Cycle: s.billingCycle,
      Amount: s.amount,
      Status: s.status,
      Renewal: s.nextRenewal,
      StartDate: s.startDate,
    }));
    downloadCSV(
      `subscriptiq_admin_subscriptions_${new Date().toISOString().slice(0, 10)}`,
      rows as unknown as Record<string, unknown>[]
    );
    notify("Exported subscription contracts to CSV.");
  };

  const handleTogglePause = (subId: string) => {
    setSubscriptions((prev) =>
      prev.map((s) => {
        if (s.id === subId) {
          const next = s.status === "paused" ? "active" : "paused";
          notify(`Subscription ${s.subNumber} marked as ${next}.`);
          return { ...s, status: next };
        }
        return s;
      })
    );
  };

  return (
    <>
      <AdminHeader
        title="Subscription Overview"
        subtitle="Active recurring contracts, billing cycles, renewals, and lifecycle status"
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Filter contracts by ID, customer, plan..."
        onExportCSV={handleExport}
      />

      <main className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto space-y-6">
        {actionNotice && (
          <div className="p-3.5 rounded-[16px] bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center justify-between animate-in fade-in">
            <span>✓ {actionNotice}</span>
            <button
              onClick={() => setActionNotice(null)}
              className="text-emerald-700 hover:text-emerald-900 underline text-xs"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-6 rounded-[20px] border border-[#EAECEF] shadow-[0_2px_10px_rgba(0,0,0,0.03)]">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#737373]">
              Active Contracts
            </span>
            <div className="text-3xl font-extrabold text-[#171717] mt-3">
              1,284
            </div>
            <div className="text-xs text-emerald-600 mt-1 font-semibold">+8.5% MoM</div>
          </div>

          <div className="bg-white p-6 rounded-[20px] border border-[#EAECEF] shadow-[0_2px_10px_rgba(0,0,0,0.03)]">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#737373]">
              Annual Subscriptions
            </span>
            <div className="text-3xl font-extrabold text-purple-600 mt-3">
              412
            </div>
            <div className="text-xs text-[#737373] mt-1">32.1% of total book</div>
          </div>

          <div className="bg-white p-6 rounded-[20px] border border-[#EAECEF] shadow-[0_2px_10px_rgba(0,0,0,0.03)]">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#737373]">
              Trial Inflow
            </span>
            <div className="text-3xl font-extrabold text-blue-600 mt-3">
              38
            </div>
            <div className="text-xs text-[#737373] mt-1">68% projected conversion</div>
          </div>

          <div className="bg-white p-6 rounded-[20px] border border-[#EAECEF] shadow-[0_2px_10px_rgba(0,0,0,0.03)]">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#737373]">
              Past Due Accounts
            </span>
            <div className="text-3xl font-extrabold text-rose-600 mt-3">
              14
            </div>
            <div className="text-xs text-[#737373] mt-1">Automated dunning active</div>
          </div>
        </div>

        {/* Filter Strip */}
        <div className="bg-white p-4 rounded-[20px] border border-[#EAECEF] shadow-[0_2px_10px_rgba(0,0,0,0.03)] flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-[#737373]" />
            <span className="text-xs font-bold text-[#171717]">Status:</span>
            {["All", "Active", "Trialing", "Past_due", "Paused", "Canceled"].map(
              (s) => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={`px-3 py-1.5 rounded-[12px] text-xs font-semibold transition-all ${
                    statusFilter === s
                      ? "bg-[#171717] text-white"
                      : "bg-[#F5F6F8] text-[#737373] hover:text-[#171717]"
                  }`}
                >
                  {s.replace("_", " ")}
                </button>
              )
            )}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={handleExport}
            className="rounded-[12px] text-xs font-semibold border-[#EAECEF]"
          >
            <Download className="w-3.5 h-3.5 mr-1.5 text-[#737373]" />
            Export Contracts
          </Button>
        </div>

        {/* Subscription Contracts Table */}
        <div className="bg-white rounded-[20px] border border-[#EAECEF] shadow-[0_2px_10px_rgba(0,0,0,0.03)] overflow-hidden">
          <div className="p-6 border-b border-[#EAECEF] flex items-center justify-between">
            <h3 className="text-sm font-bold text-[#171717]">
              Subscription Contracts Ledger
            </h3>
            <span className="text-xs text-[#737373]">
              Showing {filtered.length} of {subscriptions.length} records
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#EAECEF] bg-[#F5F6F8]/60 text-[#737373] font-semibold">
                  <th className="py-3.5 px-6">Contract ID</th>
                  <th className="py-3.5 px-6">Customer</th>
                  <th className="py-3.5 px-6">Plan & Cycle</th>
                  <th className="py-3.5 px-6">Billing Amount</th>
                  <th className="py-3.5 px-6">Status</th>
                  <th className="py-3.5 px-6">Next Renewal</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EAECEF]">
                {filtered.map((sub) => (
                  <tr key={sub.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-4 px-6 font-mono font-bold text-[#171717]">
                      {sub.subNumber}
                    </td>
                    <td className="py-4 px-6">
                      <div className="font-bold text-[#171717]">{sub.customerName}</div>
                      <div className="text-[11px] text-[#737373]">{sub.customerEmail}</div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="font-semibold text-[#171717]">{sub.planName}</div>
                      <span className="inline-block mt-0.5 px-2 py-0.5 rounded-md bg-slate-100 text-[10px] text-[#737373]">
                        {sub.billingCycle}
                      </span>
                    </td>
                    <td className="py-4 px-6 font-bold text-[#171717]">
                      {formatCurrency(sub.amount)}
                    </td>
                    <td className="py-4 px-6">
                      {sub.status === "active" && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100">
                          <CheckCircle2 className="w-3 h-3" /> Active
                        </span>
                      )}
                      {sub.status === "trialing" && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-purple-50 text-purple-700 border border-purple-200">
                          <Clock className="w-3 h-3" /> Trialing
                        </span>
                      )}
                      {sub.status === "past_due" && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                          <AlertCircle className="w-3 h-3" /> Past Due
                        </span>
                      )}
                      {sub.status === "paused" && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                          <PauseCircle className="w-3 h-3" /> Paused
                        </span>
                      )}
                      {sub.status === "canceled" && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                          <XCircle className="w-3 h-3" /> Canceled
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-[#737373]">
                      {sub.nextRenewal}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedSub(sub)}
                          className="h-8 px-2 rounded-[10px] text-xs text-indigo-600 hover:bg-indigo-50"
                        >
                          <Eye className="w-3.5 h-3.5 mr-1" />
                          View
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleTogglePause(sub.id)}
                          className="h-8 px-2 rounded-[10px] text-xs text-slate-700 hover:bg-slate-100"
                        >
                          {sub.status === "paused" ? "Resume" : "Pause"}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Subscription Detail Dialog */}
      <Dialog open={!!selectedSub} onOpenChange={(o) => !o && setSelectedSub(null)}>
        <DialogContent className="max-w-md rounded-[20px] bg-white border border-[#EAECEF] p-6 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-[#171717]">
              Subscription Contract #{selectedSub?.subNumber}
            </DialogTitle>
            <DialogDescription className="text-xs text-[#737373]">
              Contractual terms and recurring billing schedule
            </DialogDescription>
          </DialogHeader>

          {selectedSub && (
            <div className="space-y-4 pt-2 text-xs">
              <div className="p-3.5 rounded-[14px] bg-[#F5F6F8] border border-[#EAECEF] space-y-1">
                <div className="text-[10px] uppercase font-bold text-[#737373]">
                  Subscriber
                </div>
                <div className="text-sm font-bold text-[#171717]">
                  {selectedSub.customerName}
                </div>
                <div className="text-[#737373]">{selectedSub.customerEmail}</div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-[12px] bg-[#F5F6F8] border border-[#EAECEF]">
                  <div className="text-[10px] uppercase font-bold text-[#737373]">
                    Recurring Tier
                  </div>
                  <div className="font-bold text-[#171717] mt-0.5">
                    {selectedSub.planName}
                  </div>
                </div>
                <div className="p-3 rounded-[12px] bg-[#F5F6F8] border border-[#EAECEF]">
                  <div className="text-[10px] uppercase font-bold text-[#737373]">
                    Amount
                  </div>
                  <div className="font-bold text-emerald-700 mt-0.5">
                    {formatCurrency(selectedSub.amount)} / {selectedSub.billingCycle}
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-[12px] bg-[#F5F6F8] border border-[#EAECEF] flex justify-between">
                <div>
                  <div className="text-[10px] uppercase font-bold text-[#737373]">
                    Inception Date
                  </div>
                  <div className="font-medium text-[#171717] mt-0.5">{selectedSub.startDate}</div>
                </div>
                <div>
                  <div className="text-[10px] uppercase font-bold text-[#737373]">
                    Renewal Schedule
                  </div>
                  <div className="font-medium text-[#171717] mt-0.5">{selectedSub.nextRenewal}</div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedSub(null)}
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

