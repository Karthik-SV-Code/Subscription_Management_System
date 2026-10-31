import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export interface StatusBadgeProps {
  status: string;
  label?: string;
  showDot?: boolean;
  className?: string;
}

const STATUS_VARIANTS: Record<
  string,
  {
    bg: string;
    text: string;
    dot: string;
    border: string;
    defaultLabel: string;
  }
> = {
  active: {
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    dot: "bg-emerald-500",
    border: "border-emerald-200",
    defaultLabel: "Active",
  },
  paid: {
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    dot: "bg-emerald-500",
    border: "border-emerald-200",
    defaultLabel: "Paid",
  },
  succeeded: {
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    dot: "bg-emerald-500",
    border: "border-emerald-200",
    defaultLabel: "Succeeded",
  },
  trialing: {
    bg: "bg-indigo-50",
    text: "text-indigo-700",
    dot: "bg-indigo-500",
    border: "border-indigo-200",
    defaultLabel: "Trialing",
  },
  trial: {
    bg: "bg-indigo-50",
    text: "text-indigo-700",
    dot: "bg-indigo-500",
    border: "border-indigo-200",
    defaultLabel: "Trial",
  },
  past_due: {
    bg: "bg-rose-50",
    text: "text-rose-700",
    dot: "bg-rose-500",
    border: "border-rose-200",
    defaultLabel: "Past Due",
  },
  overdue: {
    bg: "bg-rose-50",
    text: "text-rose-700",
    dot: "bg-rose-500",
    border: "border-rose-200",
    defaultLabel: "Overdue",
  },
  open: {
    bg: "bg-sky-50",
    text: "text-sky-700",
    dot: "bg-sky-500",
    border: "border-sky-200",
    defaultLabel: "Open",
  },
  pending: {
    bg: "bg-sky-50",
    text: "text-sky-700",
    dot: "bg-sky-500",
    border: "border-sky-200",
    defaultLabel: "Pending",
  },
  partially_paid: {
    bg: "bg-amber-50",
    text: "text-amber-700",
    dot: "bg-amber-500",
    border: "border-amber-200",
    defaultLabel: "Partially Paid",
  },
  canceled: {
    bg: "bg-rose-50",
    text: "text-rose-700",
    dot: "bg-rose-500",
    border: "border-rose-200",
    defaultLabel: "Canceled",
  },
  cancelled: {
    bg: "bg-rose-50",
    text: "text-rose-700",
    dot: "bg-rose-500",
    border: "border-rose-200",
    defaultLabel: "Cancelled",
  },
  failed: {
    bg: "bg-rose-50",
    text: "text-rose-700",
    dot: "bg-rose-500",
    border: "border-rose-200",
    defaultLabel: "Failed",
  },
  paused: {
    bg: "bg-amber-50/80",
    text: "text-amber-800",
    dot: "bg-amber-500",
    border: "border-amber-200",
    defaultLabel: "Paused",
  },
  draft: {
    bg: "bg-slate-100",
    text: "text-slate-600",
    dot: "bg-slate-400",
    border: "border-slate-200",
    defaultLabel: "Draft",
  },
  void: {
    bg: "bg-slate-100",
    text: "text-slate-500",
    dot: "bg-slate-400",
    border: "border-slate-200",
    defaultLabel: "Void",
  },
  uncollectible: {
    bg: "bg-rose-50",
    text: "text-rose-700",
    dot: "bg-rose-500",
    border: "border-rose-200",
    defaultLabel: "Uncollectible",
  },
};

export function StatusBadge({
  status,
  label,
  showDot = true,
  className,
}: StatusBadgeProps) {
  const normalizedKey = status.toLowerCase().replace(/\s+/g, "_");
  const config = STATUS_VARIANTS[normalizedKey] || {
    bg: "bg-slate-50",
    text: "text-slate-700",
    dot: "bg-slate-400",
    border: "border-slate-200",
    defaultLabel: status,
  };

  return (
    <Badge
      variant="outline"
      className={cn(
        "gap-1.5 px-2.5 py-0.5 font-medium border text-xs capitalize",
        config.bg,
        config.text,
        config.border,
        className
      )}
    >
      {showDot && (
        <span
          className={cn("h-1.5 w-1.5 rounded-full shrink-0", config.dot)}
          aria-hidden="true"
        />
      )}
      <span>{label || config.defaultLabel}</span>
    </Badge>
  );
}

