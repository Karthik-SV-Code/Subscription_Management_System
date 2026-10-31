/**
 * Portal-specific Types for the Customer User Portal.
 * Reuses core types from @/types/* where possible.
 */

export interface PortalCustomerProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  companyName?: string;
  companyWebsite?: string;
  avatarInitials: string;
  billingAddress?: {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  createdAt: string;
}

export interface PortalActivity {
  id: string;
  type:
    | "subscription_created"
    | "subscription_renewed"
    | "subscription_upgraded"
    | "subscription_downgraded"
    | "subscription_cancelled"
    | "subscription_paused"
    | "subscription_resumed"
    | "payment_succeeded"
    | "payment_failed"
    | "invoice_created"
    | "coupon_applied";
  title: string;
  description: string;
  timestamp: string;
  metadata?: Record<string, string>;
}

export interface SupportTicket {
  id: string;
  subject: string;
  message: string;
  status: "open" | "in_progress" | "resolved" | "closed";
  priority: "low" | "medium" | "high";
  createdAt: string;
  updatedAt: string;
  replies?: {
    id: string;
    sender: "customer" | "support";
    message: string;
    timestamp: string;
  }[];
}

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
}

export interface PlanFeature {
  text: string;
  included: boolean;
}

export interface PricingPlan {
  id: string;
  productName: string;
  planName: string;
  description: string;
  monthlyPrice: number;
  yearlyPrice: number;
  currency: string;
  features: PlanFeature[];
  trialDays: number;
  isPopular?: boolean;
  tier: "starter" | "growth" | "enterprise";
}

