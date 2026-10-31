"use client";

import * as React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  ComposedChart,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { TrendingUp, ArrowUpRight } from "lucide-react";

export interface RevenueDataPoint {
  month: string;
  mrr: number;
  target: number;
  netNew: number;
}

export interface RevenueChartProps {
  data?: RevenueDataPoint[];
  title?: string;
  description?: string;
  className?: string;
}

const DEFAULT_REVENUE_DATA: RevenueDataPoint[] = [
  { month: "Nov 25", mrr: 38200, target: 36000, netNew: 2400 },
  { month: "Dec 25", mrr: 41400, target: 39000, netNew: 3200 },
  { month: "Jan 26", mrr: 44800, target: 42000, netNew: 3400 },
  { month: "Feb 26", mrr: 47900, target: 45000, netNew: 3100 },
  { month: "Mar 26", mrr: 51600, target: 48500, netNew: 3700 },
  { month: "Apr 26", mrr: 54800, target: 52000, netNew: 3200 },
  { month: "May 26", mrr: 57900, target: 55000, netNew: 3100 },
  { month: "Jun 26", mrr: 60800, target: 58000, netNew: 2900 },
  { month: "Jul 26", mrr: 63100, target: 60500, netNew: 2300 },
  { month: "Aug 26", mrr: 65400, target: 62000, netNew: 2300 },
  { month: "Sep 26", mrr: 66900, target: 63500, netNew: 1500 },
  { month: "Oct 26", mrr: 68450, target: 64500, netNew: 1550 },
];

export function RevenueChart({
  data = DEFAULT_REVENUE_DATA,
  title = "Revenue Trends",
  description = "Monthly recurring revenue (MRR) expansion trajectory vs target",
  className,
}: RevenueChartProps) {
  const [mounted, setMounted] = React.useState(false);
  const [range, setRange] = React.useState<"6M" | "1Y">("1Y");

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const chartData = React.useMemo(() => {
    if (range === "6M") {
      return data.slice(-6);
    }
    return data;
  }, [data, range]);

  return (
    <Card className={`rounded-2xl border border-slate-200/80 bg-white shadow-sm hover:shadow-md transition-shadow duration-200 ${className || ""}`}>
      <CardHeader className="p-6 pb-2">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <CardTitle className="text-base font-bold text-slate-900">{title}</CardTitle>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700 border border-emerald-200">
                <TrendingUp className="h-3 w-3" />
                +14.2% YoY
              </span>
            </div>
            {description && (
              <CardDescription className="text-xs text-slate-500 mt-1">
                {description}
              </CardDescription>
            )}
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            {/* Filter Pills */}
            <div className="flex items-center rounded-xl bg-slate-100 p-1 text-xs font-medium text-slate-600">
              <button
                onClick={() => setRange("6M")}
                className={`rounded-lg px-2.5 py-1 transition-all ${
                  range === "6M"
                    ? "bg-white text-slate-900 shadow-2xs font-semibold"
                    : "hover:text-slate-900"
                }`}
              >
                6 Months
              </button>
              <button
                onClick={() => setRange("1Y")}
                className={`rounded-lg px-2.5 py-1 transition-all ${
                  range === "1Y"
                    ? "bg-white text-slate-900 shadow-2xs font-semibold"
                    : "hover:text-slate-900"
                }`}
              >
                12 Months
              </button>
            </div>
          </div>
        </div>

        {/* Highlight KPI bar */}
        <div className="flex flex-wrap items-center gap-4 pt-3 border-t border-slate-100 mt-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-indigo-600" />
            <span className="text-slate-500">Current MRR:</span>
            <span className="font-bold text-slate-900">$68,450.00</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-rose-500" />
            <span className="text-slate-500">Target Benchmark:</span>
            <span className="font-semibold text-slate-700">$64,500.00</span>
          </div>
          <div className="flex items-center gap-1.5 ml-auto text-emerald-600 font-semibold">
            <ArrowUpRight className="h-3.5 w-3.5" />
            <span>+$3,950 ahead of target</span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6 pt-4">
        <div className="h-[290px] w-full">
          {mounted ? (
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart
                data={chartData}
                margin={{ top: 12, right: 12, left: -10, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="revenueLineGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#4F46E5" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis
                  dataKey="month"
                  stroke="#94A3B8"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  dy={8}
                />
                <YAxis
                  stroke="#94A3B8"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(val) => `$${(val / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  formatter={(value: number, name: string) => [
                    formatCurrency(value),
                    name === "mrr" ? "Actual MRR" : "Target Baseline",
                  ]}
                  contentStyle={{
                    backgroundColor: "#FFFFFF",
                    borderRadius: "12px",
                    border: "1px solid #E2E8F0",
                    boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.08)",
                    fontSize: "12px",
                    padding: "10px 14px",
                  }}
                  labelStyle={{ fontWeight: 600, color: "#0F172A", marginBottom: "4px" }}
                />
                <Area
                  type="monotone"
                  dataKey="mrr"
                  fill="url(#revenueLineGradient)"
                  stroke="none"
                />
                <Line
                  type="monotone"
                  dataKey="target"
                  name="target"
                  stroke="#F43F5E"
                  strokeWidth={2}
                  strokeDasharray="4 4"
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="mrr"
                  name="mrr"
                  stroke="#4F46E5"
                  strokeWidth={3}
                  dot={{ r: 4, fill: "#4F46E5", stroke: "#FFFFFF", strokeWidth: 2 }}
                  activeDot={{ r: 6, fill: "#4F46E5", stroke: "#FFFFFF", strokeWidth: 3 }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full w-full bg-slate-50/50 animate-pulse rounded-xl" />
          )}
        </div>
      </CardContent>
    </Card>
  );
}
