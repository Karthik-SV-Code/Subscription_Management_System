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

export interface SubscriptionDataPoint {
  period: string;
  active: number;
  churned: number;
}

export interface SubscriptionChartProps {
  data?: SubscriptionDataPoint[];
  title?: string;
  description?: string;
  className?: string;
}

const DEFAULT_SUBSCRIPTION_DATA: SubscriptionDataPoint[] = [
  { period: "May", active: 490, churned: 15 },
  { period: "Jun", active: 520, churned: 14 },
  { period: "Jul", active: 565, churned: 16 },
  { period: "Aug", active: 595, churned: 12 },
  { period: "Sep", active: 615, churned: 10 },
  { period: "Oct", active: 640, churned: 8 },
];

export function SubscriptionChart({
  data = DEFAULT_SUBSCRIPTION_DATA,
  title = "Subscription Inflow vs Churn",
  description = "Net active contracts and monthly churned seats",
  className,
}: SubscriptionChartProps) {
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
          Monthly
        </span>
      </div>

      <div className="mt-4 h-64 w-full">
        {mounted ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EAECEF" />
              <XAxis
                dataKey="period"
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
              />
              <Tooltip
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
              <Legend
                verticalAlign="top"
                align="right"
                iconType="circle"
                wrapperStyle={{ paddingBottom: "10px", fontSize: "11px" }}
              />
              <Bar
                dataKey="active"
                name="Active Subscriptions"
                fill="#171717"
                radius={[6, 6, 0, 0]}
                barSize={16}
              />
              <Bar
                dataKey="churned"
                name="Churned"
                fill="#F43F5E"
                radius={[6, 6, 0, 0]}
                barSize={16}
              />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full w-full animate-pulse bg-slate-50 rounded-xl" />
        )}
      </div>
    </div>
  );
}
