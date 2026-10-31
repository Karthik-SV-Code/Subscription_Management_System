import * as React from "react";
import { CustomerStatus } from "@/types/customer";
import { StatusBadge } from "@/components/shared/status-badge";

export interface CustomerStatusBadgeProps {
  status: CustomerStatus;
  className?: string;
}

export function CustomerStatusBadge({
  status,
  className,
}: CustomerStatusBadgeProps) {
  return <StatusBadge status={status} className={className} />;
}

