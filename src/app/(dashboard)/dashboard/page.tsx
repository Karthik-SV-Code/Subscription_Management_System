import * as React from "react";
import { DollarSign, Users, Repeat, TrendingUp } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { RevenueChart } from "@/components/charts/revenue-chart";
import { SubscriptionChart } from "@/components/charts/subscription-chart";
import { Badge } from "@/components/ui/badge";

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
          <Badge variant="outline" className="border-indigo-200 bg-indigo-50 text-indigo-700">
            Architecture Ready
          </Badge>
        }
      />

      {/* Metric Foundation Preview */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Monthly Recurring Revenue"
          value="$42,600"
          change={12.4}
          trend="up"
          changePeriod="vs last month"
          icon={<DollarSign className="h-5 w-5" />}
        />
        <StatCard
          title="Active Subscriptions"
          value="640"
          change={8.2}
          trend="up"
          changePeriod="vs last month"
          icon={<Repeat className="h-5 w-5" />}
        />
        <StatCard
          title="Net Revenue Retention"
          value="108.5%"
          change={1.3}
          trend="up"
          changePeriod="vs last quarter"
          icon={<TrendingUp className="h-5 w-5" />}
        />
        <StatCard
          title="Active Accounts"
          value="582"
          change={5.0}
          trend="up"
          changePeriod="vs last month"
          icon={<Users className="h-5 w-5" />}
        />
      </div>

      {/* Chart Telemetry Foundation */}
      <div className="grid gap-6 lg:grid-cols-2">
        <RevenueChart />
        <SubscriptionChart />
      </div>
    </div>
  );
}

