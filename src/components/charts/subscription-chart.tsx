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
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

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
  { period: "Jan", active: 240, churned: 12 },
  { period: "Feb", active: 295, churned: 14 },
  { period: "Mar", active: 360, churned: 10 },
  { period: "Apr", active: 410, churned: 18 },
  { period: "May", active: 490, churned: 15 },
  { period: "Jun", active: 565, churned: 16 },
  { period: "Jul", active: 640, churned: 13 },
];

export function SubscriptionChart({
  data = DEFAULT_SUBSCRIPTION_DATA,
  title = "Subscription Growth & Retention",
  description = "Net active accounts and churn rate tracking",
  className,
}: SubscriptionChartProps) {
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
              <BarChart
                data={data}
                margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis
                  dataKey="period"
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
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#FFFFFF",
                    borderRadius: "8px",
                    border: "1px solid #E2E8F0",
                    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                    fontSize: "12px",
                  }}
                />
                <Bar
                  dataKey="active"
                  name="Active Subscriptions"
                  fill="#4F46E5"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="churned"
                  name="Churned"
                  fill="#F43F5E"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full w-full animate-pulse bg-slate-50 rounded" />
          )}
        </div>
      </CardContent>
    </Card>
  );
}

