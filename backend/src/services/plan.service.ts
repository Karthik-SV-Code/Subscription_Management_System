import { prisma } from "../config/database";
import { AppError } from "../middleware/error";
import { PaginationMeta } from "../types";
import { BillingInterval, PricingModel, Prisma } from "@prisma/client";
import { z } from "zod";

// Zod Schemas for Plan
export const createPlanSchema = z.object({
  productId: z.string().min(1, "Product ID is required").trim(),
  name: z.string().min(1, "Plan name is required").trim(),
  code: z
    .string()
    .min(2, "Plan code must be at least 2 characters")
    .max(50, "Plan code must not exceed 50 characters")
    .trim()
    .toUpperCase(),
  description: z.string().optional(),
  amount: z
    .number({ invalid_type_error: "Price amount must be a number" })
    .min(0, "Price amount must be non-negative (>= 0)")
    .refine((val) => Number.isFinite(val), { message: "Invalid price value" }),
  currency: z.string().length(3, "Currency must be a 3-letter ISO code").default("USD"),
  interval: z.enum(["day", "week", "month", "quarter", "year"]).default("month"),
  intervalCount: z.number().int().min(1, "Interval count must be at least 1").default(1),
  pricingModel: z.enum(["flat_fee", "per_seat", "tiered", "usage_based"]).default("flat_fee"),
  trialPeriodDays: z.number().int().min(0, "Trial period cannot be negative").default(0),
  isActive: z.boolean().optional().default(true),
});

export const updatePlanSchema = z.object({
  productId: z.string().min(1).trim().optional(),
  name: z.string().min(1).trim().optional(),
  code: z
    .string()
    .min(2)
    .max(50)
    .trim()
    .toUpperCase()
    .optional(),
  description: z.string().optional(),
  amount: z
    .number({ invalid_type_error: "Price amount must be a number" })
    .min(0, "Price amount must be non-negative (>= 0)")
    .refine((val) => Number.isFinite(val), { message: "Invalid price value" })
    .optional(),
  currency: z.string().length(3).optional(),
  interval: z.enum(["day", "week", "month", "quarter", "year"]).optional(),
  intervalCount: z.number().int().min(1).optional(),
  pricingModel: z.enum(["flat_fee", "per_seat", "tiered", "usage_based"]).optional(),
  trialPeriodDays: z.number().int().min(0).optional(),
  isActive: z.boolean().optional(),
});

export const planQuerySchema = z.object({
  page: z.string().optional().transform((val) => (val ? Math.max(1, parseInt(val, 10) || 1) : 1)),
  pageSize: z.string().optional().transform((val) => (val ? Math.min(100, Math.max(1, parseInt(val, 10) || 10)) : 10)),
  search: z.string().optional(),
  productId: z.string().optional(),
  interval: z.enum(["day", "week", "month", "quarter", "year"]).optional(),
  isActive: z
    .string()
    .optional()
    .transform((val) => (val === undefined ? undefined : val === "true")),
});

export type CreatePlanInput = z.infer<typeof createPlanSchema>;
export type UpdatePlanInput = z.infer<typeof updatePlanSchema>;
export type PlanQueryInput = z.infer<typeof planQuerySchema>;

export class PlanService {
  /**
   * List plans with pagination, search, productId filter, and parent product details.
   */
  public static async getPlans(query: PlanQueryInput): Promise<{
    plans: unknown[];
    pagination: PaginationMeta;
  }> {
    const page = query.page || 1;
    const pageSize = query.pageSize || 10;
    const skip = (page - 1) * pageSize;

    const where: Prisma.PlanWhereInput = {};

    if (query.productId) {
      where.productId = query.productId;
    }

    if (query.interval) {
      where.interval = query.interval as BillingInterval;
    }

    if (query.isActive !== undefined) {
      where.isActive = query.isActive;
    }

    if (query.search && query.search.trim().length > 0) {
      const searchTerm = query.search.trim();
      where.OR = [
        { name: { contains: searchTerm, mode: "insensitive" } },
        { code: { contains: searchTerm, mode: "insensitive" } },
        { description: { contains: searchTerm, mode: "insensitive" } },
      ];
    }

    const [total, plans] = await Promise.all([
      prisma.plan.count({ where }),
      prisma.plan.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { amount: "asc" },
        include: {
          product: {
            select: {
              id: true,
              name: true,
              code: true,
              status: true,
            },
          },
          _count: {
            select: { subscriptions: true },
          },
        },
      }),
    ]);

    const formattedPlans = plans.map((p) => ({
      ...p,
      activeSubscriptionsCount: p._count.subscriptions,
      _count: undefined,
    }));

    return {
      plans: formattedPlans,
      pagination: {
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize) || 1,
      },
    };
  }

  /**
   * Get single plan by ID with parent product.
   */
  public static async getPlanById(id: string): Promise<unknown> {
    const plan = await prisma.plan.findUnique({
      where: { id },
      include: {
        product: true,
        _count: {
          select: { subscriptions: true },
        },
      },
    });

    if (!plan) {
      throw new AppError("Plan not found", 404);
    }

    return {
      ...plan,
      activeSubscriptionsCount: plan._count.subscriptions,
      _count: undefined,
    };
  }

  /**
   * Create a new plan associated with a product.
   */
  public static async createPlan(data: CreatePlanInput): Promise<unknown> {
    // Validate price
    if (data.amount < 0 || !Number.isFinite(data.amount)) {
      throw new AppError("Plan price must be a valid non-negative number", 400);
    }

    // Verify parent product exists
    const product = await prisma.product.findUnique({
      where: { id: data.productId },
    });

    if (!product) {
      throw new AppError(`Associated product with ID '${data.productId}' not found`, 404);
    }

    // Verify code uniqueness
    const existing = await prisma.plan.findUnique({
      where: { code: data.code },
    });

    if (existing) {
      throw new AppError(`A plan with code '${data.code}' already exists`, 409);
    }

    const plan = await prisma.plan.create({
      data: {
        productId: data.productId,
        name: data.name,
        code: data.code,
        description: data.description,
        amount: data.amount,
        currency: data.currency.toUpperCase(),
        interval: data.interval as BillingInterval,
        intervalCount: data.intervalCount,
        pricingModel: data.pricingModel as PricingModel,
        trialPeriodDays: data.trialPeriodDays,
        isActive: data.isActive,
      },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
      },
    });

    return plan;
  }

  /**
   * Update an existing plan.
   */
  public static async updatePlan(id: string, data: UpdatePlanInput): Promise<unknown> {
    const existing = await prisma.plan.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new AppError("Plan not found", 404);
    }

    // Validate price if updated
    if (data.amount !== undefined && (data.amount < 0 || !Number.isFinite(data.amount))) {
      throw new AppError("Plan price must be a valid non-negative number", 400);
    }

    // Verify product exists if changed
    if (data.productId && data.productId !== existing.productId) {
      const product = await prisma.product.findUnique({
        where: { id: data.productId },
      });
      if (!product) {
        throw new AppError(`Associated product with ID '${data.productId}' not found`, 404);
      }
    }

    // Verify code uniqueness if changed
    if (data.code && data.code !== existing.code) {
      const codeTaken = await prisma.plan.findUnique({
        where: { code: data.code },
      });
      if (codeTaken) {
        throw new AppError(`A plan with code '${data.code}' already exists`, 409);
      }
    }

    const updateData: Prisma.PlanUpdateInput = {};

    if (data.name !== undefined) updateData.name = data.name;
    if (data.code !== undefined) updateData.code = data.code;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.amount !== undefined) updateData.amount = data.amount;
    if (data.currency !== undefined) updateData.currency = data.currency.toUpperCase();
    if (data.interval !== undefined) updateData.interval = data.interval as BillingInterval;
    if (data.intervalCount !== undefined) updateData.intervalCount = data.intervalCount;
    if (data.pricingModel !== undefined) updateData.pricingModel = data.pricingModel as PricingModel;
    if (data.trialPeriodDays !== undefined) updateData.trialPeriodDays = data.trialPeriodDays;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;

    if (data.productId !== undefined) {
      updateData.product = { connect: { id: data.productId } };
    }

    const updated = await prisma.plan.update({
      where: { id },
      data: updateData,
      include: {
        product: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
      },
    });

    return updated;
  }

  /**
   * Delete plan (Blocked if actively referenced by subscriptions).
   */
  public static async deletePlan(id: string): Promise<{ id: string; name: string }> {
    const existing = await prisma.plan.findUnique({
      where: { id },
      include: {
        subscriptions: {
          where: {
            status: { in: ["active", "trialing", "past_due", "paused"] },
          },
        },
      },
    });

    if (!existing) {
      throw new AppError("Plan not found", 404);
    }

    // Requirement 7: Prevent deletion of records that are actively referenced by subscriptions
    if (existing.subscriptions.length > 0) {
      throw new AppError(
        `Cannot delete plan '${existing.name}': actively referenced by ${existing.subscriptions.length} active subscription(s).`,
        400
      );
    }

    // Clean up inactive subscriptions if any
    await prisma.subscription.deleteMany({
      where: { planId: id },
    });

    await prisma.plan.delete({
      where: { id },
    });

    return { id, name: existing.name };
  }
}
