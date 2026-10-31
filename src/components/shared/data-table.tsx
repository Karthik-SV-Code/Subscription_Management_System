"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { LoadingSkeleton } from "@/components/shared/loading-skeleton";
import { EmptyState } from "@/components/shared/empty-state";

export interface Column<T> {
  key: string;
  header: string | React.ReactNode;
  cell?: (item: T) => React.ReactNode;
  className?: string;
  align?: "left" | "center" | "right";
}

export interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  onRowClick?: (item: T) => void;
  className?: string;
}

export function DataTable<T extends { id?: string | number }>({
  columns,
  data,
  loading = false,
  emptyTitle = "No records found",
  emptyDescription = "There are no entries to display at this time.",
  onRowClick,
  className,
}: DataTableProps<T>) {
  if (loading) {
    return <LoadingSkeleton type="table" rows={5} columns={columns.length} />;
  }

  if (data.length === 0) {
    return <EmptyState title={emptyTitle} description={emptyDescription} />;
  }

  return (
    <div
      className={cn(
        "w-full overflow-hidden rounded-[20px] border border-[#EAECEF] bg-white shadow-[0_2px_10px_rgba(0,0,0,0.03)]",
        className
      )}
    >
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="border-b border-[#EAECEF] bg-slate-50/70 text-[11px] font-bold uppercase tracking-wider text-[#737373]">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  scope="col"
                  className={cn(
                    "px-6 py-4",
                    col.align === "right" && "text-right",
                    col.align === "center" && "text-center",
                    col.className
                  )}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#EAECEF] text-[#171717]">
            {data.map((item, index) => {
              const rowKey = item.id ? String(item.id) : String(index);
              return (
                <tr
                  key={rowKey}
                  onClick={() => onRowClick?.(item)}
                  className={cn(
                    "transition-colors hover:bg-slate-50/70",
                    onRowClick && "cursor-pointer"
                  )}
                >
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className={cn(
                        "px-6 py-4 align-middle",
                        col.align === "right" && "text-right",
                        col.align === "center" && "text-center",
                        col.className
                      )}
                    >
                      {col.cell
                        ? col.cell(item)
                        : (item as Record<string, unknown>)[col.key] !== undefined
                        ? String((item as Record<string, unknown>)[col.key])
                        : null}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
