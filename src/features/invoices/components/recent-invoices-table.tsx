"use client";

import * as React from "react";
import {
  Copy,
  Check,
  Search,
  Download,
  Mail,
  Receipt,
  FileText,
  AlertCircle,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowDownToLine,
  Send,
} from "lucide-react";
import { Invoice } from "@/types/invoice";
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

export interface RecentInvoicesTableProps {
  initialData: Invoice[];
  externalSearch?: string;
  onToast?: (message: string) => void;
}

export function RecentInvoicesTable({
  initialData,
  externalSearch = "",
  onToast,
}: RecentInvoicesTableProps) {
  const [data, setData] = React.useState<Invoice[]>(initialData);
  const [search, setSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<string>("all");
  const [copiedId, setCopiedId] = React.useState<string | null>(null);
  const [selectedInvoice, setSelectedInvoice] = React.useState<Invoice | null>(null);

  const effectiveSearch = externalSearch.trim() || search.trim();

  // Filter invoices by status & search query
  const filteredInvoices = React.useMemo(() => {
    return data.filter((inv) => {
      // Status match
      if (statusFilter !== "all") {
        const normStatus = inv.status.toLowerCase();
        if (normStatus !== statusFilter) {
          return false;
        }
      }

      // Search match
      if (effectiveSearch) {
        const query = effectiveSearch.toLowerCase();
        const matchesId = inv.invoiceNumber.toLowerCase().includes(query);
        const matchesCustomer = inv.customerName.toLowerCase().includes(query);
        const matchesEmail = inv.customerEmail.toLowerCase().includes(query);
        const matchesAmount = String(inv.total).includes(query);
        return matchesId || matchesCustomer || matchesEmail || matchesAmount;
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

  const handleDownloadPDF = (inv: Invoice, e?: React.MouseEvent) => {
    e?.stopPropagation();
    // Generate clean text-based receipt / invoice file
    const content = `========================================================
             SUBSCRIPTIQ INVOICE RECEIPT
========================================================
Invoice Number:   ${inv.invoiceNumber}
Customer:         ${inv.customerName}
Billing Email:    ${inv.customerEmail}
Issue Date:       ${formatDate(inv.invoiceDate || inv.createdAt, "MMMM dd, yyyy")}
Due Date:         ${formatDate(inv.dueDate, "MMMM dd, yyyy")}
Payment Status:   ${inv.status.toUpperCase()}
--------------------------------------------------------
LINE ITEMS:
${inv.lineItems.map((li) => `- ${li.description}: ${formatCurrency(li.amount)} (Qty: ${li.quantity})`).join("\n")}
--------------------------------------------------------
Subtotal:         ${formatCurrency(inv.subtotal)}
Tax (0%):         ${formatCurrency(inv.tax)}
Total Amount:     ${formatCurrency(inv.total)}
Amount Paid:      ${formatCurrency(inv.amountPaid)}
Amount Due:       ${formatCurrency(inv.amountDue)}
========================================================
Thank you for partnering with SubscriptIQ!
`;

    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${inv.invoiceNumber}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    onToast?.(`Downloaded receipt for ${inv.invoiceNumber}`);
  };

  const handleSendReminder = (inv: Invoice, e?: React.MouseEvent) => {
    e?.stopPropagation();
    onToast?.(`Payment reminder dispatched to ${inv.customerEmail}`);
  };

  const handleMarkAsPaid = (invId: string) => {
    setData((prev) =>
      prev.map((inv) =>
        inv.id === invId
          ? {
              ...inv,
              status: "paid",
              amountPaid: inv.total,
              amountDue: 0,
              paidAt: new Date().toISOString(),
            }
          : inv
      )
    );
    if (selectedInvoice && selectedInvoice.id === invId) {
      setSelectedInvoice((prev) =>
        prev
          ? {
              ...prev,
              status: "paid",
              amountPaid: prev.total,
              amountDue: 0,
              paidAt: new Date().toISOString(),
            }
          : null
      );
    }
    onToast?.(`Invoice ${invId} marked as fully paid!`);
  };

  // Status counts
  const statusCounts = React.useMemo(() => {
    const counts = { all: data.length, paid: 0, pending: 0, overdue: 0, partially_paid: 0 };
    data.forEach((i) => {
      const st = i.status.toLowerCase();
      if (st === "paid") counts.paid++;
      else if (st === "pending" || st === "open") counts.pending++;
      else if (st === "overdue" || st === "past_due") counts.overdue++;
      else if (st === "partially_paid") counts.partially_paid++;
    });
    return counts;
  }, [data]);

  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white shadow-sm overflow-hidden transition-all">
      {/* Table Top Header & Controls */}
      <div className="p-5 sm:p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-slate-900">Recent Invoices</h3>
            <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-600">
              {filteredInvoices.length} invoices
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Accounts receivable, billing schedules, and customer settlement records.
          </p>
        </div>

        {/* Controls: Search & Tabs */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Local Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filter invoices..."
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
              onClick={() => setStatusFilter("paid")}
              className={`rounded-lg px-2.5 py-1 whitespace-nowrap transition-all ${
                statusFilter === "paid"
                  ? "bg-white text-slate-900 shadow-2xs font-semibold"
                  : "hover:text-slate-900"
              }`}
            >
              Paid ({statusCounts.paid})
            </button>
            <button
              onClick={() => setStatusFilter("pending")}
              className={`rounded-lg px-2.5 py-1 whitespace-nowrap transition-all ${
                statusFilter === "pending"
                  ? "bg-white text-slate-900 shadow-2xs font-semibold"
                  : "hover:text-slate-900"
              }`}
            >
              Pending ({statusCounts.pending})
            </button>
            <button
              onClick={() => setStatusFilter("overdue")}
              className={`rounded-lg px-2.5 py-1 whitespace-nowrap transition-all ${
                statusFilter === "overdue"
                  ? "bg-white text-rose-700 shadow-2xs font-semibold"
                  : "hover:text-slate-900"
              }`}
            >
              Overdue ({statusCounts.overdue})
            </button>
            <button
              onClick={() => setStatusFilter("partially_paid")}
              className={`rounded-lg px-2.5 py-1 whitespace-nowrap transition-all ${
                statusFilter === "partially_paid"
                  ? "bg-white text-amber-700 shadow-2xs font-semibold"
                  : "hover:text-slate-900"
              }`}
            >
              Partially Paid ({statusCounts.partially_paid})
            </button>
          </div>
        </div>
      </div>

      {/* Invoices Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm border-collapse">
          <thead className="bg-slate-50/75 border-b border-slate-100 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            <tr>
              <th scope="col" className="px-5 py-3.5">Invoice ID</th>
              <th scope="col" className="px-5 py-3.5">Customer</th>
              <th scope="col" className="px-5 py-3.5">Invoice Date</th>
              <th scope="col" className="px-5 py-3.5">Due Date</th>
              <th scope="col" className="px-5 py-3.5 text-right">Amount</th>
              <th scope="col" className="px-5 py-3.5 text-center">Payment Status</th>
              <th scope="col" className="px-5 py-3.5 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {filteredInvoices.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-5 py-12 text-center text-slate-400">
                  <div className="flex flex-col items-center justify-center">
                    <AlertCircle className="h-8 w-8 text-slate-300 mb-2" />
                    <p className="text-sm font-medium text-slate-600">No invoices match your filter</p>
                    <p className="text-xs text-slate-400 mt-1">Try adjusting the search query or status tab.</p>
                  </div>
                </td>
              </tr>
            ) : (
              filteredInvoices.map((inv) => {
                const isCopied = copiedId === inv.invoiceNumber;
                const isOverdue = inv.status === "overdue";

                return (
                  <tr
                    key={inv.id}
                    onClick={() => setSelectedInvoice(inv)}
                    className="hover:bg-slate-50/70 transition-colors cursor-pointer group"
                  >
                    {/* Invoice ID */}
                    <td className="px-5 py-4 font-mono text-xs font-semibold text-slate-900">
                      <div className="flex items-center gap-1.5">
                        <span className="bg-slate-100 text-slate-800 px-2 py-0.5 rounded-md border border-slate-200/80">
                          {inv.invoiceNumber}
                        </span>
                        <button
                          onClick={(e) => handleCopy(inv.invoiceNumber, e)}
                          title="Copy Invoice ID"
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

                    {/* Customer */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-700 font-bold text-xs border border-indigo-100 shrink-0">
                          {inv.customerName
                            .split(" ")
                            .map((w) => w[0])
                            .slice(0, 2)
                            .join("")}
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="font-semibold text-slate-900 text-xs sm:text-sm truncate">
                            {inv.customerName}
                          </span>
                          <span className="text-[11px] text-slate-400 truncate">
                            {inv.customerEmail}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Invoice Date */}
                    <td className="px-5 py-4 text-xs text-slate-600 whitespace-nowrap">
                      {formatDate(inv.invoiceDate || inv.createdAt, "MMM dd, yyyy")}
                    </td>

                    {/* Due Date */}
                    <td className="px-5 py-4 text-xs whitespace-nowrap">
                      <span
                        className={
                          isOverdue
                            ? "font-semibold text-rose-600 inline-flex items-center gap-1"
                            : "text-slate-600"
                        }
                      >
                        {isOverdue && <AlertTriangle className="h-3 w-3 shrink-0" />}
                        {formatDate(inv.dueDate, "MMM dd, yyyy")}
                      </span>
                    </td>

                    {/* Amount */}
                    <td className="px-5 py-4 text-right">
                      <div className="flex flex-col items-end">
                        <span className="font-bold text-slate-900 text-xs sm:text-sm">
                          {formatCurrency(inv.total)}
                        </span>
                        {inv.status === "partially_paid" && (
                          <span className="text-[10px] text-amber-700 font-medium">
                            {formatCurrency(inv.amountPaid)} paid
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Payment Status */}
                    <td className="px-5 py-4 text-center whitespace-nowrap">
                      <StatusBadge status={inv.status} />
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          variant="ghost"
                          size="icon"
                          title="Download Receipt"
                          onClick={(e) => handleDownloadPDF(inv, e)}
                          className="h-8 w-8 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg"
                        >
                          <Download className="h-3.5 w-3.5" />
                        </Button>

                        {(inv.status === "pending" || inv.status === "overdue") && (
                          <Button
                            variant="ghost"
                            size="icon"
                            title="Send Payment Reminder"
                            onClick={(e) => handleSendReminder(inv, e)}
                            className="h-8 w-8 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg"
                          >
                            <Send className="h-3.5 w-3.5" />
                          </Button>
                        )}

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedInvoice(inv)}
                          className="text-xs text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50/70 font-semibold h-8 rounded-lg px-2.5"
                        >
                          Details
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Invoice Details Dialog Modal */}
      <Dialog
        open={!!selectedInvoice}
        onOpenChange={(open) => !open && setSelectedInvoice(null)}
      >
        {selectedInvoice && (
          <DialogContent className="sm:max-w-lg rounded-2xl">
            <DialogHeader>
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100">
                    <Receipt className="h-5 w-5" />
                  </div>
                  <div>
                    <DialogTitle className="text-base font-bold text-slate-900">
                      Invoice #{selectedInvoice.invoiceNumber}
                    </DialogTitle>
                    <DialogDescription className="text-xs text-slate-500">
                      Billing breakdown and receivable state
                    </DialogDescription>
                  </div>
                </div>
                <StatusBadge status={selectedInvoice.status} />
              </div>
            </DialogHeader>

            <div className="space-y-4 py-2 text-xs">
              {/* Customer Box */}
              <div className="rounded-xl bg-slate-50 p-3.5 border border-slate-200/80">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                  Billing Recipient
                </span>
                <div className="flex items-center justify-between mt-1.5">
                  <p className="font-bold text-sm text-slate-900">{selectedInvoice.customerName}</p>
                  <span className="font-mono text-slate-500">{selectedInvoice.customerId}</span>
                </div>
                <p className="text-slate-500 mt-0.5">{selectedInvoice.customerEmail}</p>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-slate-200/80 p-3">
                  <span className="text-[10px] font-semibold text-slate-400 uppercase">Issue Date</span>
                  <p className="font-semibold text-slate-900 mt-1">
                    {formatDate(selectedInvoice.invoiceDate || selectedInvoice.createdAt, "MMM dd, yyyy")}
                  </p>
                </div>
                <div className="rounded-xl border border-slate-200/80 p-3">
                  <span className="text-[10px] font-semibold text-slate-400 uppercase">Payment Due Date</span>
                  <p
                    className={
                      selectedInvoice.status === "overdue"
                        ? "font-bold text-rose-600 mt-1"
                        : "font-semibold text-slate-900 mt-1"
                    }
                  >
                    {formatDate(selectedInvoice.dueDate, "MMM dd, yyyy")}
                  </p>
                </div>
              </div>

              {/* Line Items */}
              <div className="rounded-xl border border-slate-200/80 p-3.5">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                  Contract Line Items
                </span>
                <div className="divide-y divide-slate-100 mt-2">
                  {selectedInvoice.lineItems.map((item) => (
                    <div key={item.id} className="py-2 flex justify-between items-center">
                      <div>
                        <p className="font-medium text-slate-800">{item.description}</p>
                        <p className="text-[11px] text-slate-400">Quantity: {item.quantity}</p>
                      </div>
                      <span className="font-bold text-slate-900">{formatCurrency(item.amount)}</span>
                    </div>
                  ))}
                </div>

                <div className="border-t border-slate-100 pt-3 mt-2 space-y-1">
                  <div className="flex justify-between text-slate-500">
                    <span>Subtotal:</span>
                    <span>{formatCurrency(selectedInvoice.subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>Tax:</span>
                    <span>{formatCurrency(selectedInvoice.tax)}</span>
                  </div>
                  <div className="flex justify-between text-sm font-bold text-slate-900 pt-1 border-t border-slate-100">
                    <span>Total Amount:</span>
                    <span>{formatCurrency(selectedInvoice.total)}</span>
                  </div>
                  {selectedInvoice.amountDue > 0 && (
                    <div className="flex justify-between text-rose-600 font-semibold pt-1">
                      <span>Remaining Balance Due:</span>
                      <span>{formatCurrency(selectedInvoice.amountDue)}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <DialogFooter className="sm:justify-between items-center gap-2 border-t pt-4 border-slate-100">
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleDownloadPDF(selectedInvoice)}
                  className="text-xs"
                >
                  <ArrowDownToLine className="mr-1.5 h-3.5 w-3.5 text-indigo-600" />
                  Download
                </Button>

                {selectedInvoice.status !== "paid" && (
                  <Button
                    size="sm"
                    onClick={() => handleMarkAsPaid(selectedInvoice.id)}
                    className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
                  >
                    <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" />
                    Mark as Paid
                  </Button>
                )}
              </div>

              <Button
                type="button"
                variant="ghost"
                onClick={() => setSelectedInvoice(null)}
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

