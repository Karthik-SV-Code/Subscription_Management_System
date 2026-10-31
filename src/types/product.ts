/**
 * Product & Pricing Plan Types
 */

export type ProductStatus = "active" | "archived" | "draft";

export type BillingInterval = "day" | "week" | "month" | "quarter" | "year";

export type PricingModel = "flat_fee" | "per_seat" | "tiered" | "usage_based";

export interface PricingTier {
  id: string;
  planId: string;
  upTo?: number | null; // null represents infinite/unlimited tier
  unitAmount: number;
  flatFee?: number;
}

export interface Plan {
  id: string;
  productId: string;
  name: string;
  code: string;
  description?: string;
  amount: number;
  currency: string;
  interval: BillingInterval;
  intervalCount: number;
  pricingModel: PricingModel;
  trialPeriodDays: number;
  tiers?: PricingTier[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Product {
  id: string;
  name: string;
  code: string;
  description?: string;
  status: ProductStatus;
  plansCount: number;
  activeSubscriptionsCount: number;
  features: string[];
  plans?: Plan[];
  createdAt: string;
  updatedAt: string;
}

export interface ProductCreateInput {
  name: string;
  code: string;
  description?: string;
  features?: string[];
}

