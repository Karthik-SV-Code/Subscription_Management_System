import { prisma } from "../config/database";
import { AppError } from "../middleware/error";
import { PaginationMeta } from "../types";
import {
  calculateNextBillingDate,
  calculateMrr,
  generateBillingCycleKey,
} from "../utils/billing-date";
import { BillingInterval, Prisma, SubscriptionStatus } from "@prisma/client";
import { z } from "zod";

// Zod Schemas
export const createSubscriptionSchema = z.object({
  customerId: z.string().min(1, "Customer ID is required").trim(),
  planId: z.string().min(1, "Plan ID is required").trim(),
  quantity: z
    .number({ invalid_type_error: "Quantity must be an integer" })
    .int("Quantity must be an integer")
    .min(1, "Quantity must be at least 1")
    .default(1),
  startDate: z
    .string()
    .optional()
    .refine((val) => !val || !isNaN(Date.parse(val)), {
      message: "Invalid start date format (ISO 8601 expected)",
    }),
  billingInterval: z
    .enum(["MONTHLY", "YEARLY", "monthly", "yearly", "month", "year"])
    .optional()
    .transform((val) => {
      if (!val) return undefined;
      const lower = val.toLowerCase();
      return lower === "year" || lower === "yearly" ? "year" : "month";
    }),
  metadata: z.record(z.unknown()).optional(),
});

export const updateSubscriptionStatusSchema = z.object({
  status: z
    .enum([
      "ACTIVE",
      "PAUSED",
      "CANCELLED",
      "active",
      "paused",
      "cancelled",
      "canceled",
    ])
    .transform((val) => {
      const upper = val.toUpperCase();
      return (upper === "CANCELED" ? "CANCELLED" : upper) as
        | "ACTIVE"
        | "PAUSED"
        | "CANCELLED";
    }),
  reason: z.string().optional(),
});

export const subscriptionQuerySchema = z.object({
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
      "ACTIVE",
      "PAUSED",
      "CANCELLED",
      "active",
      "paused",
      "cancelled",
      "canceled",
    ])
    .optional()
    .transform((val) => {
      if (!val) return undefined;
      const upper = val.toUpperCase();
      return (upper === "CANCELED" ? "CANCELLED" : upper) as SubscriptionStatus;
    }),
  customerId: z.string().optional(),
  planId: z.string().optional(),
});

export type CreateSubscriptionInput = z.infer<typeof createSubscriptionSchema>;
export type UpdateSubscriptionStatusInput = z.infer<
  typeof updateSubscriptionStatusSchema
>;
export type SubscriptionQueryInput = z.infer<typeof subscriptionQuerySchema>;

/**
 * Valid lifecycle transitions:
 * ACTIVE -> PAUSED
 * PAUSED -> ACTIVE
 * ACTIVE -> CANCELLED
 * PAUSED -> CANCELLED
 */
const VALID_TRANSITIONS: Record<string, string[]> = {
  ACTIVE: ["PAUSED", "CANCELLED"],
  active: ["PAUSED", "CANCELLED"],
  PAUSED: ["ACTIVE", "CANCELLED"],
  paused: ["ACTIVE", "CANCELLED"],
  CANCELLED: [], // Terminal state
  cancelled: [],
  canceled: [],
};

export class SubscriptionService {
  /**
   * Helper to recalculate a customer's active MRR in a transaction.
   */
  private static async recalculateCustomerMrr(
    tx: Prisma.TransactionClient,
    customerId: string
  ): Promise<number> {
    const activeSubscriptions = await tx.subscription.findMany({
      where: {
        customerId,
        status: { in: ["ACTIVE", "active"] },
      },
      select: { mrr: true },
    });

    const totalMrr = activeSubscriptions.reduce((acc, sub) => acc + sub.mrr, 0);
    const roundedMrr = Math.round(totalMrr * 100) / 100;

    await tx.customer.update({
      where: { id: customerId },
      data: { mrr: roundedMrr },
    });

    return roundedMrr;
  }

  /**
   * List subscriptions with pagination, status filtering, and search.
   */
  public static async getSubscriptions(query: SubscriptionQueryInput): Promise<{
    subscriptions: unknown[];
    pagination: PaginationMeta;
  }> {
    const page = query.page || 1;
    const pageSize = query.pageSize || 10;
    const skip = (page - 1) * pageSize;

    const where: Prisma.SubscriptionWhereInput = {};

    if (query.status) {
      where.status = query.status;
    }

    if (query.customerId) {
      where.customerId = query.customerId;
    }

    if (query.planId) {
      where.planId = query.planId;
    }

    if (query.search && query.search.trim().length > 0) {
      const term = query.search.trim();
      where.OR = [
        { customer: { name: { contains: term, mode: "insensitive" } } },
        { customer: { email: { contains: term, mode: "insensitive" } } },
        { plan: { name: { contains: term, mode: "insensitive" } } },
        { plan: { code: { contains: term, mode: "insensitive" } } },
      ];
    }

    const [total, subscriptions] = await Promise.all([
      prisma.subscription.count({ where }),
      prisma.subscription.findMany({
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
          plan: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  code: true,
                },
              },
            },
          },
        },
      }),
    ]);

    return {
      subscriptions,
      pagination: {
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize) || 1,
      },
    };
  }

  /**
   * Get single subscription by ID.
   */
  public static async getSubscriptionById(id: string): Promise<unknown> {
    const subscription = await prisma.subscription.findUnique({
      where: { id },
      include: {
        customer: true,
        plan: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!subscription) {
      throw new AppError("Subscription not found", 404);
    }

    return subscription;
  }

  /**
   * Create a new subscription referencing an existing customer and plan.
   * Calculates next billing date (including month-end handling), total, and MRR.
   */
  public static async createSubscription(
    data: CreateSubscriptionInput
  ): Promise<unknown> {
    // 1. Validate customer exists
    const customer = await prisma.customer.findUnique({
      where: { id: data.customerId },
    });
    if (!customer) {
      throw new AppError(`Customer with ID '${data.customerId}' not found`, 404);
    }

    // 2. Validate plan exists and is active
    const plan = await prisma.plan.findUnique({
      where: { id: data.planId },
      include: { product: true },
    });
    if (!plan) {
      throw new AppError(`Plan with ID '${data.planId}' not found`, 404);
    }
    if (!plan.isActive) {
      throw new AppError(`Plan '${plan.name}' is archived or inactive`, 400);
    }

    // 3. Determine billing interval and calculate amounts
    const intervalStr = data.billingInterval || (plan.interval === "year" ? "year" : "month");
    const intervalEnum: BillingInterval = intervalStr === "year" ? "year" : "month";
    const quantity = data.quantity || 1;
    const unitAmount = plan.amount;
    const totalAmount = Math.round(unitAmount * quantity * 100) / 100;
    const mrr = calculateMrr(totalAmount, intervalStr);

    // 4. Calculate accurate dates including month-end pinning
    const startDate = data.startDate ? new Date(data.startDate) : new Date();
    const currentPeriodStart = new Date(startDate.getTime());
    const currentPeriodEnd = calculateNextBillingDate(
      currentPeriodStart,
      intervalStr,
      1,
      startDate
    );
    const nextBillingDate = new Date(currentPeriodEnd.getTime());
    const billingCycleAnchor = new Date(startDate.getTime());

    // 5. Execute transaction to create subscription and update customer MRR
    const subscription = await prisma.$transaction(async (tx) => {
      const created = await tx.subscription.create({
        data: {
          customerId: data.customerId,
          planId: data.planId,
          status: "ACTIVE",
          quantity,
          unitAmount,
          totalAmount,
          mrr,
          currency: plan.currency,
          billingInterval: intervalEnum,
          startDate,
          currentPeriodStart,
          currentPeriodEnd,
          nextBillingDate,
          billingCycleAnchor,
          billingSequence: 1,
          metadata: data.metadata ? (data.metadata as Prisma.InputJsonValue) : Prisma.JsonNull,
        },
      });

      // Update with idempotent duplicate-invoice prevention key
      const lastBillingKey = generateBillingCycleKey(
        created.id,
        1,
        currentPeriodStart,
        currentPeriodEnd
      );
      const updatedSub = await tx.subscription.update({
        where: { id: created.id },
        data: { lastBillingKey },
        include: {
          customer: true,
          plan: {
            include: {
              product: true,
            },
          },
        },
      });

      // Recalculate customer active MRR
      await SubscriptionService.recalculateCustomerMrr(tx, data.customerId);

      return updatedSub;
    });

    return subscription;
  }

  /**
   * Update subscription lifecycle status with strict transition validation:
   * - ACTIVE to PAUSED
   * - PAUSED to ACTIVE
   * - ACTIVE or PAUSED to CANCELLED
   * - Rejects invalid transitions (e.g. CANCELLED to any status)
   */
  public static async updateStatus(
    id: string,
    data: UpdateSubscriptionStatusInput
  ): Promise<unknown> {
    const subscription = await prisma.subscription.findUnique({
      where: { id },
    });

    if (!subscription) {
      throw new AppError("Subscription not found", 404);
    }

    const currentStatus = subscription.status.toUpperCase();
    const targetStatus = data.status;

    if (currentStatus === targetStatus) {
      throw new AppError(
        `Subscription is already in '${targetStatus}' status`,
        400
      );
    }

    // Enforce terminal CANCELLED state
    if (currentStatus === "CANCELLED" || currentStatus === "CANCELED") {
      throw new AppError(
        `Cannot transition subscription from CANCELLED to ${targetStatus}. Cancelled subscriptions are terminal.`,
        400
      );
    }

    // Verify valid lifecycle transition
    const allowed = VALID_TRANSITIONS[currentStatus] || [];
    if (!allowed.includes(targetStatus)) {
      throw new AppError(
        `Invalid status transition: Cannot transition subscription from '${currentStatus}' to '${targetStatus}'. Allowed transitions from ${currentStatus}: [${allowed.join(
          ", "
        )}]`,
        400
      );
    }

    const now = new Date();
    const updateData: Prisma.SubscriptionUpdateInput = {
      status: targetStatus as SubscriptionStatus,
    };

    if (targetStatus === "PAUSED") {
      updateData.pausedAt = now;
    } else if (targetStatus === "ACTIVE") {
      updateData.pausedAt = null;
    } else if (targetStatus === "CANCELLED") {
      updateData.canceledAt = now;
      updateData.cancelAtPeriodEnd = false;
    }

    const updated = await prisma.$transaction(async (tx) => {
      const sub = await tx.subscription.update({
        where: { id },
        data: updateData,
        include: {
          customer: true,
          plan: {
            include: {
              product: true,
            },
          },
        },
      });

      // Recalculate customer MRR (paused and cancelled subs are excluded from active MRR)
      await SubscriptionService.recalculateCustomerMrr(tx, subscription.customerId);

      return sub;
    });

    return {
      subscription: updated,
      previousStatus: currentStatus,
      newStatus: targetStatus,
      transitionTimestamp: now.toISOString(),
    };
  }

  /**
   * Renews an active subscription for its next billing period.
   * Excludes cancelled subscriptions and paused subscriptions.
   * Accurately rolls forward period dates while preserving month-end alignment.
   */
  public static async renewSubscription(id: string): Promise<unknown> {
    const subscription = await prisma.subscription.findUnique({
      where: { id },
      include: {
        plan: true,
      },
    });

    if (!subscription) {
      throw new AppError("Subscription not found", 404);
    }

    const currentStatus = subscription.status.toUpperCase();

    // Requirement 11: Ensure cancelled subscriptions are excluded from recurring billing
    if (currentStatus === "CANCELLED" || currentStatus === "CANCELED") {
      throw new AppError(
        "Cannot renew a cancelled subscription. Cancelled subscriptions are excluded from recurring billing.",
        400
      );
    }

    if (currentStatus === "PAUSED") {
      throw new AppError(
        "Cannot renew a paused subscription. Subscription must be active to process recurring renewal.",
        400
      );
    }

    if (currentStatus !== "ACTIVE") {
      throw new AppError(
        `Only active subscriptions can be renewed. Current status: ${subscription.status}`,
        400
      );
    }

    // Calculate next period dates using month-end anchor pinning
    const newPeriodStart = new Date(subscription.currentPeriodEnd.getTime());
    const intervalStr =
      subscription.billingInterval === "year" ? "year" : "month";
    const newPeriodEnd = calculateNextBillingDate(
      newPeriodStart,
      intervalStr,
      1,
      subscription.billingCycleAnchor
    );
    const newSequence = subscription.billingSequence + 1;
    const newBillingKey = generateBillingCycleKey(
      subscription.id,
      newSequence,
      newPeriodStart,
      newPeriodEnd
    );

    const updated = await prisma.subscription.update({
      where: { id },
      data: {
        currentPeriodStart: newPeriodStart,
        currentPeriodEnd: newPeriodEnd,
        nextBillingDate: newPeriodEnd,
        lastBilledAt: new Date(),
        billingSequence: newSequence,
        lastBillingKey: newBillingKey,
      },
      include: {
        customer: true,
        plan: {
          include: {
            product: true,
          },
        },
      },
    });

    return {
      subscription: updated,
      renewalSummary: {
        previousPeriodEnd: subscription.currentPeriodEnd,
        newPeriodStart,
        newPeriodEnd,
        billingSequence: newSequence,
        idempotentBillingKey: newBillingKey,
        amountBilled: updated.totalAmount,
        currency: updated.currency,
      },
    };
  }

  /**
   * Service function for determining subscriptions due for recurring billing.
   * Requirement 10: Query subscriptions due for billing.
   * Requirement 11: Strictly excludes cancelled and paused subscriptions.
   */
  public static async getSubscriptionsDueForBilling(options?: {
    asOfDate?: Date;
    limit?: number;
  }): Promise<unknown[]> {
    const asOfDate = options?.asOfDate || new Date();
    const limit = options?.limit || 100;

    return prisma.subscription.findMany({
      where: {
        status: { in: ["ACTIVE", "active"] }, // Cancelled & paused are strictly excluded
        nextBillingDate: { lte: asOfDate },
      },
      take: limit,
      include: {
        customer: true,
        plan: {
          include: {
            product: true,
          },
        },
      },
      orderBy: {
        nextBillingDate: "asc",
      },
    });
  }
}
