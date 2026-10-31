/**
 * SubscriptIQ Billing Date & Calculation Utilities
 * Handles exact calendar month/year additions, month-end pinning,
 * MRR calculations, and duplicate billing prevention keys.
 */

/**
 * Returns the number of days in a given UTC month and year.
 */
export function getDaysInUtcMonth(year: number, monthZeroIndexed: number): number {
  return new Date(Date.UTC(year, monthZeroIndexed + 1, 0)).getUTCDate();
}

/**
 * Calculates the next billing date for a subscription, properly handling
 * month-end pinning (e.g. Jan 31 -> Feb 28 -> Mar 31) and leap years.
 *
 * @param fromDate Starting or reference date
 * @param interval 'month' | 'year' | 'MONTHLY' | 'YEARLY'
 * @param intervalCount Multiplier (default: 1)
 * @param anchorDate Original signup date to maintain day-of-month alignment
 */
export function calculateNextBillingDate(
  fromDate: Date,
  interval: string,
  intervalCount: number = 1,
  anchorDate?: Date
): Date {
  const normalizedInterval = interval.toLowerCase();
  const anchor = anchorDate || fromDate;
  const anchorDay = anchor.getUTCDate();

  const currentYear = fromDate.getUTCFullYear();
  const currentMonth = fromDate.getUTCMonth();
  const currentHours = fromDate.getUTCHours();
  const currentMinutes = fromDate.getUTCMinutes();
  const currentSeconds = fromDate.getUTCSeconds();
  const currentMillis = fromDate.getUTCMilliseconds();

  if (normalizedInterval === "year" || normalizedInterval === "yearly") {
    const targetYear = currentYear + intervalCount;
    const targetMonth = anchor.getUTCMonth();
    const daysInTargetMonth = getDaysInUtcMonth(targetYear, targetMonth);
    const targetDay = Math.min(anchorDay, daysInTargetMonth);

    return new Date(
      Date.UTC(
        targetYear,
        targetMonth,
        targetDay,
        currentHours,
        currentMinutes,
        currentSeconds,
        currentMillis
      )
    );
  }

  if (normalizedInterval === "month" || normalizedInterval === "monthly") {
    const totalMonths = currentMonth + intervalCount;
    const targetYear = currentYear + Math.floor(totalMonths / 12);
    const targetMonth = ((totalMonths % 12) + 12) % 12;
    const daysInTargetMonth = getDaysInUtcMonth(targetYear, targetMonth);
    const targetDay = Math.min(anchorDay, daysInTargetMonth);

    return new Date(
      Date.UTC(
        targetYear,
        targetMonth,
        targetDay,
        currentHours,
        currentMinutes,
        currentSeconds,
        currentMillis
      )
    );
  }

  if (normalizedInterval === "week") {
    const nextDate = new Date(fromDate.getTime());
    nextDate.setUTCDate(nextDate.getUTCDate() + 7 * intervalCount);
    return nextDate;
  }

  if (normalizedInterval === "quarter") {
    return calculateNextBillingDate(fromDate, "month", 3 * intervalCount, anchor);
  }

  // Default daily interval
  const nextDate = new Date(fromDate.getTime());
  nextDate.setUTCDate(nextDate.getUTCDate() + intervalCount);
  return nextDate;
}

/**
 * Calculates Monthly Recurring Revenue (MRR) based on amount and billing interval.
 */
export function calculateMrr(totalAmount: number, interval: string): number {
  const normalized = interval.toLowerCase();
  if (normalized === "year" || normalized === "yearly") {
    return Math.round((totalAmount / 12) * 100) / 100;
  }
  if (normalized === "quarter") {
    return Math.round((totalAmount / 3) * 100) / 100;
  }
  if (normalized === "week") {
    return Math.round(((totalAmount * 52) / 12) * 100) / 100;
  }
  return Math.round(totalAmount * 100) / 100;
}

/**
 * Generates an idempotent billing key for duplicate-invoice prevention.
 */
export function generateBillingCycleKey(
  subscriptionId: string,
  billingSequence: number,
  periodStart: Date,
  periodEnd: Date
): string {
  const startIso = periodStart.toISOString().split("T")[0];
  const endIso = periodEnd.toISOString().split("T")[0];
  return `sub_${subscriptionId}_seq_${billingSequence}_${startIso}_to_${endIso}`;
}
