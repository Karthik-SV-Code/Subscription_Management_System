"use client";

import * as React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Layers } from "lucide-react";

export interface SubscriptionStatusDataPoint {
  period: string;
  active: number;
  trial: number;
  paused: number;
  cancelled: number;
}

export interface SubscriptionChartProps {
  data?: SubscriptionStatusDataPoint[];
  title?: string;
  description?: string;
  className?: string;
}

const DEFAULT_SUBSCRIPTION_BREAKDOWN: SubscriptionStatusDataPoint[] = [
  { period: "May", active: 1040, trial: 95, paused: 32, cancelled: 24 },
  { period: "Jun", active: 1110, trial: 108, paused: 35, cancelled: 28 },
  { period: "Jul", active: 1165, trial: 114, paused: 40, cancelled: 30 },
  { period: "Aug", active: 1210, trial: 120, paused: 42, cancelled: 34 },
  { period: "Sep", active: 1250, trial: 118, paused: 45, cancelled: 36 },
  { period: "Oct", active: 1284, trial: 126, paused: 48, cancelled: 38 },
];

export function SubscriptionChart({
  data = DEFAULT_SUBSCRIPTION_BREAKDOWN,
  title = "Subscription Overview",
  description = "Account lifecycle breakdown across Active, Trial, Paused, and Cancelled",
  className,
}: SubscriptionChartProps) {
  const [mounted, setMounted] = React.useState(false);
  const [viewMode, setViewMode] = React.useState<"stacked" | "grouped">("stacked");

  React.useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <Card className={`rounded-2xl border border-slate-200/80 bg-white shadow-sm hover:shadow-md transition-shadow duration-200 ${className || ""}`}>
      <CardHeader className="p-6 pb-2">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <CardTitle className="text-base font-bold text-slate-900">{title}</CardTitle>
              <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-2 py-0.5 text-xs font-semibold text-indigo-700 border border-indigo-200">
                <Layers className="h-3 w-3" />
                1,496 Total
              </span>
            </div>
            {description && (
              <CardDescription className="text-xs text-slate-500 mt-1">
                {description}
              </CardDescription>
            )}
          </div>

          <div className="flex items-center rounded-xl bg-slate-100 p-1 text-xs font-medium text-slate-600 self-start sm:self-auto">
            <button
              onClick={() => setViewMode("stacked")}
              className={`rounded-lg px-2.5 py-1 transition-all ${
                viewMode === "stacked"
                  ? "bg-white text-slate-900 shadow-2xs font-semibold"
                  : "hover:text-slate-900"
              }`}
            >
              Stacked
            </button>
            <button
              onClick={() => setViewMode("grouped")}
              className={`rounded-lg px-2.5 py-1 transition-all ${
                viewMode === "grouped"
                  ? "bg-white text-slate-900 shadow-2xs font-semibold"
                  : "hover:text-slate-900"
              }`}
            >
              Side-by-side
            </button>
          </div>
        </div>

        {/* Status Distribution Pills */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-3 border-t border-slate-100 mt-3">
          <div className="flex items-center justify-between rounded-xl bg-indigo-50/60 p-2.5 border border-indigo-100/80">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-indigo-600" />
              <span className="text-xs font-medium text-indigo-900">Active</span>
            </div>
            <span className="text-xs font-bold text-indigo-950">1,284</span>
          </div>

          <div className="flex items-center justify-between rounded-xl bg-sky-50/60 p-2.5 border border-sky-100/80">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-sky-500" />
              <span className="text-xs font-medium text-sky-900">Trial</span>
            </div>
            <span className="text-xs font-bold text-sky-950">126</span>
          </div>

          <div className="flex items-center justify-between rounded-xl bg-amber-50/60 p-2.5 border border-amber-100/80">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-amber-500" />
              <span className="text-xs font-medium text-amber-900">Paused</span>
            </div>
            <span className="text-xs font-bold text-amber-950">48</span>
          </div>

          <div className="flex items-center justify-between rounded-xl bg-rose-50/60 p-2.5 border border-rose-100/80">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-rose-500" />
              <span className="text-xs font-medium text-rose-900">Cancelled</span>
            </div>
            <span className="text-xs font-bold text-rose-950">38</span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6 pt-4">
        <div className="h-[290px] w-full">
          {mounted ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data}
                margin={{ top: 12, right: 12, left: -10, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis
                  dataKey="period"
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
                />
                <Tooltip
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
                <Legend
                  verticalAlign="top"
                  align="right"
                  iconType="circle"
                  iconSize={8}
                  wrapperStyle={{ fontSize: "11px", paddingBottom: "12px" }}
                />
                <Bar
                  dataKey="active"
                  name="Active"
                  stackId={viewMode === "stacked" ? "a" : undefined}
                  fill="#4F46E5"
                  radius={viewMode === "stacked" ? [0, 0, 0, 0] : [4, 4, 0, 0]}
                />
                <Bar
                  dataKey="trial"
                  name="Trial"
                  stackId={viewMode === "stacked" ? "a" : undefined}
                  fill="#0EA5E9"
                  radius={viewMode === "stacked" ? [0, 0, 0, 0] : [4, 4, 0, 0]}
                />
                <Bar
                  dataKey="paused"
                  name="Paused"
                  stackId={viewMode === "stacked" ? "a" : undefined}
                  fill="#F59E0B"
                  radius={viewMode === "stacked" ? [0, 0, 0, 0] : [4, 4, 0, 0]}
                />
                <Bar
                  dataKey="cancelled"
                  name="Cancelled"
                  stackId={viewMode === "stacked" ? "a" : undefined}
                  fill="#F43F5E"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full w-full bg-slate-50/50 animate-pulse rounded-xl" />
          )}
        </div>
      </CardContent>
    </Card>
  );
}
