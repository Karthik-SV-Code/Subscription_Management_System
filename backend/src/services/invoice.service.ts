import { prisma } from "../config/database";
import { AppError } from "../middleware/error";
import { PaginationMeta } from "../types";
import { calculateNextBillingDate, generateBillingCycleKey } from "../utils/billing-date";
import {
  calculateSubtotal,
  calculateTaxAmount,
  calculateTotal,
  generateInvoiceNumber,
  generateInvoiceBillingKey,
  toDecimal,
} from "../utils/invoice-math";
import { InvoiceStatus, Prisma } from "@prisma/client";
import { z } from "zod";

// Zod Validation Schemas
export const generateInvoicesSchema = z.object({
  asOfDate: z
    .string()
    .optional()
    .refine((val) => !val || !isNaN(Date.parse(val)), {
      message: "Invalid asOfDate format (ISO 8601 expected)",
    }),
  subscriptionId: z.string().optional(),
  customerId: z.string().optional(),
  taxRate: z
    .number({ invalid_type_error: "taxRate must be a number" })
    .min(0, "taxRate cannot be negative")
    .max(100, "taxRate cannot exceed 100%")
    .optional()
    .default(0),
  dueDateDays: z
    .number()
    .int()
    .min(0)
    .max(90)
    .optional()
    .default(14),
});

export const updateInvoiceStatusSchema = z.object({
  status: z
    .enum([
      "DRAFT",
      "UNPAID",
      "PARTIALLY_PAID",
      "PAID",
      "OVERDUE",
      "draft",
      "unpaid",
      "partially_paid",
      "paid",
      "overdue",
    ])
    .transform((val) => {
      const upper = val.toUpperCase();
      return upper as "DRAFT" | "UNPAID" | "PARTIALLY_PAID" | "PAID" | "OVERDUE";
    }),
  amountPaid: z.number().min(0).optional(),
  notes: z.string().optional(),
});

export const invoiceQuerySchema = z.object({
  page: z
    .string()
    .optional()
    .transform((val) => (val ? Math.max(1, parseInt(val, 10) || 1) : 1)),
  pageSize: z
    .string()
    .optional()
    .transform((val) =>
      val ? Math.min(100, Math.max(1, parseInt(val, 10) || 10)) : 10
    ),
  search: z.string().optional(),
  status: z
    .enum([
      "DRAFT",
      "UNPAID",
      "PARTIALLY_PAID",
      "PAID",
      "OVERDUE",
      "draft",
      "unpaid",
      "partially_paid",
      "paid",
      "overdue",
    ])
    .optional()
    .transform((val) => {
      if (!val) return undefined;
      return val.toUpperCase() as InvoiceStatus;
    }),
  customerId: z.string().optional(),
  subscriptionId: z.string().optional(),
});

export type GenerateInvoicesInput = z.infer<typeof generateInvoicesSchema>;
export type UpdateInvoiceStatusInput = z.infer<typeof updateInvoiceStatusSchema>;
export type InvoiceQueryInput = z.infer<typeof invoiceQuerySchema>;

export class InvoiceService {
  /**
   * Retrieves invoices with pagination, customer filter, status filter, and search.
   */
  public static async getInvoices(query: InvoiceQueryInput): Promise<{
    invoices: unknown[];
    pagination: PaginationMeta;
  }> {
    const page = query.page || 1;
    const pageSize = query.pageSize || 10;
    const skip = (page - 1) * pageSize;

    const where: Prisma.InvoiceWhereInput = {};

    if (query.status) {
      where.status = query.status;
    }

    if (query.customerId) {
      where.customerId = query.customerId;
    }

    if (query.subscriptionId) {
      where.subscriptionId = query.subscriptionId;
    }

    if (query.search && query.search.trim().length > 0) {
      const term = query.search.trim();
      where.OR = [
        { invoiceNumber: { contains: term, mode: "insensitive" } },
        { customer: { name: { contains: term, mode: "insensitive" } } },
        { customer: { email: { contains: term, mode: "insensitive" } } },
      ];
    }

    const [total, invoices] = await Promise.all([
      prisma.invoice.count({ where }),
      prisma.invoice.findMany({
        where,
        skip,
        take: pageSize,
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
          lineItems: true,
          subscription: {
            select: {
              id: true,
              status: true,
              billingInterval: true,
            },
          },
        },
      }),
    ]);

    return {
      invoices,
      pagination: {
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize) || 1,
      },
    };
  }

  /**
   * Get invoice details by UUID including line items and customer info.
   */
  public static async getInvoiceById(id: string): Promise<unknown> {
    const invoice = await prisma.invoice.findUnique({
      where: { id },
      include: {
        customer: true,
        lineItems: true,
        subscription: {
          include: {
            plan: true,
          },
        },
      },
    });

    if (!invoice) {
      throw new AppError("Invoice not found", 404);
    }

    return invoice;
  }

  /**
   * Generates recurring invoices for active subscriptions due for billing.
   * - Strictly excludes CANCELLED and PAUSED subscriptions.
   * - Uses PostgreSQL Decimal arithmetic without floating-point errors.
   * - Stores line-item snapshots preserving pricing history.
   * - Prevents duplicate invoices for the same subscription and period.
   * - Executes invoice creation and billing date advancement in a Prisma transaction.
   */
  public static async generateInvoices(input: GenerateInvoicesInput): Promise<{
    generatedCount: number;
    skippedCount: number;
    totalAmountBilled: string;
    invoices: unknown[];
  }> {
    const asOfDate = input.asOfDate ? new Date(input.asOfDate) : new Date();

    const subscriptionWhere: Prisma.SubscriptionWhereInput = {
      status: { in: ["ACTIVE", "active"] }, // Excludes CANCELLED and PAUSED
      nextBillingDate: { lte: asOfDate },
    };

    if (input.subscriptionId) {
      subscriptionWhere.id = input.subscriptionId;
    }

    if (input.customerId) {
      subscriptionWhere.customerId = input.customerId;
    }

    // Retrieve eligible active subscriptions
    const dueSubscriptions = await prisma.subscription.findMany({
      where: subscriptionWhere,
      include: {
        customer: true,
        plan: true,
      },
      orderBy: { nextBillingDate: "asc" },
    });

    let generatedCount = 0;
    let skippedCount = 0;
    let cumulativeBilled = toDecimal(0);
    const createdInvoices: unknown[] = [];

    for (const sub of dueSubscriptions) {
      // Duplicate prevention: Compute unique billing key for this subscription and period
      const billingCycleKey = generateInvoiceBillingKey(
        sub.id,
        sub.currentPeriodStart,
        sub.currentPeriodEnd
      );

      // Check if an invoice was already generated for this exact subscription and cycle
      const existing = await prisma.invoice.findFirst({
        where: {
          OR: [
            { billingCycleKey },
            {
              subscriptionId: sub.id,
              billingPeriodStart: sub.currentPeriodStart,
              billingPeriodEnd: sub.currentPeriodEnd,
            },
          ],
        },
      });

      if (existing) {
        skippedCount++;
        continue;
      }

      // Calculate monetary amounts with high-precision Decimal arithmetic
      const unitAmountDec = toDecimal(sub.unitAmount);
      const subtotal = calculateSubtotal(unitAmountDec, sub.quantity);
      const taxRateDec = toDecimal(input.taxRate || 0);
      const taxAmount = calculateTaxAmount(subtotal, taxRateDec);
      const total = calculateTotal(subtotal, taxAmount);

      const now = new Date();
      const dueDate = new Date(
        now.getTime() + (input.dueDateDays || 14) * 86400000
      );
      const invoiceNumber = generateInvoiceNumber(sub.billingSequence);

      // Execute invoice creation + billing cycle roll forward in a single transaction
      try {
        const result = await prisma.$transaction(async (tx) => {
          // 1. Create Invoice Record
          const invoice = await tx.invoice.create({
            data: {
              invoiceNumber,
              customerId: sub.customerId,
              subscriptionId: sub.id,
              status: "UNPAID",
              currency: sub.currency,
              subtotal,
              taxRate: taxRateDec,
              taxAmount,
              total,
              amountPaid: toDecimal(0),
              amountDue: total,
              billingPeriodStart: sub.currentPeriodStart,
              billingPeriodEnd: sub.currentPeriodEnd,
              billingCycleKey,
              invoiceDate: now,
              dueDate,
            },
          });

          // 2. Create Line-Item Snapshot (Preserves historical prices even if plan changes)
          const lineItemDescription = `${sub.plan.name} (${sub.billingInterval}) x ${sub.quantity}`;
          await tx.invoiceLineItem.create({
            data: {
              invoiceId: invoice.id,
              description: lineItemDescription,
              quantity: sub.quantity,
              unitAmount: unitAmountDec,
              amount: subtotal,
              planId: sub.planId,
              planName: sub.plan.name,
              planCode: sub.plan.code,
              periodStart: sub.currentPeriodStart,
              periodEnd: sub.currentPeriodEnd,
            },
          });

          // 3. Advance Subscription's Billing Period (Using month-end pinning)
          const newPeriodStart = new Date(sub.currentPeriodEnd.getTime());
          const intervalStr =
            sub.billingInterval === "year" ? "year" : "month";
          const newPeriodEnd = calculateNextBillingDate(
            newPeriodStart,
            intervalStr,
            1,
            sub.billingCycleAnchor
          );
          const newSequence = sub.billingSequence + 1;
          const newBillingKey = generateBillingCycleKey(
            sub.id,
            newSequence,
            newPeriodStart,
            newPeriodEnd
          );

          await tx.subscription.update({
            where: { id: sub.id },
            data: {
              currentPeriodStart: newPeriodStart,
              currentPeriodEnd: newPeriodEnd,
              nextBillingDate: newPeriodEnd,
              lastBilledAt: now,
              billingSequence: newSequence,
              lastBillingKey: newBillingKey,
            },
          });

          return tx.invoice.findUnique({
            where: { id: invoice.id },
            include: {
              customer: {
                select: { id: true, name: true, email: true },
              },
              lineItems: true,
            },
          });
        });

        if (result) {
          generatedCount++;
          cumulativeBilled = cumulativeBilled.add(total);
          createdInvoices.push(result);
        }
      } catch (txError: any) {
        // If unique constraint hit concurrently, record as duplicate prevented
        if (txError?.code === "P2002") {
          skippedCount++;
        } else {
          throw txError;
        }
      }
    }

    return {
      generatedCount,
      skippedCount,
      totalAmountBilled: cumulativeBilled.toFixed(2),
      invoices: createdInvoices,
    };
  }

  /**
   * Updates an invoice's status (DRAFT, UNPAID, PARTIALLY_PAID, PAID, OVERDUE)
   * Handles payment amounts and timestamps.
   */
  public static async updateInvoiceStatus(
    id: string,
    input: UpdateInvoiceStatusInput
  ): Promise<unknown> {
    const invoice = await prisma.invoice.findUnique({
      where: { id },
    });

    if (!invoice) {
      throw new AppError("Invoice not found", 404);
    }

    const updateData: Prisma.InvoiceUpdateInput = {
      status: input.status,
    };

    if (input.notes !== undefined) {
      updateData.notes = input.notes;
    }

    if (input.status === "PAID") {
      updateData.paidAt = new Date();
      updateData.amountPaid = invoice.total;
      updateData.amountDue = toDecimal(0);
    } else if (input.status === "PARTIALLY_PAID") {
      const paidDec = toDecimal(input.amountPaid || 0);
      const totalDec = invoice.total;
      updateData.amountPaid = paidDec;
      updateData.amountDue = totalDec.minus(paidDec);
    } else if (input.status === "UNPAID" || input.status === "DRAFT") {
      updateData.amountPaid = toDecimal(0);
      updateData.amountDue = invoice.total;
      updateData.paidAt = null;
    }

    const updated = await prisma.invoice.update({
      where: { id },
      data: updateData,
      include: {
        customer: true,
        lineItems: true,
      },
    });

    return updated;
  }
}
