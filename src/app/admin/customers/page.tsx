"use client";

import * as React from "react";
import {
  Users,
  Search,
  Building,
  Mail,
  Repeat,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowUpRight,
  Eye,
  Download,
  Filter,
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

interface AdminCustomer {
  id: string;
  name: string;
  email: string;
  companyName: string;
  status: "active" | "inactive" | "churned" | "trial";
  mrr: number;
  activeSubscriptionsCount: number;
  country: string;
  joinedDate: string;
}

const MOCK_ADMIN_CUSTOMERS: AdminCustomer[] = [
  {
    id: "cus_01",
    name: "Alex Sterling",
    email: "billing@acme-tech.com",
    companyName: "Acme Technologies Inc.",
    status: "active",
    mrr: 9600,
    activeSubscriptionsCount: 3,
    country: "United States",
    joinedDate: "Jan 15, 2025",
  },
  {
    id: "cus_02",
    name: "Elena Rostova",
    email: "finance@nexuscloud.io",
    companyName: "Nexus Cloud Dynamics",
    status: "active",
    mrr: 499,
    activeSubscriptionsCount: 1,
    country: "Germany",
    joinedDate: "Mar 22, 2025",
  },
  {
    id: "cus_03",
    name: "Marcus Vance",
    email: "ap@apexglobal.net",
    companyName: "Apex Global Systems",
    status: "active",
    mrr: 3200,
    activeSubscriptionsCount: 2,
    country: "United Kingdom",
    joinedDate: "Apr 04, 2025",
  },
  {
    id: "cus_04",
    name: "Dr. Aris Thorne",
    email: "ops@quantumwave.ai",
    companyName: "QuantumWave AI Labs",
    status: "trial",
    mrr: 799,
    activeSubscriptionsCount: 1,
    country: "Canada",
    joinedDate: "Oct 18, 2026",
  },
  {
    id: "cus_05",
    name: "Claire Becker",
    email: "treasury@horizonfin.co",
    companyName: "Horizon Fintech Corp",
    status: "active",
    mrr: 2700,
    activeSubscriptionsCount: 2,
    country: "United States",
    joinedDate: "May 11, 2025",
  },
  {
    id: "cus_06",
    name: "Vikram Malhotra",
    email: "accounts@bluepeakanalytics.com",
    companyName: "BluePeak Analytics",
    status: "inactive",
    mrr: 499,
    activeSubscriptionsCount: 0,
    country: "India",
    joinedDate: "Feb 08, 2025",
  },
  {
    id: "cus_07",
    name: "Liam O'Connor",
    email: "billing@vortexmedia.co.uk",
    companyName: "Vortex Media Group",
    status: "churned",
    mrr: 0,
    activeSubscriptionsCount: 0,
    country: "United Kingdom",
    joinedDate: "Nov 12, 2024",
  },
];

export default function AdminCustomersPage() {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<string>("All");
  const [selectedCustomer, setSelectedCustomer] = React.useState<AdminCustomer | null>(null);

  const filteredCustomers = React.useMemo(() => {
    return MOCK_ADMIN_CUSTOMERS.filter((c) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        c.name.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.companyName.toLowerCase().includes(q) ||
        c.country.toLowerCase().includes(q);

      const matchesStatus =
        statusFilter === "All" || c.status === statusFilter.toLowerCase();

      return matchesSearch && matchesStatus;
    });
  }, [searchQuery, statusFilter]);

  const handleExport = () => {
    const rows = filteredCustomers.map((c) => ({
      ID: c.id,
      Name: c.name,
      Email: c.email,
      Company: c.companyName,
      Status: c.status,
      MRR: c.mrr,
      ActiveSubscriptions: c.activeSubscriptionsCount,
      Country: c.country,
      Joined: c.joinedDate,
    }));
    downloadCSV(
      `subscriptiq_admin_customers_${new Date().toISOString().slice(0, 10)}`,
      rows as unknown as Record<string, unknown>[]
    );
  };

  const totalMRR = MOCK_ADMIN_CUSTOMERS.reduce((acc, c) => acc + c.mrr, 0);

  return (
    <>
      <AdminHeader
        title="Customer Overview"
        subtitle="Registered enterprise client accounts, contractual tiers, and lifetime value"
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search customer, domain, or country..."
        onExportCSV={handleExport}
      />

      <main className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto space-y-6">
        {/* Metric Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-6 rounded-[20px] border border-[#EAECEF] shadow-[0_2px_10px_rgba(0,0,0,0.03)]">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#737373]">
              Total Accounts
            </span>
            <div className="text-3xl font-extrabold text-[#171717] mt-3">
              942
            </div>
            <div className="text-xs text-[#737373] mt-1">Across 38 countries</div>
          </div>

          <div className="bg-white p-6 rounded-[20px] border border-[#EAECEF] shadow-[0_2px_10px_rgba(0,0,0,0.03)]">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#737373]">
              Active Subscribers
            </span>
            <div className="text-3xl font-extrabold text-emerald-600 mt-3">
              886
            </div>
            <div className="text-xs text-[#737373] mt-1">94.1% of customer base</div>
          </div>

          <div className="bg-white p-6 rounded-[20px] border border-[#EAECEF] shadow-[0_2px_10px_rgba(0,0,0,0.03)]">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#737373]">
              Avg Revenue / Account
            </span>
            <div className="text-3xl font-extrabold text-[#171717] mt-3">
              $2,470
            </div>
            <div className="text-xs text-emerald-600 mt-1 font-semibold">+8.4% expansion</div>
          </div>

          <div className="bg-white p-6 rounded-[20px] border border-[#EAECEF] shadow-[0_2px_10px_rgba(0,0,0,0.03)]">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#737373]">
              Enterprise Tier
            </span>
            <div className="text-3xl font-extrabold text-purple-600 mt-3">
              64
            </div>
            <div className="text-xs text-[#737373] mt-1">Contracts &gt; $2,500/mo</div>
          </div>
        </div>

        {/* Filters Strip */}
        <div className="bg-white p-4 rounded-[20px] border border-[#EAECEF] shadow-[0_2px_10px_rgba(0,0,0,0.03)] flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-[#737373]" />
            <span className="text-xs font-bold text-[#171717]">Status:</span>
            {["All", "Active", "Trial", "Inactive", "Churned"].map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-3 py-1.5 rounded-[12px] text-xs font-semibold transition-all ${
                  statusFilter === s
                    ? "bg-[#171717] text-white"
                    : "bg-[#F5F6F8] text-[#737373] hover:text-[#171717]"
                }`}
              >
                {s}
              </button>
            ))}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={handleExport}
            className="rounded-[12px] text-xs font-semibold border-[#EAECEF]"
          >
            <Download className="w-3.5 h-3.5 mr-1.5 text-[#737373]" />
            Export Customer Roster
          </Button>
        </div>

        {/* Customer Table */}
        <div className="bg-white rounded-[20px] border border-[#EAECEF] shadow-[0_2px_10px_rgba(0,0,0,0.03)] overflow-hidden">
          <div className="p-6 border-b border-[#EAECEF] flex items-center justify-between">
            <h3 className="text-sm font-bold text-[#171717]">
              Customer Accounts Roster
            </h3>
            <span className="text-xs text-[#737373]">
              Showing {filteredCustomers.length} results
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#EAECEF] bg-[#F5F6F8]/60 text-[#737373] font-semibold">
                  <th className="py-3.5 px-6">Customer & Company</th>
                  <th className="py-3.5 px-6">Status</th>
                  <th className="py-3.5 px-6">MRR</th>
                  <th className="py-3.5 px-6">Active Subscriptions</th>
                  <th className="py-3.5 px-6">Country</th>
                  <th className="py-3.5 px-6">Joined Date</th>
                  <th className="py-3.5 px-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EAECEF]">
                {filteredCustomers.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-4 px-6">
                      <div className="font-bold text-[#171717]">{c.companyName}</div>
                      <div className="text-[11px] text-[#737373]">{c.name} • {c.email}</div>
                    </td>
                    <td className="py-4 px-6">
                      {c.status === "active" && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100">
                          <CheckCircle2 className="w-3 h-3" /> Active
                        </span>
                      )}
                      {c.status === "trial" && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-purple-50 text-purple-700 border border-purple-200">
                          <Clock className="w-3 h-3" /> Trial
                        </span>
                      )}
                      {c.status === "inactive" && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                          Inactive
                        </span>
                      )}
                      {c.status === "churned" && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                          <XCircle className="w-3 h-3" /> Churned
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-6 font-bold text-[#171717]">
                      {formatCurrency(c.mrr)}/mo
                    </td>
                    <td className="py-4 px-6">
                      <span className="px-2.5 py-1 rounded-md bg-slate-100 font-semibold text-[#171717]">
                        {c.activeSubscriptionsCount} active
                      </span>
                    </td>
                    <td className="py-4 px-6 text-[#737373] font-medium">
                      {c.country}
                    </td>
                    <td className="py-4 px-6 text-[#737373]">
                      {c.joinedDate}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedCustomer(c)}
                        className="h-8 px-2.5 rounded-[10px] text-xs text-indigo-600 hover:text-indigo-900 hover:bg-indigo-50"
                      >
                        <Eye className="w-3.5 h-3.5 mr-1" />
                        Inspect
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Customer Modal */}
      <Dialog open={!!selectedCustomer} onOpenChange={(o) => !o && setSelectedCustomer(null)}>
        <DialogContent className="max-w-md rounded-[20px] bg-white border border-[#EAECEF] p-6 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-[#171717]">
              Customer Account Metadata
            </DialogTitle>
            <DialogDescription className="text-xs text-[#737373]">
              Enterprise account status and contractual history
            </DialogDescription>
          </DialogHeader>

          {selectedCustomer && (
            <div className="space-y-4 pt-2 text-xs">
              <div className="p-3.5 rounded-[14px] bg-[#F5F6F8] border border-[#EAECEF]">
                <div className="text-[10px] uppercase font-bold text-[#737373]">
                  Company
                </div>
                <div className="text-base font-bold text-[#171717]">
                  {selectedCustomer.companyName}
                </div>
                <div className="text-[#737373] mt-1">
                  Primary Contact: {selectedCustomer.name} ({selectedCustomer.email})
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-[12px] bg-[#F5F6F8] border border-[#EAECEF]">
                  <div className="text-[10px] uppercase font-bold text-[#737373]">
                    Monthly MRR
                  </div>
                  <div className="text-sm font-bold text-emerald-700 mt-0.5">
                    {formatCurrency(selectedCustomer.mrr)}
                  </div>
                </div>
                <div className="p-3 rounded-[12px] bg-[#F5F6F8] border border-[#EAECEF]">
                  <div className="text-[10px] uppercase font-bold text-[#737373]">
                    Subscriptions
                  </div>
                  <div className="text-sm font-bold text-[#171717] mt-0.5">
                    {selectedCustomer.activeSubscriptionsCount} Active
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedCustomer(null)}
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

