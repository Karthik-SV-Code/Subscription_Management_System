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

export interface RevenueDataPoint {
  month: string;
  mrr: number;
  arr: number;
}

export interface RevenueChartProps {
  data?: RevenueDataPoint[];
  title?: string;
  description?: string;
  className?: string;
}

const DEFAULT_REVENUE_DATA: RevenueDataPoint[] = [
  { month: "Jan", mrr: 18500, arr: 222000 },
  { month: "Feb", mrr: 21200, arr: 254400 },
  { month: "Mar", mrr: 24800, arr: 297600 },
  { month: "Apr", mrr: 28400, arr: 340800 },
  { month: "May", mrr: 31000, arr: 372000 },
  { month: "Jun", mrr: 33100, arr: 397200 },
  { month: "Jul", mrr: 35400, arr: 424800 },
  { month: "Aug", mrr: 37900, arr: 454800 },
  { month: "Sep", mrr: 40100, arr: 481200 },
  { month: "Oct", mrr: 42600, arr: 511200 },
];

export function RevenueChart({
  data = DEFAULT_REVENUE_DATA,
  title = "Monthly Recurring Revenue Trajectory",
  description = "Cumulative subscription acceleration & forecast",
  className,
}: RevenueChartProps) {
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div
      className={`bg-white p-6 rounded-[20px] border border-[#EAECEF] shadow-[0_2px_10px_rgba(0,0,0,0.03)] ${className || ""}`}
    >
      <div className="flex items-center justify-between pb-4 border-b border-[#EAECEF]">
        <div>
          <h3 className="text-sm font-bold text-[#171717]">{title}</h3>
          {description && (
            <p className="text-xs text-[#737373] mt-0.5">{description}</p>
          )}
        </div>
        <span className="px-2.5 py-1 text-[11px] font-semibold rounded-full bg-slate-100 text-[#737373]">
          2026 YTD
        </span>
      </div>

      <div className="mt-4 h-64 w-full">
        {mounted ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={data}
              margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
            >
              <defs>
                <linearGradient id="mrrRefGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#4F46E5" stopOpacity={0.0} />
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
                formatter={(val: number) => [formatCurrency(val), "MRR"]}
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
                dataKey="mrr"
                stroke="#171717"
                strokeWidth={2.2}
                fillOpacity={1}
                fill="url(#mrrRefGradient)"
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
