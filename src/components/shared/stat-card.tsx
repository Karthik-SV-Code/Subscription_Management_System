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
      <Card className={cn("p-6 rounded-[20px] border border-[#EAECEF] bg-white", className)}>
        <div className="flex items-center justify-between pb-2">
          <Skeleton className="h-4 w-24 rounded-lg" />
          <Skeleton className="h-9 w-9 rounded-xl" />
        </div>
        <Skeleton className="h-9 w-32 my-3 rounded-lg" />
        <Skeleton className="h-3 w-40 rounded-lg" />
      </Card>
    );
  }

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
    <div
      className={cn(
        "bg-white p-6 rounded-[20px] border border-[#EAECEF] shadow-[0_2px_10px_rgba(0,0,0,0.03)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.06)] transition-all duration-200",
        className
      )}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-[#737373]">
          {title}
        </span>
        {icon && (
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-50 text-[#171717] border border-[#EAECEF]">
            {icon}
          </div>
        )}
      </div>

      <div className="mt-4">
        <div className="text-3xl font-extrabold text-[#171717] tracking-tight">
          {value}
        </div>

        <div className="mt-2.5 flex items-center gap-2 text-xs">
          {typeof change === "number" && (
            <span
              className={cn(
                "inline-flex items-center gap-1 font-semibold px-2 py-0.5 rounded-full border text-[11px]",
                computedTrend === "up" && "bg-emerald-50 text-emerald-700 border-emerald-200",
                computedTrend === "down" && "bg-rose-50 text-rose-700 border-rose-200",
                computedTrend === "neutral" && "bg-slate-50 text-slate-700 border-slate-200"
              )}
            >
              {computedTrend === "up" && <TrendingUp className="h-3 w-3" />}
              {computedTrend === "down" && <TrendingDown className="h-3 w-3" />}
              {computedTrend === "neutral" && <Minus className="h-3 w-3" />}
              <span>{change > 0 ? `+${change}%` : `${change}%`}</span>
            </span>
          )}

          {changePeriod && (
            <span className="text-[#737373] text-[11px]">{changePeriod}</span>
          )}

          {description && (
            <span className="text-[#737373] text-[11px]">{description}</span>
          )}
        </div>
      </div>
    </div>
  );
}
