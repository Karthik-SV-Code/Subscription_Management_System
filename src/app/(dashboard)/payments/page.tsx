import * as React from "react";
import { RefreshCw, CreditCard, Building2 } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/shared/status-badge";
import { MOCK_PAYMENTS } from "@/features/payments/mock-data";
import { formatCurrency, formatDate } from "@/lib/utils";

export const metadata = {
  title: "Payments",
};

export default function PaymentsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Payment Transactions & Clearing"
        description="Audit gateway transaction logs, ACH and card clearing, dunning retries, and refunds."
        actions={
          <Button variant="outline" className="gap-2">
            <RefreshCw className="h-4 w-4 text-[#737373]" />
            <span>Sync Gateways</span>
          </Button>
        }
      />

      <div className="rounded-[20px] border border-[#EAECEF] bg-white shadow-[0_2px_10px_rgba(0,0,0,0.03)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/70 text-[11px] font-bold text-[#737373] uppercase tracking-wider border-b border-[#EAECEF]">
              <tr>
                <th className="px-6 py-4">Transaction Ref</th>
                <th className="px-6 py-4">Customer Account</th>
                <th className="px-6 py-4">Payment Method</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Amount Processed</th>
                <th className="px-6 py-4 text-right">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EAECEF] text-[#171717]">
              {MOCK_PAYMENTS.map((pay) => (
                <tr key={pay.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="px-6 py-4 font-mono text-[#737373]">
                    {pay.transactionReference}
                  </td>
                  <td className="px-6 py-4 font-semibold text-[#171717]">
                    {pay.customerName}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 font-medium text-[#171717]">
                      {pay.paymentMethod === "credit_card" ? (
                        <>
                          <CreditCard className="w-4 h-4 text-[#737373]" />
                          <span>Card •••• {pay.lastFour || "4242"}</span>
                        </>
                      ) : (
                        <>
                          <Building2 className="w-4 h-4 text-[#737373]" />
                          <span>ACH •••• {pay.lastFour || "6789"}</span>
                        </>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={pay.status} />
                  </td>
                  <td className="px-6 py-4 font-bold text-sm text-[#171717]">
                    {formatCurrency(pay.amount)}
                  </td>
                  <td className="px-6 py-4 text-[#737373] text-right">
                    {formatDate(pay.processedAt, "MMM dd, yyyy, hh:mm a")}
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
