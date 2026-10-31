import * as React from "react";
import { UserPlus, Download } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { MOCK_CUSTOMERS } from "@/features/customers/mock-data";
import { formatCurrency, formatDate } from "@/lib/utils";

export const metadata = {
  title: "Customers",
};

export default function CustomersPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Customer Lifecycle & Accounts"
        description="Manage corporate accounts, billing contacts, payment profiles, and lifecycle stages."
        actions={
          <div className="flex items-center gap-2.5">
            <Button variant="outline" className="gap-2">
              <Download className="h-4 w-4 text-[#737373]" />
              <span>Export CSV</span>
            </Button>
            <Button className="bg-[#171717] hover:bg-black text-white gap-2">
              <UserPlus className="h-4 w-4" />
              <span>Add Customer</span>
            </Button>
          </div>
        }
      />

      <div className="rounded-[20px] border border-[#EAECEF] bg-white shadow-[0_2px_10px_rgba(0,0,0,0.03)] overflow-hidden">
        {/* Table Filter Bar */}
        <div className="p-4 border-b border-[#EAECEF] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs">
            <span className="text-[#737373] font-medium">Status:</span>
            <button className="px-3 py-1.5 rounded-lg bg-[#171717] text-white font-medium">
              All ({MOCK_CUSTOMERS.length})
            </button>
            <button className="px-3 py-1.5 rounded-lg bg-slate-100 text-[#737373] hover:text-[#171717] font-medium">
              Active (2)
            </button>
            <button className="px-3 py-1.5 rounded-lg bg-slate-100 text-[#737373] hover:text-[#171717] font-medium">
              Inactive (1)
            </button>
          </div>
          <div className="text-xs text-[#737373]">
            Showing <span className="font-semibold text-[#171717]">{MOCK_CUSTOMERS.length}</span> verified corporate accounts
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/70 text-[11px] font-bold text-[#737373] uppercase tracking-wider border-b border-[#EAECEF]">
              <tr>
                <th className="px-6 py-4">Account Name</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Billing Location</th>
                <th className="px-6 py-4">Active Plans</th>
                <th className="px-6 py-4">Monthly Value</th>
                <th className="px-6 py-4">Account Created</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EAECEF] text-[#171717]">
              {MOCK_CUSTOMERS.map((cust) => (
                <tr key={cust.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-bold text-sm text-[#171717]">{cust.name}</div>
                    <div className="text-[11px] text-[#737373] font-mono mt-0.5">{cust.email}</div>
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={cust.status} />
                  </td>
                  <td className="px-6 py-4 text-[#737373]">
                    {cust.billingAddress
                      ? `${cust.billingAddress.city}, ${cust.billingAddress.state}, ${cust.billingAddress.country}`
                      : "Not configured"}
                  </td>
                  <td className="px-6 py-4 font-semibold text-[#171717]">
                    {cust.activeSubscriptionsCount} Subscriptions
                  </td>
                  <td className="px-6 py-4 font-bold text-sm text-[#171717]">
                    {formatCurrency(cust.mrr)}
                  </td>
                  <td className="px-6 py-4 text-[#737373]">
                    {formatDate(cust.createdAt)}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-xs font-semibold text-indigo-600 hover:text-indigo-900 transition-colors">
                      Manage &rarr;
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
