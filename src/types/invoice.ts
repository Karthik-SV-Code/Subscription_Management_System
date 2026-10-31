/**
 * Invoice & Payment Types
 */

export type InvoiceStatus =
  | "draft"
  | "open"
  | "paid"
  | "pending"
  | "overdue"
  | "partially_paid"
  | "uncollectible"
  | "void";

export type PaymentStatus = "succeeded" | "pending" | "failed" | "refunded";

export type PaymentMethod = "credit_card" | "bank_transfer" | "ach" | "sepa" | "wire";

export interface InvoiceLineItem {
  id: string;
  description: string;
  amount: number;
  quantity: number;
  unitAmount: number;
  periodStart?: string;
  periodEnd?: string;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  subscriptionId?: string;
  status: InvoiceStatus;
  subtotal: number;
  tax: number;
  discountTotal: number;
  total: number;
  amountPaid: number;
  amountDue: number;
  currency: string;
  invoiceDate?: string;
  dueDate: string;
  paidAt?: string;
  lineItems: InvoiceLineItem[];
  pdfUrl?: string;
  createdAt: string;
}

export interface Payment {
  id: string;
  invoiceId: string;
  invoiceNumber: string;
  customerId: string;
  customerName: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  paymentMethod: PaymentMethod;
  lastFour?: string;
  failureReason?: string;
  transactionReference: string;
  processedAt: string;
}

