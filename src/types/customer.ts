/**
 * Customer Types & Interfaces
 */

export type CustomerStatus = "active" | "inactive" | "lead" | "churned";

export interface CustomerBillingAddress {
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  companyName?: string;
  status: CustomerStatus;
  mrr: number;
  currency: string;
  activeSubscriptionsCount: number;
  billingAddress?: CustomerBillingAddress;
  taxId?: string;
  stripeCustomerId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CustomerCreateInput {
  name: string;
  email: string;
  companyName?: string;
  billingAddress?: CustomerBillingAddress;
  taxId?: string;
}

export interface CustomerUpdateInput extends Partial<CustomerCreateInput> {
  status?: CustomerStatus;
}

