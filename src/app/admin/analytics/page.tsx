"use client";

import * as React from "react";
import {
  BarChart3,
  TrendingUp,
  DollarSign,
  PieChart,
  Users,
  Repeat,
  ArrowUpRight,
  Download,
  Calendar,
} from "lucide-react";
import { AdminHeader } from "@/components/admin/admin-header";
import { AdminRevenueChart } from "@/components/admin/admin-revenue-chart";
import { AdminChurnChart } from "@/components/admin/admin-churn-chart";
import { Button } from "@/components/ui/button";
import { downloadCSV } from "@/lib/utils";

const COHORT_DATA = [
  { cohort: "Q1 2025", size: 140, mrrStart: "$14.2k", mrrCurrent: "$18.9k", expansion: "+33.1%", status: "Expansion" },
  { cohort: "Q2 2025", size: 185, mrrStart: "$18.5k", mrrCurrent: "$22.4k", expansion: "+21.0%", status: "Expansion" },
  { cohort: "Q3 2025", size: 210, mrrStart: "$21.0k", mrrCurrent: "$24.6k", expansion: "+17.1%", status: "Expansion" },
  { cohort: "Q4 2025", size: 240, mrrStart: "$24.0k", mrrCurrent: "$26.8k", expansion: "+11.6%", status: "Expansion" },
  { cohort: "Q1 2026", size: 290, mrrStart: "$29.0k", mrrCurrent: "$31.5k", expansion: "+8.6%", status: "Expansion" },
];

export default function AdminAnalyticsPage() {
  const [searchQuery, setSearchQuery] = React.useState("");

  const handleExport = () => {
    downloadCSV(
      `subscriptiq_admin_analytics_cohorts_${new Date().toISOString().slice(0, 10)}`,
      COHORT_DATA as unknown as Record<string, unknown>[]
    );
  };

  return (
    <>
      <AdminHeader
        title="Revenue & Retention Analytics"
        subtitle="Cohort expansion analysis, recurring revenue efficiency, LTV/CAC ratios & net retention"
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Filter analytics telemetry..."
        onExportCSV={handleExport}
      />

      <main className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto space-y-6">
        {/* Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-6 rounded-[20px] border border-[#EAECEF] shadow-[0_2px_10px_rgba(0,0,0,0.03)]">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#737373]">
              Net Revenue Retention
            </span>
            <div className="text-3xl font-extrabold text-[#171717] mt-3">
              108.5%
            </div>
            <div className="text-xs text-emerald-600 mt-1 font-semibold">+1.3% vs trailing quarter</div>
          </div>

          <div className="bg-white p-6 rounded-[20px] border border-[#EAECEF] shadow-[0_2px_10px_rgba(0,0,0,0.03)]">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#737373]">
              Customer Lifetime Value (LTV)
            </span>
            <div className="text-3xl font-extrabold text-indigo-700 mt-3">
              $18,420
            </div>
            <div className="text-xs text-[#737373] mt-1">Based on 28-month median</div>
          </div>

          <div className="bg-white p-6 rounded-[20px] border border-[#EAECEF] shadow-[0_2px_10px_rgba(0,0,0,0.03)]">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#737373]">
              LTV : CAC Ratio
            </span>
            <div className="text-3xl font-extrabold text-emerald-600 mt-3">
              4.2x
            </div>
            <div className="text-xs text-[#737373] mt-1">CAC benchmark: $4,380</div>
          </div>

          <div className="bg-white p-6 rounded-[20px] border border-[#EAECEF] shadow-[0_2px_10px_rgba(0,0,0,0.03)]">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#737373]">
              Gross Revenue Churn
            </span>
            <div className="text-3xl font-extrabold text-[#171717] mt-3">
              1.2%
            </div>
            <div className="text-xs text-emerald-600 mt-1 font-semibold">Well within 2% target</div>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <AdminRevenueChart />
          <AdminChurnChart />
        </div>

        {/* Cohort Expansion Table */}
        <div className="bg-white rounded-[20px] border border-[#EAECEF] shadow-[0_2px_10px_rgba(0,0,0,0.03)] overflow-hidden">
          <div className="p-6 border-b border-[#EAECEF] flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-[#171717]">
                Customer Cohort Net Retention
              </h3>
              <p className="text-xs text-[#737373] mt-0.5">
                Expansion MRR over time by signup quarter
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleExport}
              className="rounded-[12px] text-xs font-semibold border-[#EAECEF]"
            >
              <Download className="w-3.5 h-3.5 mr-1.5 text-[#737373]" />
              Export Cohorts
            </Button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#EAECEF] bg-[#F5F6F8]/60 text-[#737373] font-semibold">
                  <th className="py-3.5 px-6">Quarterly Cohort</th>
                  <th className="py-3.5 px-6">Initial Accounts</th>
                  <th className="py-3.5 px-6">Inception MRR</th>
                  <th className="py-3.5 px-6">Current MRR</th>
                  <th className="py-3.5 px-6">Net Expansion</th>
                  <th className="py-3.5 px-6">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EAECEF]">
                {COHORT_DATA.map((row, i) => (
                  <tr key={i} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-4 px-6 font-bold text-[#171717]">
                      {row.cohort}
                    </td>
                    <td className="py-4 px-6 text-[#737373]">
                      {row.size} accounts
                    </td>
                    <td className="py-4 px-6 text-[#737373] font-mono">
                      {row.mrrStart}
                    </td>
                    <td className="py-4 px-6 font-bold text-[#171717] font-mono">
                      {row.mrrCurrent}
                    </td>
                    <td className="py-4 px-6 font-bold text-emerald-600">
                      <span className="inline-flex items-center gap-0.5">
                        <ArrowUpRight className="w-3.5 h-3.5" />
                        {row.expansion}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100">
                        {row.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </>
  );
}

