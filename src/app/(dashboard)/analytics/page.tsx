import * as React from "react";
import { BarChart3, TrendingUp, ArrowUpRight, DollarSign, Users, Calendar, Download } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { RevenueChart } from "@/components/charts/revenue-chart";
import { SubscriptionChart } from "@/components/charts/subscription-chart";
import { StatCard } from "@/components/shared/stat-card";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Analytics & Intelligence",
};

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Revenue & Growth Analytics"
        description="Deep telemetry on recurring revenue, cohort retention, contraction churn, and customer lifetime value."
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="rounded-xl border-slate-200">
              <Calendar className="mr-2 h-4 w-4 text-slate-500" />
              <span>Year to Date (2026)</span>
            </Button>
            <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-xs">
              <Download className="mr-2 h-4 w-4" />
              <span>Download BI Report</span>
            </Button>
          </div>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Annual Run Rate (ARR)"
          value="$821,400"
          change={18.4}
          trend="up"
          changePeriod="vs last year"
          icon={<DollarSign className="h-5 w-5" />}
        />
        <StatCard
          title="Net Revenue Retention"
          value="114.2%"
          change={3.1}
          trend="up"
          changePeriod="top quartile"
          icon={<TrendingUp className="h-5 w-5" />}
        />
        <StatCard
          title="Average Revenue Per User"
          value="$53.30"
          change={6.2}
          trend="up"
          changePeriod="ARPU expansion"
          icon={<BarChart3 className="h-5 w-5" />}
        />
        <StatCard
          title="LTV : CAC Ratio"
          value="4.8x"
          change={0.4}
          trend="up"
          changePeriod="vs target 3.5x"
          icon={<ArrowUpRight className="h-5 w-5" />}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <RevenueChart />
        <SubscriptionChart />
      </div>
    </div>
  );
}

