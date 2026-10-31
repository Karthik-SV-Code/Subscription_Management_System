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
  accentColor?: "indigo" | "coral" | "emerald" | "amber" | "sky";
  badgeText?: string;
  className?: string;
}

const ACCENT_STYLES = {
  indigo: {
    iconBg: "bg-indigo-50 text-indigo-600 border border-indigo-100",
    glow: "group-hover:border-indigo-200",
  },
  coral: {
    iconBg: "bg-rose-50 text-rose-600 border border-rose-100",
    glow: "group-hover:border-rose-200",
  },
  emerald: {
    iconBg: "bg-emerald-50 text-emerald-600 border border-emerald-100",
    glow: "group-hover:border-emerald-200",
  },
  amber: {
    iconBg: "bg-amber-50 text-amber-600 border border-amber-100",
    glow: "group-hover:border-amber-200",
  },
  sky: {
    iconBg: "bg-sky-50 text-sky-600 border border-sky-100",
    glow: "group-hover:border-sky-200",
  },
};

export function StatCard({
  title,
  value,
  change,
  changePeriod = "vs last month",
  trend,
  icon,
  description,
  loading = false,
  accentColor = "indigo",
  badgeText,
  className,
}: StatCardProps) {
  if (loading) {
    return (
      <Card className={cn("p-6 rounded-2xl", className)}>
        <div className="flex items-center justify-between pb-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-9 w-9 rounded-xl" />
        </div>
        <Skeleton className="h-9 w-32 my-2" />
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

  const accent = ACCENT_STYLES[accentColor] || ACCENT_STYLES.indigo;

  return (
    <Card
      className={cn(
        "group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm hover:shadow-md transition-all duration-200",
        accent.glow,
        className
      )}
    >
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          {title}
        </p>
        {icon && (
          <div
            className={cn(
              "flex h-10 w-10 items-center justify-center rounded-xl transition-transform duration-200 group-hover:scale-105",
              accent.iconBg
            )}
          >
            {icon}
          </div>
        )}
      </div>

      <div className="mt-4">
        <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">
          {value}
        </h2>

        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
          {typeof change === "number" && (
            <span
              className={cn(
                "inline-flex items-center gap-1 font-semibold px-2 py-0.5 rounded-full border",
                computedTrend === "up" && "bg-emerald-50 text-emerald-700 border-emerald-200",
                computedTrend === "down" && "bg-rose-50 text-rose-700 border-rose-200",
                computedTrend === "neutral" && "bg-slate-50 text-slate-600 border-slate-200"
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

          {badgeText && (
            <span className="inline-flex items-center font-semibold px-2 py-0.5 rounded-full border bg-rose-50 text-rose-700 border-rose-200">
              {badgeText}
            </span>
          )}

          {changePeriod && (
            <span className="text-slate-400 font-medium">{changePeriod}</span>
          )}

          {description && (
            <span className="text-slate-500 font-medium block w-full mt-1">
              {description}
            </span>
          )}
        </div>
      </div>
    </Card>
  );
}
