import * as React from "react";
import { FolderOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  actionElement?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  actionElement,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-[20px] border border-dashed border-[#EAECEF] bg-white p-12 text-center shadow-[0_2px_10px_rgba(0,0,0,0.03)]",
        className
      )}
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-50 text-[#171717] border border-[#EAECEF]">
        {icon || <FolderOpen className="h-6 w-6" />}
      </div>
      <h3 className="mt-4 text-base font-bold text-[#171717]">{title}</h3>
      <p className="mt-1 text-xs text-[#737373] max-w-sm leading-relaxed">{description}</p>
      {(actionLabel || actionElement) && (
        <div className="mt-6">
          {actionElement || (
            <Button
              onClick={onAction}
              className="bg-[#171717] hover:bg-black text-white text-xs font-semibold rounded-xl px-5 py-2.5 shadow-sm"
            >
              {actionLabel}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
