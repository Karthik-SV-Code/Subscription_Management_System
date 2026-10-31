import * as React from "react";
import { cn } from "@/lib/utils";

export interface PageHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  description?: string;
  badge?: React.ReactNode;
  actions?: React.ReactNode;
}

export function PageHeader({
  title,
  description,
  badge,
  actions,
  className,
  ...props
}: PageHeaderProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4 pb-2 sm:flex-row sm:items-center sm:justify-between",
        className
      )}
      {...props}
    >
      <div className="space-y-1">
        <div className="flex items-center gap-2.5">
          <h2 className="text-xl font-bold tracking-tight text-[#171717]">
            {title}
          </h2>
          {badge}
        </div>
        {description && (
          <p className="text-xs text-[#737373] max-w-2xl">{description}</p>
        )}
      </div>
      {actions && (
        <div className="flex items-center gap-3 shrink-0">{actions}</div>
      )}
    </div>
  );
}
