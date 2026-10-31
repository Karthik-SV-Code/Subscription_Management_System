"use client";

import * as React from "react";
import {
  Receipt,
  Search,
  CheckCircle2,
  Clock,
  AlertCircle,
  Eye,
  Download,
  Filter,
  FileText,
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

interface AdminInvoice {
  id: string;
  invoiceNumber: string;
  customerName: string;
  customerEmail: string;
  total: number;
  amountDue: number;
  status: "paid" | "pending" | "overdue" | "partially_paid";
  issueDate: string;
  dueDate: string;
  paidDate?: string;
}

const MOCK_INVOICES: AdminInvoice[] = [
  {
    id: "inv_01",
    invoiceNumber: "INV-2026-0248",
    customerName: "Acme Technologies Inc.",
    customerEmail: "billing@acme-tech.com",
    total: 9600,
    amountDue: 0,
    status: "paid",
    issueDate: "Oct 25, 2026",
    dueDate: "Oct 31, 2026",
    paidDate: "Oct 31, 2026",
  },
  {
    id: "inv_02",
    invoiceNumber: "INV-2026-0247",
    customerName: "Nexus Cloud Dynamics",
    customerEmail: "finance@nexuscloud.io",
    total: 499,
    amountDue: 0,
    status: "paid",
    issueDate: "Oct 24, 2026",
    dueDate: "Oct 31, 2026",
    paidDate: "Oct 31, 2026",
  },
  {
    id: "inv_03",
    invoiceNumber: "INV-2026-0246",
    customerName: "Apex Global Systems",
    customerEmail: "ap@apexglobal.net",
    total: 3200,
    amountDue: 3200,
    status: "overdue",
    issueDate: "Oct 10, 2026",
    dueDate: "Oct 24, 2026",
  },
  {
    id: "inv_04",
    invoiceNumber: "INV-2026-0245",
    customerName: "Horizon Fintech Corp",
    customerEmail: "treasury@horizonfin.co",
    total: 2700,
    amountDue: 0,
    status: "paid",
    issueDate: "Oct 22, 2026",
    dueDate: "Oct 30, 2026",
    paidDate: "Oct 30, 2026",
  },
  {
    id: "inv_05",
    invoiceNumber: "INV-2026-0244",
    customerName: "QuantumWave AI Labs",
    customerEmail: "ops@quantumwave.ai",
    total: 799,
    amountDue: 799,
    status: "pending",
    issueDate: "Oct 28, 2026",
    dueDate: "Nov 04, 2026",
  },
  {
    id: "inv_06",
    invoiceNumber: "INV-2026-0243",
    customerName: "BluePeak Analytics",
    customerEmail: "accounts@bluepeakanalytics.com",
    total: 1200,
    amountDue: 600,
    status: "partially_paid",
    issueDate: "Oct 15, 2026",
    dueDate: "Oct 29, 2026",
  },
];

export default function AdminInvoicesPage() {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("All");
  const [selectedInvoice, setSelectedInvoice] = React.useState<AdminInvoice | null>(null);

  const filteredInvoices = React.useMemo(() => {
    return MOCK_INVOICES.filter((inv) => {
      const q = searchQuery.toLowerCase();
      const matchSearch =
        inv.invoiceNumber.toLowerCase().includes(q) ||
        inv.customerName.toLowerCase().includes(q) ||
        inv.customerEmail.toLowerCase().includes(q);

      const matchStatus =
        statusFilter === "All" || inv.status === statusFilter.toLowerCase();

      return matchSearch && matchStatus;
    });
  }, [searchQuery, statusFilter]);

  const handleExport = () => {
    const rows = filteredInvoices.map((inv) => ({
      InvoiceNumber: inv.invoiceNumber,
      Customer: inv.customerName,
      Email: inv.customerEmail,
      Total: inv.total,
      AmountDue: inv.amountDue,
      Status: inv.status,
      IssueDate: inv.issueDate,
      DueDate: inv.dueDate,
    }));
    downloadCSV(
      `subscriptiq_admin_invoices_${new Date().toISOString().slice(0, 10)}`,
      rows as unknown as Record<string, unknown>[]
    );
  };

  return (
    <>
      <AdminHeader
        title="Invoice Overview"
        subtitle="Accounts receivable ledger, billing schedules, automated receipts & collection audits"
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search invoice #, customer name..."
        onExportCSV={handleExport}
      />

      <main className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto space-y-6">
        {/* Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-6 rounded-[20px] border border-[#EAECEF] shadow-[0_2px_10px_rgba(0,0,0,0.03)]">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#737373]">
              Billed This Month
            </span>
            <div className="text-3xl font-extrabold text-[#171717] mt-3">
              $71,200
            </div>
            <div className="text-xs text-emerald-600 mt-1 font-semibold">98.2% collection rate</div>
          </div>

          <div className="bg-white p-6 rounded-[20px] border border-[#EAECEF] shadow-[0_2px_10px_rgba(0,0,0,0.03)]">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#737373]">
              Settled Collections
            </span>
            <div className="text-3xl font-extrabold text-emerald-600 mt-3">
              $67,400
            </div>
            <div className="text-xs text-[#737373] mt-1">Direct wire & card</div>
          </div>

          <div className="bg-white p-6 rounded-[20px] border border-[#EAECEF] shadow-[0_2px_10px_rgba(0,0,0,0.03)]">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#737373]">
              Pending Due
            </span>
            <div className="text-3xl font-extrabold text-blue-600 mt-3">
              $799
            </div>
            <div className="text-xs text-[#737373] mt-1">Due within 7 days</div>
          </div>

          <div className="bg-white p-6 rounded-[20px] border border-[#EAECEF] shadow-[0_2px_10px_rgba(0,0,0,0.03)]">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#737373]">
              Overdue Receivables
            </span>
            <div className="text-3xl font-extrabold text-rose-600 mt-3">
              $3,800
            </div>
            <div className="text-xs text-rose-600 mt-1 font-semibold">Requires follow-up</div>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="bg-white p-4 rounded-[20px] border border-[#EAECEF] shadow-[0_2px_10px_rgba(0,0,0,0.03)] flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-[#737373]" />
            <span className="text-xs font-bold text-[#171717]">Status:</span>
            {["All", "Paid", "Pending", "Overdue", "Partially_Paid"].map((s) => (
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
            ))}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={handleExport}
            className="rounded-[12px] text-xs font-semibold border-[#EAECEF]"
          >
            <Download className="w-3.5 h-3.5 mr-1.5 text-[#737373]" />
            Export Invoice Ledger
          </Button>
        </div>

        {/* Invoice Table */}
        <div className="bg-white rounded-[20px] border border-[#EAECEF] shadow-[0_2px_10px_rgba(0,0,0,0.03)] overflow-hidden">
          <div className="p-6 border-b border-[#EAECEF] flex items-center justify-between">
            <h3 className="text-sm font-bold text-[#171717]">
              Billing Receivables Table
            </h3>
            <span className="text-xs text-[#737373]">
              Showing {filteredInvoices.length} invoices
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#EAECEF] bg-[#F5F6F8]/60 text-[#737373] font-semibold">
                  <th className="py-3.5 px-6">Invoice #</th>
                  <th className="py-3.5 px-6">Customer</th>
                  <th className="py-3.5 px-6">Total Amount</th>
                  <th className="py-3.5 px-6">Amount Due</th>
                  <th className="py-3.5 px-6">Status</th>
                  <th className="py-3.5 px-6">Due Date</th>
                  <th className="py-3.5 px-6 text-right">Inspect</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EAECEF]">
                {filteredInvoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-4 px-6 font-mono font-bold text-[#171717]">
                      {inv.invoiceNumber}
                    </td>
                    <td className="py-4 px-6">
                      <div className="font-bold text-[#171717]">{inv.customerName}</div>
                      <div className="text-[11px] text-[#737373]">{inv.customerEmail}</div>
                    </td>
                    <td className="py-4 px-6 font-bold text-[#171717]">
                      {formatCurrency(inv.total)}
                    </td>
                    <td className="py-4 px-6 font-semibold">
                      {inv.amountDue > 0 ? (
                        <span className="text-rose-600">{formatCurrency(inv.amountDue)}</span>
                      ) : (
                        <span className="text-[#737373]">$0.00</span>
                      )}
                    </td>
                    <td className="py-4 px-6">
                      {inv.status === "paid" && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100">
                          <CheckCircle2 className="w-3 h-3" /> Paid
                        </span>
                      )}
                      {inv.status === "pending" && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                          <Clock className="w-3 h-3" /> Pending
                        </span>
                      )}
                      {inv.status === "overdue" && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                          <AlertCircle className="w-3 h-3" /> Overdue
                        </span>
                      )}
                      {inv.status === "partially_paid" && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                          Partial
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-[#737373]">
                      {inv.dueDate}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedInvoice(inv)}
                        className="h-8 px-2.5 rounded-[10px] text-xs text-indigo-600 hover:bg-indigo-50"
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

      {/* Invoice Inspector Dialog */}
      <Dialog open={!!selectedInvoice} onOpenChange={(o) => !o && setSelectedInvoice(null)}>
        <DialogContent className="max-w-md rounded-[20px] bg-white border border-[#EAECEF] p-6 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-[#171717]">
              Invoice {selectedInvoice?.invoiceNumber}
            </DialogTitle>
            <DialogDescription className="text-xs text-[#737373]">
              Accounts receivable breakdown and settlement state
            </DialogDescription>
          </DialogHeader>

          {selectedInvoice && (
            <div className="space-y-4 pt-2 text-xs">
              <div className="p-3.5 rounded-[14px] bg-[#F5F6F8] border border-[#EAECEF]">
                <div className="text-[10px] uppercase font-bold text-[#737373]">
                  Billed To
                </div>
                <div className="text-base font-bold text-[#171717] mt-0.5">
                  {selectedInvoice.customerName}
                </div>
                <div className="text-[#737373]">{selectedInvoice.customerEmail}</div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-[12px] bg-[#F5F6F8] border border-[#EAECEF]">
                  <div className="text-[10px] uppercase font-bold text-[#737373]">
                    Total Invoiced
                  </div>
                  <div className="text-sm font-bold text-[#171717] mt-0.5">
                    {formatCurrency(selectedInvoice.total)}
                  </div>
                </div>
                <div className="p-3 rounded-[12px] bg-[#F5F6F8] border border-[#EAECEF]">
                  <div className="text-[10px] uppercase font-bold text-[#737373]">
                    Balance Due
                  </div>
                  <div className="text-sm font-bold text-rose-600 mt-0.5">
                    {formatCurrency(selectedInvoice.amountDue)}
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedInvoice(null)}
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

