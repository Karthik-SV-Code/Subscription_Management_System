export interface Discount {
  id: string;
  code: string;
  name: string;
  percentOff?: number;
  amountOff?: number;
  currency?: string;
  duration: "once" | "repeating" | "forever";
  durationInMonths?: number;
  maxRedemptions?: number;
  timesRedeemed: number;
  isActive: boolean;
  expiresAt?: string;
  createdAt: string;
}

export interface DiscountCreateInput {
  code: string;
  name: string;
  percentOff?: number;
  amountOff?: number;
  duration: "once" | "repeating" | "forever";
  maxRedemptions?: number;
}

