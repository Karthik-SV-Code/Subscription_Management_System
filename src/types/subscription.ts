/**
 * Subscription Lifecycle Types
 */

export type SubscriptionStatus =
  | "active"
  | "trialing"
  | "past_due"
  | "canceled"
  | "paused"
  | "incomplete";

export interface SubscriptionItem {
  id: string;
  subscriptionId: string;
  planId: string;
  planName: string;
  unitAmount: number;
  quantity: number;
}

export interface SubscriptionDiscount {
  id: string;
  code: string;
  percentOff?: number;
  amountOff?: number;
  currency?: string;
  duration: "once" | "repeating" | "forever";
}

export interface Subscription {
  id: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  status: SubscriptionStatus;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  canceledAt?: string;
  trialStart?: string;
  trialEnd?: string;
  mrr: number;
  currency: string;
  items: SubscriptionItem[];
  discount?: SubscriptionDiscount;
  createdAt: string;
  updatedAt: string;
}

export interface SubscriptionCreateInput {
  customerId: string;
  planId: string;
  quantity?: number;
  discountCode?: string;
  trialDays?: number;
}

