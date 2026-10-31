import { z } from "zod";
import { prisma } from "../config/database";
import { AppError } from "../middleware/error";
import { toDecimal } from "../utils/invoice-math";
import { DiscountType, Prisma } from "@prisma/client";

export const createDiscountSchema = z
  .object({
    code: z
      .string()
      .min(2, "Discount code must be at least 2 characters")
      .max(30, "Discount code cannot exceed 30 characters")
      .regex(
        /^[A-Za-z0-9_-]+$/,
        "Code can only contain letters, numbers, dashes and underscores"
      )
      .transform((val) => val.toUpperCase().trim()),
    name: z.string().optional(),
    description: z.string().optional(),
    type: z
      .enum(["PERCENTAGE", "FIXED", "percentage", "fixed"])
      .default("PERCENTAGE")
      .transform((val) => val.toUpperCase() as "PERCENTAGE" | "FIXED"),
    value: z.number().positive("Discount value must be greater than 0"),
    currency: z.string().default("USD"),
    maxUses: z.number().int().positive().nullable().optional(),
    expiresAt: z.string().datetime().optional().nullable(),
    isActive: z.boolean().default(true),
  })
  .refine(
    (data) => {
      if (data.type === "PERCENTAGE" && data.value > 100) {
        return false;
      }
      return true;
    },
    {
      message: "Percentage discount cannot exceed 100%",
      path: ["value"],
    }
  );

export type CreateDiscountInput = z.infer<typeof createDiscountSchema>;

export const validateDiscountSchema = z.object({
  code: z
    .string()
    .min(1, "Discount code is required")
    .transform((v) => v.toUpperCase().trim()),
  amount: z.number().nonnegative().optional(),
  customerId: z.string().uuid().optional(),
});

export type ValidateDiscountInput = z.infer<typeof validateDiscountSchema>;

export interface DiscountListQuery {
  page?: number;
  pageSize?: number;
  search?: string;
  isActive?: string | boolean;
  type?: string;
}

export class DiscountService {
  /**
   * Create a new discount code (percentage or fixed amount).
   */
  public static async createDiscount(input: CreateDiscountInput) {
    const validated = createDiscountSchema.parse(input);

    const existing = await prisma.discount.findUnique({
      where: { code: validated.code },
    });

    if (existing) {
      throw new AppError(`Discount code '${validated.code}' already exists`, 409);
    }

    const discount = await prisma.discount.create({
      data: {
        code: validated.code,
        name: validated.name,
        description: validated.description,
        type: validated.type as DiscountType,
        value: toDecimal(validated.value),
        currency: validated.currency,
        maxUses: validated.maxUses ?? null,
        expiresAt: validated.expiresAt ? new Date(validated.expiresAt) : null,
        isActive: validated.isActive,
      },
    });

    return discount;
  }

  /**
   * List discounts with pagination and search.
   */
  public static async getDiscounts(query: DiscountListQuery) {
    const page = Math.max(1, Number(query.page) || 1);
    const pageSize = Math.min(100, Math.max(1, Number(query.pageSize) || 10));
    const skip = (page - 1) * pageSize;

    const where: Prisma.DiscountWhereInput = {};

    if (query.search) {
      where.OR = [
        { code: { contains: query.search, mode: "insensitive" } },
        { name: { contains: query.search, mode: "insensitive" } },
      ];
    }

    if (query.isActive !== undefined) {
      where.isActive =
        query.isActive === true || query.isActive === "true";
    }

    if (query.type) {
      where.type = query.type.toUpperCase() as DiscountType;
    }

    const [total, discounts] = await Promise.all([
      prisma.discount.count({ where }),
      prisma.discount.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { createdAt: "desc" },
      }),
    ]);

    return {
      data: discounts,
      pagination: {
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize) || 1,
      },
    };
  }

  /**
   * Retrieve discount by UUID.
   */
  public static async getDiscountById(id: string) {
    const discount = await prisma.discount.findUnique({
      where: { id },
    });

    if (!discount) {
      throw new AppError(`Discount with ID ${id} not found`, 404);
    }

    return discount;
  }

  /**
   * Validate a discount code for eligibility, expiration, and usage limits.
   * Also computes the calculated discount amount if an invoice subtotal amount is passed.
   */
  public static async validateDiscount(input: ValidateDiscountInput) {
    const validated = validateDiscountSchema.parse(input);

    const discount = await prisma.discount.findUnique({
      where: { code: validated.code },
    });

    if (!discount) {
      return {
        valid: false,
        reason: `Discount code '${validated.code}' not found`,
      };
    }

    if (!discount.isActive) {
      return {
        valid: false,
        reason: `Discount code '${discount.code}' is currently inactive`,
        discount: {
          code: discount.code,
          isActive: false,
        },
      };
    }

    if (discount.expiresAt && new Date(discount.expiresAt) < new Date()) {
      return {
        valid: false,
        reason: `Discount code '${discount.code}' expired on ${discount.expiresAt.toISOString()}`,
        discount: {
          code: discount.code,
          expiresAt: discount.expiresAt,
        },
      };
    }

    if (discount.maxUses !== null && discount.usedCount >= discount.maxUses) {
      return {
        valid: false,
        reason: `Discount code '${discount.code}' usage limit has been reached (${discount.usedCount}/${discount.maxUses})`,
        discount: {
          code: discount.code,
          maxUses: discount.maxUses,
          usedCount: discount.usedCount,
        },
      };
    }

    let calculatedDiscountAmount = 0;
    if (validated.amount !== undefined && validated.amount > 0) {
      const amountDec = toDecimal(validated.amount);
      const valDec = toDecimal(discount.value);

      if (discount.type === "PERCENTAGE" || (discount.type as string) === "percentage") {
        calculatedDiscountAmount = amountDec
          .mul(valDec)
          .div(100)
          .toDecimalPlaces(2, Prisma.Decimal.ROUND_HALF_UP)
          .toNumber();
      } else {
        calculatedDiscountAmount = Prisma.Decimal.min(valDec, amountDec)
          .toDecimalPlaces(2, Prisma.Decimal.ROUND_HALF_UP)
          .toNumber();
      }
    }

    return {
      valid: true,
      discount: {
        id: discount.id,
        code: discount.code,
        name: discount.name,
        type: discount.type,
        value: discount.value.toNumber(),
        currency: discount.currency,
        maxUses: discount.maxUses,
        usedCount: discount.usedCount,
        expiresAt: discount.expiresAt,
        calculatedDiscountAmount,
      },
    };
  }

  /**
   * Helper to increment usage count when a discount code is successfully applied.
   */
  public static async incrementUsage(code: string) {
    try {
      await prisma.discount.update({
        where: { code },
        data: {
          usedCount: { increment: 1 },
        },
      });
    } catch {
      // Non-critical if code is arbitrary
    }
  }
}
