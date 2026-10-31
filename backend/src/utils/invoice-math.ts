import { Prisma } from "@prisma/client";

/**
 * High-precision monetary arithmetic using Prisma Decimal (backed by decimal.js).
 * Avoids any floating-point arithmetic errors.
 */
export function toDecimal(val: number | string | Prisma.Decimal): Prisma.Decimal {
  return new Prisma.Decimal(val);
}

/**
 * Calculates subtotal: unitAmount * quantity
 */
export function calculateSubtotal(
  unitAmount: Prisma.Decimal | number | string,
  quantity: number
): Prisma.Decimal {
  const unitDec = toDecimal(unitAmount);
  return unitDec.mul(quantity).toDecimalPlaces(2, Prisma.Decimal.ROUND_HALF_UP);
}

/**
 * Calculates tax amount: subtotal * (taxRate / 100)
 */
export function calculateTaxAmount(
  subtotal: Prisma.Decimal | number | string,
  taxRatePercent: Prisma.Decimal | number | string
): Prisma.Decimal {
  const subDec = toDecimal(subtotal);
  const rateDec = toDecimal(taxRatePercent);
  return subDec.mul(rateDec).div(100).toDecimalPlaces(2, Prisma.Decimal.ROUND_HALF_UP);
}

/**
 * Calculates total: subtotal + taxAmount
 */
export function calculateTotal(
  subtotal: Prisma.Decimal | number | string,
  taxAmount: Prisma.Decimal | number | string
): Prisma.Decimal {
  const subDec = toDecimal(subtotal);
  const taxDec = toDecimal(taxAmount);
  return subDec.add(taxDec).toDecimalPlaces(2, Prisma.Decimal.ROUND_HALF_UP);
}

/**
 * Generates formatted unique invoice numbers:
 * Format: INV-YYYYMM-{SEQUENCE}-{RANDOM}
 */
export function generateInvoiceNumber(sequence: number = 1): string {
  const now = new Date();
  const year = now.getUTCFullYear();
  const month = String(now.getUTCMonth() + 1).padStart(2, "0");
  const randSuffix = Math.floor(1000 + Math.random() * 9000);
  const seqPadded = String(sequence).padStart(4, "0");
  return `INV-${year}${month}-${seqPadded}-${randSuffix}`;
}

/**
 * Generates an idempotent billing cycle key for duplicate invoice prevention.
 * Database constraint @@unique([subscriptionId, billingPeriodStart, billingPeriodEnd])
 * and unique billingCycleKey enforce this at the storage level.
 */
export function generateInvoiceBillingKey(
  subscriptionId: string,
  periodStart: Date,
  periodEnd: Date
): string {
  const startStr = periodStart.toISOString().split("T")[0];
  const endStr = periodEnd.toISOString().split("T")[0];
  return `inv_${subscriptionId}_${startStr}_to_${endStr}`;
}
