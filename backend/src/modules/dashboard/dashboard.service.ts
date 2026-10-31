import { prisma } from "../../config/database";
import { toDecimal } from "../../utils/invoice-math";
import { Prisma } from "@prisma/client";

export interface DashboardStats {
  totalCustomers: number;
  activeSubscriptions: number;
  totalSubscriptions: number;
  monthlyRecurringRevenue: number;
  totalRevenueCollected: number;
  outstandingAmount: number;
  outstandingInvoices: number;
  paidInvoices: number;
  unpaidInvoices: number;
}

export interface MonthlyRevenue {
  month: string;
  date: string;
  revenue: number;
  invoicesCount: number;
}

export interface ActivityItem {
  id: string;
  type: "INVOICE" | "PAYMENT";
  description: string;
  amount: number;
  currency: string;
  status: string;
  customer: {
    id: string;
    name: string;
    email: string;
    companyName?: string | null;
  };
  date: Date | string;
}

export class DashboardService {
  /**
   * TASK 1 & 2: Calculate comprehensive dashboard statistics directly from PostgreSQL
   * using Decimal-safe arithmetic.
   *
   * MRR Calculation:
   * - Monthly plan: monthly plan price × quantity
   * - Yearly plan: yearly plan price × quantity / 12
   * - Strictly excludes PAUSED, CANCELLED, and expired subscriptions.
   */
  public static async getStats(): Promise<DashboardStats> {
    // 1. Total Customers
    const totalCustomers = await prisma.customer.count();

    // 2. Active Subscriptions
    const activeSubscriptions = await prisma.subscription.count({
      where: {
        status: { in: ["ACTIVE", "active"] },
      },
    });

    // 3. Total Subscriptions
    const totalSubscriptions = await prisma.subscription.count();

    // 4. Monthly Recurring Revenue (MRR) - Decimal Safe
    const activeSubs = await prisma.subscription.findMany({
      where: {
        status: { in: ["ACTIVE", "active"] },
      },
      include: {
        plan: true,
      },
    });

    let mrrDec = toDecimal(0);
    for (const sub of activeSubs) {
      const unitAmount = toDecimal(sub.unitAmount || sub.plan.amount);
      const qty = sub.quantity || 1;
      const subtotal = unitAmount.mul(qty);

      const isYearly =
        sub.billingInterval === "year" || sub.plan.interval === "year";

      // If yearly, MRR = (price * qty) / 12; If monthly, MRR = price * qty
      const subMrr = isYearly
        ? subtotal.div(12)
        : subtotal;

      mrrDec = mrrDec.add(subMrr);
    }
    const monthlyRecurringRevenue = mrrDec
      .toDecimalPlaces(2, Prisma.Decimal.ROUND_HALF_UP)
      .toNumber();

    // 5. Total Revenue Collected (from actual payments and paid invoices)
    const [paymentsSum, invoicePaidSum] = await Promise.all([
      prisma.payment.aggregate({
        where: { status: "succeeded" },
        _sum: { amount: true },
      }),
      prisma.invoice.aggregate({
        _sum: { amountPaid: true },
      }),
    ]);

    const totalRevenueCollected = (
      paymentsSum._sum.amount ||
      invoicePaidSum._sum.amountPaid ||
      toDecimal(0)
    ).toNumber();

    // 6. Outstanding Amount (amountDue from unpaid / overdue / partially paid invoices)
    const outstandingSum = await prisma.invoice.aggregate({
      where: {
        status: {
          in: [
            "UNPAID",
            "unpaid",
            "PARTIALLY_PAID",
            "partially_paid",
            "OVERDUE",
            "overdue",
            "DRAFT",
            "draft",
          ],
        },
      },
      _sum: { amountDue: true },
    });

    const outstandingAmount = (
      outstandingSum._sum.amountDue || toDecimal(0)
    ).toNumber();

    // 7. Paid Invoices Count
    const paidInvoices = await prisma.invoice.count({
      where: {
        status: { in: ["PAID", "paid"] },
      },
    });

    // 8. Unpaid Invoices Count
    const unpaidInvoices = await prisma.invoice.count({
      where: {
        status: {
          in: [
            "UNPAID",
            "unpaid",
            "PARTIALLY_PAID",
            "partially_paid",
            "OVERDUE",
            "overdue",
            "DRAFT",
            "draft",
          ],
        },
      },
    });

    return {
      totalCustomers,
      activeSubscriptions,
      totalSubscriptions,
      monthlyRecurringRevenue,
      totalRevenueCollected,
      outstandingAmount,
      outstandingInvoices: unpaidInvoices,
      paidInvoices,
      unpaidInvoices,
    };
  }

  /**
   * Return monthly revenue for the previous six months grouped by month
   * from actual recorded payment data in a frontend-friendly format.
   */
  public static async getRevenueChart(monthsCount: number = 6): Promise<MonthlyRevenue[]> {
    const now = new Date();
    const months: { label: string; key: string; start: Date; end: Date }[] = [];

    const monthNames = [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    ];

    // Build the 6 monthly date windows
    for (let i = monthsCount - 1; i >= 0; i--) {
      const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - i, 1));
      const year = d.getUTCFullYear();
      const monthIdx = d.getUTCMonth();
      const monthStr = String(monthIdx + 1).padStart(2, "0");
      const key = `${year}-${monthStr}`;
      const label = `${monthNames[monthIdx]} ${year}`;

      const start = new Date(Date.UTC(year, monthIdx, 1, 0, 0, 0));
      const end = new Date(Date.UTC(year, monthIdx + 1, 0, 23, 59, 59, 999));

      months.push({ label, key, start, end });
    }

    const windowStart = months[0].start;

    // Fetch actual payments and paid invoices within window
    const [payments, paidInvoices] = await Promise.all([
      prisma.payment.findMany({
        where: {
          status: "succeeded",
          processedAt: { gte: windowStart },
        },
        select: {
          amount: true,
          processedAt: true,
        },
      }),
      prisma.invoice.findMany({
        where: {
          amountPaid: { gt: 0 },
          paidAt: { gte: windowStart },
        },
        select: {
          amountPaid: true,
          paidAt: true,
        },
      }),
    ]);

    const result: MonthlyRevenue[] = months.map((m) => {
      let revenueDec = toDecimal(0);
      let invoicesCount = 0;

      if (payments.length > 0) {
        // Aggregate from payments
        for (const p of payments) {
          if (p.processedAt >= m.start && p.processedAt <= m.end) {
            revenueDec = revenueDec.add(toDecimal(p.amount));
            invoicesCount++;
          }
        }
      } else {
        // Fallback to paid invoices
        for (const inv of paidInvoices) {
          if (inv.paidAt && inv.paidAt >= m.start && inv.paidAt <= m.end) {
            revenueDec = revenueDec.add(toDecimal(inv.amountPaid));
            invoicesCount++;
          }
        }
      }

      return {
        month: m.label,
        date: m.key,
        revenue: revenueDec.toDecimalPlaces(2, Prisma.Decimal.ROUND_HALF_UP).toNumber(),
        invoicesCount,
      };
    });

    return result;
  }

  /**
   * Return the latest activity (invoices and payments) with customer info,
   * sorted descending by latest activity.
   */
  public static async getRecentActivity(limit: number = 10): Promise<ActivityItem[]> {
    const [invoices, payments] = await Promise.all([
      prisma.invoice.findMany({
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          customer: {
            select: {
              id: true,
              name: true,
              email: true,
              companyName: true,
            },
          },
        },
      }),
      prisma.payment.findMany({
        take: limit,
        orderBy: { processedAt: "desc" },
        include: {
          customer: {
            select: {
              id: true,
              name: true,
              email: true,
              companyName: true,
            },
          },
          invoice: {
            select: {
              invoiceNumber: true,
            },
          },
        },
      }),
    ]);

    const items: ActivityItem[] = [
      ...invoices.map((inv) => ({
        id: inv.id,
        type: "INVOICE" as const,
        description: `Invoice #${inv.invoiceNumber} (${inv.status})`,
        amount: inv.total.toNumber(),
        currency: inv.currency,
        status: inv.status,
        customer: inv.customer,
        date: inv.createdAt,
      })),
      ...payments.map((p) => ({
        id: p.id,
        type: "PAYMENT" as const,
        description: `Payment for Invoice #${p.invoice?.invoiceNumber || "N/A"} via ${p.paymentMethod}`,
        amount: p.amount.toNumber(),
        currency: p.currency,
        status: p.status,
        customer: p.customer,
        date: p.processedAt,
      })),
    ];

    return items
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, limit);
  }
}
