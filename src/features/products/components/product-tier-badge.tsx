import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { PricingModel } from "@/types/product";

export interface ProductTierBadgeProps {
  pricingModel: PricingModel;
  className?: string;
}

const MODEL_LABELS: Record<PricingModel, string> = {
  flat_fee: "Flat Fee",
  per_seat: "Per Seat",
  tiered: "Tiered",
  usage_based: "Usage Based",
};

export function ProductTierBadge({
  pricingModel,
  className,
}: ProductTierBadgeProps) {
  return (
    <Badge
      variant="outline"
      className={`border-indigo-200 bg-indigo-50/50 text-indigo-700 text-xs font-medium ${className || ""}`}
    >
      {MODEL_LABELS[pricingModel] || pricingModel}
    </Badge>
  );
}

