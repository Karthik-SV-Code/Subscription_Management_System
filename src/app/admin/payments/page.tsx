"use client";

import * as React from "react";
import {
  CreditCard,
  Search,
  CheckCircle2,
  Clock,
  AlertCircle,
  Eye,
  Download,
  Filter,
  RefreshCw,
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
import { MOCK_TRANSACTIONS } from "@/features/admin/mock-data";
import { TransactionRecord } from "@/features/admin/types";
import { formatCurrency, downloadCSV } from "@/lib/utils";

export default function AdminPaymentsPage() {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [methodFilter, setMethodFilter] = React.useState("All");
  const [selectedTxn, setSelectedTxn] = React.useState<TransactionRecord | null>(null);

  const filtered = React.useMemo(() => {
    return MOCK_TRANSACTIONS.filter((tx) => {
      const q = searchQuery.toLowerCase();
      const matchSearch =
        tx.transactionRef.toLowerCase().includes(q) ||
        tx.customerName.toLowerCase().includes(q) ||
        tx.customerEmail.toLowerCase().includes(q) ||
        tx.invoiceId.toLowerCase().includes(q);

      const matchMethod =
        methodFilter === "All" ||
        tx.paymentMethod.toLowerCase() === methodFilter.toLowerCase();

      return matchSearch && matchMethod;
    });
  }, [searchQuery, methodFilter]);

  const handleExport = () => {
    const rows = filtered.map((tx) => ({
      TransactionRef: tx.transactionRef,
      Customer: tx.customerName,
      Email: tx.customerEmail,
      Amount: tx.amount,
      Method: tx.paymentMethod,
      Status: tx.status,
      Invoice: tx.invoiceId,
      Date: tx.date,
    }));
    downloadCSV(
      `subscriptiq_admin_payments_${new Date().toISOString().slice(0, 10)}`,
      rows as unknown as Record<string, unknown>[]
    );
  };

  return (
    <>
      <AdminHeader
        title="Payment Overview"
        subtitle="Gateway transaction telemetry, merchant settlements, card authorizations & payout audit"
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Filter transaction ref, customer, invoice..."
        onExportCSV={handleExport}
      />

      <main className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto space-y-6">
        {/* Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-6 rounded-[20px] border border-[#EAECEF] shadow-[0_2px_10px_rgba(0,0,0,0.03)]">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#737373]">
              Settled Volume (30d)
            </span>
            <div className="text-3xl font-extrabold text-[#171717] mt-3">
              $168,400
            </div>
            <div className="text-xs text-emerald-600 mt-1 font-semibold">+14.2% MoM</div>
          </div>

          <div className="bg-white p-6 rounded-[20px] border border-[#EAECEF] shadow-[0_2px_10px_rgba(0,0,0,0.03)]">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#737373]">
              Success Rate
            </span>
            <div className="text-3xl font-extrabold text-emerald-600 mt-3">
              99.2%
            </div>
            <div className="text-xs text-[#737373] mt-1">First-pass auth</div>
          </div>

          <div className="bg-white p-6 rounded-[20px] border border-[#EAECEF] shadow-[0_2px_10px_rgba(0,0,0,0.03)]">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#737373]">
              ACH & Wire Volume
            </span>
            <div className="text-3xl font-extrabold text-purple-600 mt-3">
              $98,200
            </div>
            <div className="text-xs text-[#737373] mt-1">Zero fee tier</div>
          </div>

          <div className="bg-white p-6 rounded-[20px] border border-[#EAECEF] shadow-[0_2px_10px_rgba(0,0,0,0.03)]">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#737373]">
              Failed Attempts
            </span>
            <div className="text-3xl font-extrabold text-rose-600 mt-3">1</div>
            <div className="text-xs text-[#737373] mt-1">Retrying in 24h</div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-[20px] border border-[#EAECEF] shadow-[0_2px_10px_rgba(0,0,0,0.03)] flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-[#737373]" />
            <span className="text-xs font-bold text-[#171717]">Payment Rail:</span>
            {["All", "Credit Card", "ACH Wire", "Stripe", "SEPA Debit"].map((m) => (
              <button
                key={m}
                onClick={() => setMethodFilter(m)}
                className={`px-3 py-1.5 rounded-[12px] text-xs font-semibold transition-all ${
                  methodFilter === m
                    ? "bg-[#171717] text-white"
                    : "bg-[#F5F6F8] text-[#737373] hover:text-[#171717]"
                }`}
              >
                {m}
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
            Export Payments
          </Button>
        </div>

        {/* Transactions Table */}
        <div className="bg-white rounded-[20px] border border-[#EAECEF] shadow-[0_2px_10px_rgba(0,0,0,0.03)] overflow-hidden">
          <div className="p-6 border-b border-[#EAECEF] flex items-center justify-between">
            <h3 className="text-sm font-bold text-[#171717]">
              Gateway Transaction Ledger
            </h3>
            <span className="text-xs text-[#737373]">
              Showing {filtered.length} transactions
            </span>
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
                  <th className="py-3.5 px-6">Invoice</th>
                  <th className="py-3.5 px-6">Settled Date</th>
                  <th className="py-3.5 px-6 text-right">Inspect</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EAECEF]">
                {filtered.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-4 px-6 font-mono font-bold text-[#171717]">
                      {tx.transactionRef}
                    </td>
                    <td className="py-4 px-6">
                      <div className="font-bold text-[#171717]">{tx.customerName}</div>
                      <div className="text-[11px] text-[#737373]">{tx.customerEmail}</div>
                    </td>
                    <td className="py-4 px-6 font-bold text-[#171717]">
                      {formatCurrency(tx.amount)}
                    </td>
                    <td className="py-4 px-6">
                      <span className="px-2.5 py-1 rounded-md bg-slate-100 font-medium text-[#171717]">
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
                    </td>
                    <td className="py-4 px-6 font-mono text-[#737373]">
                      {tx.invoiceId}
                    </td>
                    <td className="py-4 px-6 text-[#737373]">{tx.date}</td>
                    <td className="py-4 px-6 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedTxn(tx)}
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

      {/* Payment Details Dialog */}
      <Dialog open={!!selectedTxn} onOpenChange={(o) => !o && setSelectedTxn(null)}>
        <DialogContent className="max-w-md rounded-[20px] bg-white border border-[#EAECEF] p-6 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-[#171717]">
              Payment Transaction #{selectedTxn?.transactionRef}
            </DialogTitle>
            <DialogDescription className="text-xs text-[#737373]">
              Gateway settlement receipt and webhook payload
            </DialogDescription>
          </DialogHeader>

          {selectedTxn && (
            <div className="space-y-4 pt-2 text-xs">
              <div className="p-3.5 rounded-[14px] bg-[#F5F6F8] border border-[#EAECEF] flex justify-between items-center">
                <div>
                  <div className="text-[10px] uppercase font-bold text-[#737373]">
                    Amount Authorized
                  </div>
                  <div className="text-lg font-bold text-emerald-700">
                    {formatCurrency(selectedTxn.amount)}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] uppercase font-bold text-[#737373]">
                    Status
                  </div>
                  <div className="font-bold text-[#171717]">{selectedTxn.status}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-[12px] bg-[#F5F6F8] border border-[#EAECEF]">
                  <div className="text-[10px] uppercase font-bold text-[#737373]">
                    Payment Rail
                  </div>
                  <div className="font-semibold text-[#171717] mt-0.5">
                    {selectedTxn.paymentMethod}
                  </div>
                </div>
                <div className="p-3 rounded-[12px] bg-[#F5F6F8] border border-[#EAECEF]">
                  <div className="text-[10px] uppercase font-bold text-[#737373]">
                    Invoice ID
                  </div>
                  <div className="font-mono font-semibold text-[#171717] mt-0.5">
                    {selectedTxn.invoiceId}
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedTxn(null)}
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

