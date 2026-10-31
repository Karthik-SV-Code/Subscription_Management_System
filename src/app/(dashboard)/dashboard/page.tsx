import * as React from "react";
import Link from "next/link";
import { DollarSign, Users, Repeat, TrendingUp, ArrowRight } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { RevenueChart } from "@/components/charts/revenue-chart";
import { SubscriptionChart } from "@/components/charts/subscription-chart";
import { StatusBadge } from "@/components/shared/status-badge";
import { MOCK_CUSTOMERS } from "@/features/customers/mock-data";
import { formatCurrency } from "@/lib/utils";

export const metadata = {
  title: "Dashboard Overview",
};

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard Overview"
        description="Real-time recurring revenue telemetry, customer acquisition, and contract health."
        badge={
          <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
            Live Production
          </span>
        }
      />

      {/* Summary Metrics Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Monthly Recurring Revenue"
          value="$42,600"
          change={12.4}
          trend="up"
          changePeriod="vs last month"
          icon={<DollarSign className="h-4 w-4 text-[#171717]" />}
        />
        <StatCard
          title="Active Subscriptions"
          value="640"
          change={8.2}
          trend="up"
          changePeriod="vs last month"
          icon={<Repeat className="h-4 w-4 text-[#171717]" />}
        />
        <StatCard
          title="Net Revenue Retention"
          value="108.5%"
          change={1.3}
          trend="up"
          changePeriod="vs last quarter"
          icon={<TrendingUp className="h-4 w-4 text-[#171717]" />}
        />
        <StatCard
          title="Active Accounts"
          value="582"
          change={5.0}
          trend="up"
          changePeriod="vs last month"
          icon={<Users className="h-4 w-4 text-[#171717]" />}
        />
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        <RevenueChart />
        <SubscriptionChart />
      </div>

      {/* Recent Customer Accounts Table */}
      <div className="rounded-[20px] border border-[#EAECEF] bg-white shadow-[0_2px_10px_rgba(0,0,0,0.03)] overflow-hidden">
        <div className="p-6 border-b border-[#EAECEF] flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-[#171717]">Recent Account Activity</h3>
            <p className="text-xs text-[#737373] mt-0.5">Live subscription contracts and status changes</p>
          </div>
          <Link
            href="/customers"
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors flex items-center gap-1"
          >
            <span>View all accounts</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/70 text-[11px] font-bold text-[#737373] uppercase tracking-wider border-b border-[#EAECEF]">
              <tr>
                <th className="px-6 py-4">Customer Account</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Contracts</th>
                <th className="px-6 py-4">Monthly Value</th>
                <th className="px-6 py-4 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EAECEF] text-[#171717]">
              {MOCK_CUSTOMERS.map((cust) => (
                <tr key={cust.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-bold text-[#171717]">{cust.name}</div>
                    <div className="text-[11px] text-[#737373]">{cust.email}</div>
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={cust.status} />
                  </td>
                  <td className="px-6 py-4 font-medium text-[#737373]">
                    {cust.activeSubscriptionsCount} active {cust.activeSubscriptionsCount === 1 ? "plan" : "plans"}
                  </td>
                  <td className="px-6 py-4 font-bold text-sm text-[#171717]">
                    {formatCurrency(cust.mrr)}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link
                      href="/customers"
                      className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-[#171717] font-semibold transition-colors"
                    >
                      Inspect
                    </Link>
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
