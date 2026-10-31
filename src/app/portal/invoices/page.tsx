"use client";

import * as React from "react";
import {
  Receipt,
  Download,
  Printer,
  FileText,
  AlertCircle,
  CheckCircle2,
  Clock,
  Search,
  ExternalLink,
  DollarSign,
} from "lucide-react";
import { PortalHeader } from "@/components/portal/portal-header";
import { PORTAL_INVOICES, PORTAL_CUSTOMER } from "@/features/portal/mock-data";
import { Invoice } from "@/types/invoice";
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

export default function PortalInvoicesPage() {
  const [invoices, setInvoices] = React.useState<Invoice[]>(PORTAL_INVOICES);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<string>("all");
  const [selectedInvoice, setSelectedInvoice] = React.useState<Invoice | null>(null);
  const [showDetailDialog, setShowDetailDialog] = React.useState(false);

  // Outstanding balance calculation
  const unpaidInvoices = invoices.filter((i) => i.amountDue > 0);
  const totalOutstanding = unpaidInvoices.reduce((acc, curr) => acc + curr.amountDue, 0);

  // Filtered invoices
  const filteredInvoices = invoices.filter((inv) => {
    const matchesSearch =
      inv.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.lineItems.some((li) =>
        li.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    const matchesStatus =
      statusFilter === "all" ? true : inv.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleExportCSV = () => {
    const rows = filteredInvoices.map((inv) => ({
      InvoiceNumber: inv.invoiceNumber,
      Status: inv.status,
      InvoiceDate: inv.invoiceDate ? formatDate(inv.invoiceDate) : "",
      DueDate: formatDate(inv.dueDate),
      Total: inv.total,
      AmountPaid: inv.amountPaid,
      AmountDue: inv.amountDue,
      Currency: inv.currency,
      Description: inv.lineItems[0]?.description || "",
    }));
    downloadCSV("my-invoices-statement", rows);
  };

  const handleDownloadSingleInvoice = (inv: Invoice) => {
    const rows = inv.lineItems.map((li) => ({
      InvoiceNumber: inv.invoiceNumber,
      Customer: inv.customerName,
      Item: li.description,
      Quantity: li.quantity,
      UnitPrice: li.unitAmount,
      Amount: li.amount,
      InvoiceTotal: inv.total,
      AmountPaid: inv.amountPaid,
      BalanceDue: inv.amountDue,
      Status: inv.status,
      Date: formatDate(inv.dueDate),
    }));
    downloadCSV(`invoice-${inv.invoiceNumber}`, rows);
  };

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  return (
    <div className="flex-1 flex flex-col min-w-0 pb-16">
      <PortalHeader
        title="Billing & Invoices"
        subtitle="Download receipts, view itemized charges, and inspect outstanding balances"
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search invoice # or item..."
        onExportCSV={handleExportCSV}
      />

      <main className="flex-1 px-4 sm:px-8 pt-6 max-w-7xl w-full mx-auto space-y-6">
        {/* Outstanding Balance Banner Card */}
        <section className="rounded-[20px] bg-white border border-[#EAECEF] p-6 sm:p-8 shadow-[0_2px_10px_rgba(0,0,0,0.03)] flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div
              className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                totalOutstanding > 0
                  ? "bg-amber-50 text-amber-600"
                  : "bg-emerald-50 text-emerald-600"
              }`}
            >
              <DollarSign className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-semibold text-[#737373] uppercase tracking-wider">
                Current Outstanding Balance
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-3xl font-extrabold text-[#171717] tracking-tight">
                  {formatCurrency(totalOutstanding)}
                </span>
                <span className="text-xs text-[#737373]">
                  across {unpaidInvoices.length} unpaid bill{unpaidInvoices.length === 1 ? "" : "s"}
                </span>
              </div>
              <p className="text-xs text-[#737373] mt-1">
                {totalOutstanding > 0
                  ? "Payment will be automatically processed on scheduled due dates."
                  : "All accounts and statements are fully settled. No overdue balance."}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportCSV}
              className="rounded-xl border-[#EAECEF] text-xs h-10 px-4 font-semibold text-[#171717] hover:bg-slate-50"
            >
              <Download className="w-4 h-4 mr-1.5 text-slate-500" />
              Export Statements (CSV)
            </Button>
          </div>
        </section>

        {/* Filters and Status Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          {["all", "paid", "pending", "overdue"].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold capitalize transition-all shrink-0 ${
                statusFilter === st
                  ? "bg-[#171717] text-white shadow-xs"
                  : "bg-white text-[#737373] hover:text-[#171717] border border-[#EAECEF]"
              }`}
            >
              {st === "all" ? "All Statements" : st}
            </button>
          ))}
        </div>

        {/* Invoices Table Card */}
        <section className="rounded-[20px] bg-white border border-[#EAECEF] p-6 sm:p-8 shadow-[0_2px_10px_rgba(0,0,0,0.03)]">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#EAECEF] text-[11px] font-bold uppercase tracking-wider text-[#737373]">
                  <th className="py-3 px-4">Invoice #</th>
                  <th className="py-3 px-4">Billing Date</th>
                  <th className="py-3 px-4">Due Date</th>
                  <th className="py-3 px-4">Total Amount</th>
                  <th className="py-3 px-4">Balance Due</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EAECEF] text-xs">
                {filteredInvoices.map((inv) => (
                  <tr
                    key={inv.id}
                    className="hover:bg-[#F5F6F8]/60 transition-colors group"
                  >
                    <td className="py-4 px-4 font-bold text-[#171717]">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 transition-colors" />
                        <span>{inv.invoiceNumber}</span>
                      </div>
                      <div className="text-[11px] text-[#737373] font-normal truncate max-w-xs mt-0.5">
                        {inv.lineItems[0]?.description}
                      </div>
                    </td>
                    <td className="py-4 px-4 text-[#737373]">
                      {inv.invoiceDate ? formatDate(inv.invoiceDate) : "—"}
                    </td>
                    <td className="py-4 px-4 text-[#737373]">
                      {formatDate(inv.dueDate)}
                    </td>
                    <td className="py-4 px-4 font-bold text-[#171717]">
                      {formatCurrency(inv.total)}
                    </td>
                    <td className="py-4 px-4">
                      {inv.amountDue > 0 ? (
                        <span className="font-bold text-amber-600">
                          {formatCurrency(inv.amountDue)}
                        </span>
                      ) : (
                        <span className="text-[#737373]">$0.00</span>
                      )}
                    </td>
                    <td className="py-4 px-4">
                      {inv.status === "paid" && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          Paid
                        </span>
                      )}
                      {inv.status === "pending" && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                          Pending
                        </span>
                      )}
                      {inv.status === "overdue" && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                          Overdue
                        </span>
                      )}
                      {inv.status === "partially_paid" && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                          Partially Paid
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedInvoice(inv);
                            setShowDetailDialog(true);
                          }}
                          className="h-8 rounded-lg text-xs font-semibold text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 px-2.5"
                        >
                          View
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDownloadSingleInvoice(inv)}
                          className="h-8 rounded-lg text-xs text-[#737373] hover:text-[#171717] hover:bg-slate-100 px-2"
                          title="Download CSV"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredInvoices.length === 0 && (
            <div className="p-8 text-center text-[#737373] text-xs">
              No matching invoices found.
            </div>
          )}
        </section>
      </main>

      {/* Invoice Detail Dialog */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="max-w-xl bg-white rounded-[24px] p-8 border-[#EAECEF] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center justify-between pb-4 border-b border-[#EAECEF]">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600">
                  Tax Invoice & Receipt
                </span>
                <DialogTitle className="text-xl font-extrabold text-[#171717] mt-0.5">
                  {selectedInvoice?.invoiceNumber}
                </DialogTitle>
              </div>
              <div>
                {selectedInvoice?.status === "paid" && (
                  <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 font-bold px-3 py-1">
                    PAID IN FULL
                  </Badge>
                )}
                {selectedInvoice?.status === "pending" && (
                  <Badge className="bg-blue-50 text-blue-700 border-blue-200 font-bold px-3 py-1">
                    PAYMENT PENDING
                  </Badge>
                )}
                {selectedInvoice?.status === "overdue" && (
                  <Badge className="bg-rose-50 text-rose-700 border-rose-200 font-bold px-3 py-1">
                    OVERDUE
                  </Badge>
                )}
              </div>
            </div>
            <DialogDescription className="sr-only">
              Invoice breakdown and itemized summary
            </DialogDescription>
          </DialogHeader>

          {selectedInvoice && (
            <div className="space-y-6 pt-2 text-xs">
              {/* Client & Billed to metadata */}
              <div className="grid grid-cols-2 gap-6 p-4 rounded-2xl bg-[#F5F6F8]">
                <div>
                  <span className="text-[10px] uppercase font-bold text-[#737373] tracking-wider block mb-1">
                    Billed To:
                  </span>
                  <div className="font-bold text-[#171717]">{PORTAL_CUSTOMER.companyName}</div>
                  <div className="text-[#737373]">{PORTAL_CUSTOMER.name}</div>
                  <div className="text-[#737373]">{PORTAL_CUSTOMER.billingAddress?.line1}</div>
                  <div className="text-[#737373]">
                    {PORTAL_CUSTOMER.billingAddress?.city}, {PORTAL_CUSTOMER.billingAddress?.state} {PORTAL_CUSTOMER.billingAddress?.postalCode}
                  </div>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-[#737373] tracking-wider block mb-1">
                    Invoice Details:
                  </span>
                  <div className="text-[#737373]">
                    Date: <strong className="text-[#171717]">{selectedInvoice.invoiceDate ? formatDate(selectedInvoice.invoiceDate) : "—"}</strong>
                  </div>
                  <div className="text-[#737373]">
                    Due Date: <strong className="text-[#171717]">{formatDate(selectedInvoice.dueDate)}</strong>
                  </div>
                  <div className="text-[#737373]">
                    Currency: <strong className="text-[#171717]">{selectedInvoice.currency}</strong>
                  </div>
                </div>
              </div>

              {/* Line Items Table */}
              <div>
                <div className="text-[11px] font-bold text-[#171717] uppercase tracking-wider mb-2">
                  Line Items
                </div>
                <div className="border border-[#EAECEF] rounded-xl overflow-hidden">
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-[#F5F6F8] text-[10px] font-bold text-[#737373] uppercase">
                      <tr>
                        <th className="py-2.5 px-3">Description</th>
                        <th className="py-2.5 px-3 text-center">Qty</th>
                        <th className="py-2.5 px-3 text-right">Unit Price</th>
                        <th className="py-2.5 px-3 text-right">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#EAECEF]">
                      {selectedInvoice.lineItems.map((li) => (
                        <tr key={li.id}>
                          <td className="py-3 px-3 font-medium text-[#171717]">
                            {li.description}
                          </td>
                          <td className="py-3 px-3 text-center text-[#737373]">
                            {li.quantity}
                          </td>
                          <td className="py-3 px-3 text-right text-[#737373]">
                            {formatCurrency(li.unitAmount)}
                          </td>
                          <td className="py-3 px-3 text-right font-bold text-[#171717]">
                            {formatCurrency(li.amount)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Total Calculation */}
              <div className="p-4 rounded-xl bg-slate-50 space-y-2 border border-[#EAECEF]/80">
                <div className="flex justify-between text-[#737373]">
                  <span>Subtotal:</span>
                  <span>{formatCurrency(selectedInvoice.subtotal)}</span>
                </div>
                <div className="flex justify-between text-[#737373]">
                  <span>Taxes (0% exempt):</span>
                  <span>$0.00</span>
                </div>
                <div className="flex justify-between text-[#737373]">
                  <span>Discount Applied:</span>
                  <span>$0.00</span>
                </div>
                <div className="flex justify-between font-extrabold text-[#171717] text-sm pt-2 border-t border-[#EAECEF]">
                  <span>Total Amount:</span>
                  <span>{formatCurrency(selectedInvoice.total)}</span>
                </div>
                <div className="flex justify-between text-emerald-700 font-semibold pt-1">
                  <span>Amount Settled:</span>
                  <span>{formatCurrency(selectedInvoice.amountPaid)}</span>
                </div>
                <div className="flex justify-between text-amber-700 font-bold">
                  <span>Balance Due:</span>
                  <span>{formatCurrency(selectedInvoice.amountDue)}</span>
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-0 pt-2">
            <Button
              variant="outline"
              onClick={handlePrint}
              className="rounded-xl text-xs border-[#EAECEF]"
            >
              <Printer className="w-3.5 h-3.5 mr-1.5" />
              Print Invoice
            </Button>
            <Button
              onClick={() => setShowDetailDialog(false)}
              className="bg-[#171717] hover:bg-black text-white rounded-xl text-xs font-semibold"
            >
              Done
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
