import * as React from "react";
import { cn } from "@/lib/utils";

export interface StatusBadgeProps {
  status: string;
  label?: string;
  showDot?: boolean;
  className?: string;
}

const STATUS_CONFIGS: Record<
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
  past_due: {
    bg: "bg-amber-50",
    text: "text-amber-700",
    dot: "bg-amber-500",
    border: "border-amber-200",
    defaultLabel: "Past Due",
  },
  open: {
    bg: "bg-blue-50",
    text: "text-blue-700",
    dot: "bg-blue-500",
    border: "border-blue-200",
    defaultLabel: "Open",
  },
  pending: {
    bg: "bg-amber-50",
    text: "text-amber-700",
    dot: "bg-amber-500",
    border: "border-amber-200",
    defaultLabel: "Pending",
  },
  processing: {
    bg: "bg-amber-50",
    text: "text-amber-700",
    dot: "bg-amber-500",
    border: "border-amber-200",
    defaultLabel: "Processing",
  },
  canceled: {
    bg: "bg-rose-50",
    text: "text-rose-700",
    dot: "bg-rose-500",
    border: "border-rose-200",
    defaultLabel: "Canceled",
  },
  failed: {
    bg: "bg-rose-50",
    text: "text-rose-700",
    dot: "bg-rose-500",
    border: "border-rose-200",
    defaultLabel: "Failed",
  },
  paused: {
    bg: "bg-slate-100",
    text: "text-slate-700",
    dot: "bg-slate-400",
    border: "border-slate-200",
    defaultLabel: "Paused",
  },
  inactive: {
    bg: "bg-slate-100",
    text: "text-slate-700",
    dot: "bg-slate-400",
    border: "border-slate-200",
    defaultLabel: "Inactive",
  },
  draft: {
    bg: "bg-slate-100",
    text: "text-slate-600",
    dot: "bg-slate-400",
    border: "border-slate-200",
    defaultLabel: "Draft",
  },
};

export function StatusBadge({
  status,
  label,
  showDot = true,
  className,
}: StatusBadgeProps) {
  const normalizedKey = status.toLowerCase().replace(/\s+/g, "_");
  const config = STATUS_CONFIGS[normalizedKey] || {
    bg: "bg-slate-50",
    text: "text-slate-700",
    dot: "bg-slate-400",
    border: "border-slate-200",
    defaultLabel: status,
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border",
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
    </span>
  );
}
