export type AdminRole = "Super Admin" | "Admin" | "Finance Manager" | "Support Staff";

export type AdminUserStatus = "Active" | "Inactive" | "Suspended";

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: AdminRole;
  status: AdminUserStatus;
  lastLogin: string;
  department: string;
  createdAt: string;
}

export interface AccountActivity {
  id: string;
  customerName: string;
  customerEmail: string;
  activityType: "Plan Upgrade" | "New Customer" | "Invoice Paid" | "Payment Failed" | "Subscription Paused" | "Seats Added";
  description: string;
  planName: string;
  amount?: number;
  status: "Completed" | "Pending" | "Attention";
  timestamp: string;
}

export interface TransactionRecord {
  id: string;
  transactionRef: string;
  customerName: string;
  customerEmail: string;
  amount: number;
  currency: string;
  paymentMethod: "Credit Card" | "ACH Wire" | "SEPA Debit" | "Stripe";
  status: "Succeeded" | "Processing" | "Failed" | "Refunded";
  invoiceId: string;
  date: string;
}

export interface SubscriptionActivity {
  id: string;
  subscriptionId: string;
  customerName: string;
  eventType: "New Subscription" | "Annual Renewal" | "Plan Upgrade" | "Seat Expansion" | "Cancellation" | "Paused";
  planName: string;
  mrrDelta: number;
  cadence: "Monthly" | "Annual" | "Quarterly";
  timestamp: string;
}

