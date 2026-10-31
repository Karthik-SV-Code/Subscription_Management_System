import * as React from "react";
import { TrendingDown, TrendingUp, Minus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export interface StatCardProps {
  title: string;
  value: string | number;
  change?: number;
  changePeriod?: string;
  trend?: "up" | "down" | "neutral";
  icon?: React.ReactNode;
  description?: string;
  loading?: boolean;
  className?: string;
}

export function StatCard({
  title,
  value,
  change,
  changePeriod = "vs last month",
  trend,
  icon,
  description,
  loading = false,
  className,
}: StatCardProps) {
  if (loading) {
    return (
      <Card className={cn("p-6", className)}>
        <div className="flex items-center justify-between pb-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-8 w-8 rounded-full" />
        </div>
        <Skeleton className="h-8 w-32 my-2" />
        <Skeleton className="h-3 w-40" />
      </Card>
    );
  }

  // Derive trend if not explicitly provided
  const computedTrend =
    trend ||
    (typeof change === "number"
      ? change > 0
        ? "up"
        : change < 0
        ? "down"
        : "neutral"
      : undefined);

  return (
    <Card
      className={cn(
        "border border-slate-200/80 bg-white transition-all duration-200 hover:shadow-sm",
        className
      )}
    >
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-slate-500">{title}</p>
          {icon && (
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
              {icon}
            </div>
          )}
        </div>

        <div className="mt-3">
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">
            {value}
          </h2>

          <div className="mt-2 flex items-center gap-2 text-xs">
            {typeof change === "number" && (
              <span
                className={cn(
                  "inline-flex items-center gap-0.5 font-medium px-1.5 py-0.5 rounded",
                  computedTrend === "up" && "bg-emerald-50 text-emerald-700",
                  computedTrend === "down" && "bg-rose-50 text-rose-700",
                  computedTrend === "neutral" && "bg-slate-50 text-slate-600"
                )}
              >
                {computedTrend === "up" && <TrendingUp className="h-3 w-3" />}
                {computedTrend === "down" && <TrendingDown className="h-3 w-3" />}
                {computedTrend === "neutral" && <Minus className="h-3 w-3" />}
                <span>
                  {change > 0 ? `+${change}%` : `${change}%`}
                </span>
              </span>
            )}

            {changePeriod && (
              <span className="text-slate-400">{changePeriod}</span>
            )}

            {description && (
              <span className="text-slate-400">{description}</span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

