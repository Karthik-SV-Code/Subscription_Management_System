"use client";

import * as React from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { formatCurrency } from "@/lib/utils";
import { ADMIN_REVENUE_CHART_DATA } from "@/features/admin/mock-data";

export interface AdminRevenueChartProps {
  data?: typeof ADMIN_REVENUE_CHART_DATA;
  className?: string;
}

export function AdminRevenueChart({
  data = ADMIN_REVENUE_CHART_DATA,
  className,
}: AdminRevenueChartProps) {
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div
      className={`bg-white p-6 rounded-[20px] border border-[#EAECEF] shadow-[0_2px_10px_rgba(0,0,0,0.03)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.06)] transition-all ${
        className || ""
      }`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#EAECEF] gap-2">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#8B5CF6]" />
            <h3 className="text-sm font-bold text-[#171717]">
              Monthly Revenue Growth
            </h3>
          </div>
          <p className="text-xs text-[#737373] mt-0.5">
            Smooth recurring trajectory with trailing year comparisons
          </p>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-center">
          <span className="px-2.5 py-1 text-[11px] font-semibold rounded-full bg-purple-50 text-purple-700 border border-purple-200">
            ARR Run Rate: $821,400
          </span>
          <span className="px-2.5 py-1 text-[11px] font-semibold rounded-full bg-slate-100 text-[#737373]">
            2026 YTD
          </span>
        </div>
      </div>

      <div className="mt-4 h-64 w-full">
        {mounted ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={data}
              margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
            >
              <defs>
                <linearGradient id="adminPurpleGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="adminPrevYearGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#CBD5E1" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#CBD5E1" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EAECEF" />
              <XAxis
                dataKey="month"
                stroke="#737373"
                fontSize={11}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="#737373"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                tickFormatter={(val) => `$${(val / 1000).toFixed(0)}k`}
              />
              <Tooltip
                formatter={(val: number, name: string) => [
                  formatCurrency(val),
                  name === "revenue" ? "MRR 2026" : "Previous Year",
                ]}
                contentStyle={{
                  backgroundColor: "#FFFFFF",
                  borderRadius: "12px",
                  border: "1px solid #EAECEF",
                  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
                  fontSize: "12px",
                  fontWeight: 600,
                  color: "#171717",
                }}
              />
              <Area
                type="monotone"
                dataKey="previousYear"
                stroke="#94A3B8"
                strokeWidth={1.5}
                strokeDasharray="4 4"
                fillOpacity={1}
                fill="url(#adminPrevYearGradient)"
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#8B5CF6"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#adminPurpleGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full w-full animate-pulse bg-slate-50 rounded-xl" />
        )}
      </div>
    </div>
  );
}

