import * as React from "react";
import { FileText, Download } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/shared/status-badge";
import { MOCK_INVOICES } from "@/features/invoices/mock-data";
import { formatCurrency, formatDate } from "@/lib/utils";

export const metadata = {
  title: "Invoices",
};

export default function InvoicesPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Billing & Invoices"
        description="Review billing runs, automatic tax calculations, line item breakdowns, and PDF receipts."
        actions={
          <Button className="bg-[#171717] hover:bg-black text-white gap-2">
            <FileText className="h-4 w-4" />
            <span>Generate Invoice</span>
          </Button>
        }
      />

      <div className="rounded-[20px] border border-[#EAECEF] bg-white shadow-[0_2px_10px_rgba(0,0,0,0.03)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/70 text-[11px] font-bold text-[#737373] uppercase tracking-wider border-b border-[#EAECEF]">
              <tr>
                <th className="px-6 py-4">Invoice #</th>
                <th className="px-6 py-4">Billed Customer</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Due Date</th>
                <th className="px-6 py-4">Total Amount</th>
                <th className="px-6 py-4">Amount Due</th>
                <th className="px-6 py-4 text-right">Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EAECEF] text-[#171717]">
              {MOCK_INVOICES.map((inv) => (
                <tr key={inv.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="px-6 py-4 font-mono font-bold text-[#171717]">
                    {inv.invoiceNumber}
                  </td>
                  <td className="px-6 py-4 font-semibold text-[#171717]">
                    {inv.customerName}
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={inv.status} />
                  </td>
                  <td className="px-6 py-4 text-[#737373]">
                    {formatDate(inv.dueDate)}
                  </td>
                  <td className="px-6 py-4 font-bold text-sm text-[#171717]">
                    {formatCurrency(inv.total)}
                  </td>
                  <td className="px-6 py-4 font-semibold text-[#737373]">
                    {formatCurrency(inv.amountDue)}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="inline-flex items-center gap-1.5 text-xs text-indigo-600 font-semibold hover:underline">
                      <Download className="w-3.5 h-3.5" />
                      <span>PDF</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
