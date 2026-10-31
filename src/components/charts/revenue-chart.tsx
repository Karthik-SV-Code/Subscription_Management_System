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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
  { month: "May", mrr: 33100, arr: 397200 },
  { month: "Jun", mrr: 37900, arr: 454800 },
  { month: "Jul", mrr: 42600, arr: 511200 },
];

export function RevenueChart({
  data = DEFAULT_REVENUE_DATA,
  title = "Monthly Recurring Revenue (MRR)",
  description = "Historical revenue trajectory and subscription momentum",
  className,
}: RevenueChartProps) {
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <div className="h-[280px] w-full">
          {mounted ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={data}
                margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="mrrGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.25} />
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
                />
                <YAxis
                  stroke="#94A3B8"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(val) => `$${(val / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  formatter={(val: number) => [formatCurrency(val), "MRR"]}
                  contentStyle={{
                    backgroundColor: "#FFFFFF",
                    borderRadius: "8px",
                    border: "1px solid #E2E8F0",
                    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                    fontSize: "12px",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="mrr"
                  stroke="#4F46E5"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#mrrGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full w-full animate-pulse bg-slate-50 rounded" />
          )}
        </div>
      </CardContent>
    </Card>
  );
}

