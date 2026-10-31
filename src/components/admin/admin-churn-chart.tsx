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
import { ADMIN_SUBS_CHURN_DATA } from "@/features/admin/mock-data";

export interface AdminChurnChartProps {
  data?: typeof ADMIN_SUBS_CHURN_DATA;
  className?: string;
}

export function AdminChurnChart({
  data = ADMIN_SUBS_CHURN_DATA,
  className,
}: AdminChurnChartProps) {
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
            <span className="w-2.5 h-2.5 rounded-full bg-[#171717]" />
            <h3 className="text-sm font-bold text-[#171717]">
              Subscription Growth vs Churn
            </h3>
          </div>
          <p className="text-xs text-[#737373] mt-0.5">
            New subscriber additions vs cancelled memberships
          </p>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-center">
          <span className="px-2.5 py-1 text-[11px] font-semibold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100">
            Net Expansion: +170
          </span>
          <span className="px-2.5 py-1 text-[11px] font-semibold rounded-full bg-slate-100 text-[#737373]">
            Last 6 Months
          </span>
        </div>
      </div>

      <div className="mt-4 h-64 w-full">
        {mounted ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
              barGap={6}
            >
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
              />
              <Tooltip
                formatter={(val: number, name: string) => [
                  `${val} subscribers`,
                  name === "newSubs" ? "New Subscriptions" : "Churned Accounts",
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
              <Legend
                verticalAlign="top"
                align="right"
                iconType="circle"
                wrapperStyle={{ paddingBottom: "12px", fontSize: "11px" }}
                formatter={(value) =>
                  value === "newSubs" ? "New Subscriptions" : "Churned"
                }
              />
              <Bar
                name="newSubs"
                dataKey="newSubs"
                fill="#171717"
                radius={[6, 6, 0, 0]}
                maxBarSize={32}
              />
              <Bar
                name="churned"
                dataKey="churned"
                fill="#F43F5E"
                radius={[6, 6, 0, 0]}
                maxBarSize={32}
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

