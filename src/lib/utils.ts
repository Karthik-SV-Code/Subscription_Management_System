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

/**
 * Trigger browser download of CSV data.
 */
export function downloadCSV(filename: string, rows: Record<string, unknown>[]): boolean {
  if (!rows || !rows.length) return false;
  
  const headers = Object.keys(rows[0]);
  const csvContent = [
    headers.join(","),
    ...rows.map((row) =>
      headers
        .map((header) => {
          const val = row[header] ?? "";
          const escaped = String(val).replace(/"/g, '""');
          return `"${escaped}"`;
        })
        .join(",")
    ),
  ].join("\r\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", filename.endsWith(".csv") ? filename : `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  return true;
}

/**
 * Copy text to clipboard safely.
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator?.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
    const textArea = document.createElement("textarea");
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand("copy");
    document.body.removeChild(textArea);
    return true;
  } catch {
    return false;
  }
}

