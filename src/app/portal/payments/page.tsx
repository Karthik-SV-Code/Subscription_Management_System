"use client";

import * as React from "react";
import {
  CreditCard,
  Building,
  CheckCircle2,
  Clock,
  XCircle,
  Download,
  ShieldCheck,
  AlertCircle,
  ArrowUpRight,
} from "lucide-react";
import { PortalHeader } from "@/components/portal/portal-header";
import { PORTAL_PAYMENTS } from "@/features/portal/mock-data";
import { Payment } from "@/types/invoice";
import { formatCurrency, formatDate, downloadCSV } from "@/lib/utils";
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

export default function PortalPaymentsPage() {
  const [payments, setPayments] = React.useState<Payment[]>(PORTAL_PAYMENTS);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [methodFilter, setMethodFilter] = React.useState<string>("all");
  const [selectedPayment, setSelectedPayment] = React.useState<Payment | null>(null);
  const [showDetailDialog, setShowDetailDialog] = React.useState(false);

  // Summary Metrics
  const totalPaid = payments
    .filter((p) => p.status === "succeeded")
    .reduce((acc, curr) => acc + curr.amount, 0);

  const pendingAmount = payments
    .filter((p) => p.status === "pending")
    .reduce((acc, curr) => acc + curr.amount, 0);

  const failedCount = payments.filter((p) => p.status === "failed").length;

  // Filtered Payments
  const filteredPayments = payments.filter((pay) => {
    const matchesSearch =
      pay.transactionReference.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pay.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesMethod =
      methodFilter === "all" ? true : pay.paymentMethod === methodFilter;
    return matchesSearch && matchesMethod;
  });

  const handleExportCSV = () => {
    const rows = filteredPayments.map((p) => ({
      TransactionRef: p.transactionReference,
      Invoice: p.invoiceNumber,
      Amount: p.amount,
      Currency: p.currency,
      Method: p.paymentMethod,
      LastFour: p.lastFour || "",
      Status: p.status,
      ProcessedAt: formatDate(p.processedAt),
      FailureReason: p.failureReason || "",
    }));
    downloadCSV("payment-history", rows);
  };

  return (
    <div className="flex-1 flex flex-col min-w-0 pb-16">
      <PortalHeader
        title="Payment History"
        subtitle="Review transaction references, settlement statuses, and payment methods"
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search transaction or invoice..."
        onExportCSV={handleExportCSV}
      />

      <main className="flex-1 px-4 sm:px-8 pt-6 max-w-7xl w-full mx-auto space-y-6">
        {/* Payment Summary 3 Cards */}
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="rounded-[20px] bg-white border border-[#EAECEF] p-6 shadow-[0_2px_10px_rgba(0,0,0,0.03)]">
            <span className="text-xs font-semibold text-[#737373] uppercase tracking-wider block mb-2">
              Total Successful Settlements
            </span>
            <div className="text-3xl font-extrabold text-[#171717] tracking-tight">
              {formatCurrency(totalPaid)}
            </div>
            <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-semibold mt-2">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Processed without discrepancies</span>
            </div>
          </div>

          <div className="rounded-[20px] bg-white border border-[#EAECEF] p-6 shadow-[0_2px_10px_rgba(0,0,0,0.03)]">
            <span className="text-xs font-semibold text-[#737373] uppercase tracking-wider block mb-2">
              In-Flight Pending Transfers
            </span>
            <div className="text-3xl font-extrabold text-[#171717] tracking-tight">
              {formatCurrency(pendingAmount)}
            </div>
            <div className="flex items-center gap-1.5 text-xs text-blue-600 font-semibold mt-2">
              <Clock className="w-3.5 h-3.5" />
              <span>Clearing through Automated Clearing House</span>
            </div>
          </div>

          <div className="rounded-[20px] bg-white border border-[#EAECEF] p-6 shadow-[0_2px_10px_rgba(0,0,0,0.03)]">
            <span className="text-xs font-semibold text-[#737373] uppercase tracking-wider block mb-2">
              Failed Charges
            </span>
            <div className="text-3xl font-extrabold text-[#171717] tracking-tight">
              {failedCount}
            </div>
            <div className="flex items-center gap-1.5 text-xs text-rose-600 font-semibold mt-2">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>Requires card or account update</span>
            </div>
          </div>
        </section>

        {/* Filters */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          {[
            { id: "all", label: "All Methods" },
            { id: "ach", label: "ACH Direct Debit" },
            { id: "credit_card", label: "Credit Card" },
            { id: "bank_transfer", label: "Bank Transfer" },
          ].map((m) => (
            <button
              key={m.id}
              onClick={() => setMethodFilter(m.id)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all shrink-0 ${
                methodFilter === m.id
                  ? "bg-[#171717] text-white shadow-xs"
                  : "bg-white text-[#737373] hover:text-[#171717] border border-[#EAECEF]"
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>

        {/* Payments Table Card */}
        <section className="rounded-[20px] bg-white border border-[#EAECEF] p-6 sm:p-8 shadow-[0_2px_10px_rgba(0,0,0,0.03)]">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#EAECEF] text-[11px] font-bold uppercase tracking-wider text-[#737373]">
                  <th className="py-3 px-4">Transaction Ref</th>
                  <th className="py-3 px-4">Invoice #</th>
                  <th className="py-3 px-4">Date Processed</th>
                  <th className="py-3 px-4">Payment Method</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EAECEF] text-xs">
                {filteredPayments.map((pay) => (
                  <tr
                    key={pay.id}
                    className="hover:bg-[#F5F6F8]/60 transition-colors group"
                  >
                    <td className="py-4 px-4 font-mono font-bold text-[#171717]">
                      {pay.transactionReference}
                    </td>
                    <td className="py-4 px-4 font-medium text-[#737373]">
                      {pay.invoiceNumber}
                    </td>
                    <td className="py-4 px-4 text-[#737373]">
                      {formatDate(pay.processedAt)}
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2 text-[#171717] font-medium">
                        {pay.paymentMethod === "credit_card" && (
                          <>
                            <CreditCard className="w-4 h-4 text-slate-500" />
                            <span>Card ending in •••• {pay.lastFour || "4242"}</span>
                          </>
                        )}
                        {pay.paymentMethod === "ach" && (
                          <>
                            <Building className="w-4 h-4 text-indigo-600" />
                            <span>ACH Corporate ••{pay.lastFour || "8821"}</span>
                          </>
                        )}
                        {pay.paymentMethod === "bank_transfer" && (
                          <>
                            <Building className="w-4 h-4 text-slate-500" />
                            <span>Direct Wire Transfer</span>
                          </>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-4 font-bold text-[#171717]">
                      {formatCurrency(pay.amount)}
                    </td>
                    <td className="py-4 px-4">
                      {pay.status === "succeeded" && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          Succeeded
                        </span>
                      )}
                      {pay.status === "pending" && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                          Processing
                        </span>
                      )}
                      {pay.status === "failed" && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                          Failed
                        </span>
                      )}
                      {pay.status === "refunded" && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-300">
                          Refunded
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-4 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedPayment(pay);
                          setShowDetailDialog(true);
                        }}
                        className="h-8 rounded-lg text-xs font-semibold text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 px-2.5"
                      >
                        Inspect
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredPayments.length === 0 && (
            <div className="p-8 text-center text-[#737373] text-xs">
              No matching transactions found.
            </div>
          )}
        </section>
      </main>

      {/* Payment Detail Dialog */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="max-w-md bg-white rounded-[24px] p-6 border-[#EAECEF]">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-[#171717]">
              Transaction Details
            </DialogTitle>
            <DialogDescription className="text-xs text-[#737373]">
              Gateway settlement receipt and ledger tracking
            </DialogDescription>
          </DialogHeader>

          {selectedPayment && (
            <div className="space-y-4 py-2 text-xs">
              <div className="p-4 rounded-xl bg-[#F5F6F8] space-y-2.5">
                <div className="flex justify-between">
                  <span className="text-[#737373]">Transaction ID:</span>
                  <span className="font-mono font-bold text-[#171717]">{selectedPayment.transactionReference}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#737373]">Invoice Number:</span>
                  <span className="font-semibold text-[#171717]">{selectedPayment.invoiceNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#737373]">Amount:</span>
                  <span className="font-extrabold text-[#171717] text-sm">
                    {formatCurrency(selectedPayment.amount)} {selectedPayment.currency}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#737373]">Settlement Method:</span>
                  <span className="capitalize text-[#171717] font-semibold">
                    {selectedPayment.paymentMethod.replace("_", " ")}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#737373]">Status:</span>
                  <span className="font-bold capitalize text-indigo-600">
                    {selectedPayment.status}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#737373]">Processed Timestamp:</span>
                  <span className="text-[#171717]">{formatDate(selectedPayment.processedAt, "PPpp")}</span>
                </div>
              </div>

              {selectedPayment.failureReason && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs">
                  <div className="font-bold flex items-center gap-1.5 mb-1">
                    <XCircle className="w-4 h-4 text-rose-600" />
                    Gateway Decline Notice:
                  </div>
                  <div>{selectedPayment.failureReason}</div>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button
              onClick={() => setShowDetailDialog(false)}
              className="w-full bg-[#171717] hover:bg-black text-white rounded-xl text-xs font-semibold"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
