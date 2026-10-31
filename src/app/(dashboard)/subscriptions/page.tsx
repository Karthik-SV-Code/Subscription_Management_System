import * as React from "react";
import { Plus } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/shared/status-badge";
import { MOCK_SUBSCRIPTIONS } from "@/features/subscriptions/mock-data";
import { formatCurrency, formatDate } from "@/lib/utils";

export const metadata = {
  title: "Subscriptions",
};

export default function SubscriptionsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Subscription Contracts"
        description="Monitor active customer contracts, renewal dates, upgrades, downgrades, and cancellations."
        actions={
          <Button className="bg-[#171717] hover:bg-black text-white gap-2">
            <Plus className="h-4 w-4" />
            <span>New Subscription</span>
          </Button>
        }
      />

      <div className="rounded-[20px] border border-[#EAECEF] bg-white shadow-[0_2px_10px_rgba(0,0,0,0.03)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/70 text-[11px] font-bold text-[#737373] uppercase tracking-wider border-b border-[#EAECEF]">
              <tr>
                <th className="px-6 py-4">Contract ID</th>
                <th className="px-6 py-4">Subscriber</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Active Plan</th>
                <th className="px-6 py-4">Current Period End</th>
                <th className="px-6 py-4">MRR</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EAECEF] text-[#171717]">
              {MOCK_SUBSCRIPTIONS.map((sub) => (
                <tr key={sub.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="px-6 py-4 font-mono text-[#737373]">
                    {sub.id}
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-bold text-sm text-[#171717]">{sub.customerName}</div>
                    <div className="text-[11px] text-[#737373]">{sub.customerEmail}</div>
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={sub.status} />
                  </td>
                  <td className="px-6 py-4 font-medium text-[#171717]">
                    {sub.items[0]?.planName || "Custom Plan"}
                  </td>
                  <td className="px-6 py-4 text-[#737373]">
                    {formatDate(sub.currentPeriodEnd)}
                  </td>
                  <td className="px-6 py-4 font-bold text-sm text-[#171717]">
                    {formatCurrency(sub.mrr)}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-xs font-semibold text-indigo-600 hover:text-indigo-900 transition-colors">
                      Upgrade &rarr;
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
