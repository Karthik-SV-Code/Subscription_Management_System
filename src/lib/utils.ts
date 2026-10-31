import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, parseISO } from "date-fns";

/**
 * Utility for combining Tailwind CSS classes with clsx and twMerge.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/**
 * Format numerical amounts to standard currency strings.
 */
export function formatCurrency(
  amount: number,
  currency: string = "USD",
  locale: string = "en-US"
): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Format standard date values into human readable strings.
 */
export function formatDate(
  date: string | Date | number,
  pattern: string = "MMM dd, yyyy"
): string {
  try {
    const targetDate = typeof date === "string" ? parseISO(date) : new Date(date);
    return format(targetDate, pattern);
  } catch {
    return String(date);
  }
}

/**
 * Format numbers with compact notation or standard thousand separators.
 */
export function formatNumber(
  value: number,
  options?: Intl.NumberFormatOptions
): string {
  return new Intl.NumberFormat("en-US", options).format(value);
}

/**
 * Format a decimal or fractional value to a percentage string.
 */
export function formatPercentage(
  value: number,
  includeSign: boolean = false
): string {
  const formatted = `${value.toFixed(1)}%`;
  if (includeSign && value > 0) {
    return `+${formatted}`;
  }
  return formatted;
}

