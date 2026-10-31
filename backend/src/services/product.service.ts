import { prisma } from "../config/database";
import { AppError } from "../middleware/error";
import { PaginationMeta } from "../types";
import { ProductStatus, Prisma } from "@prisma/client";
import { z } from "zod";

// Zod Schemas for Product
export const createProductSchema = z.object({
  name: z.string().min(1, "Product name is required").trim(),
  code: z
    .string()
    .min(2, "Product code must be at least 2 characters")
    .max(50, "Product code must not exceed 50 characters")
    .trim()
    .toUpperCase(),
  description: z.string().optional(),
  status: z.enum(["active", "archived", "draft"]).optional().default("active"),
  features: z.array(z.string().trim()).optional().default([]),
});

export const updateProductSchema = z.object({
  name: z.string().min(1).trim().optional(),
  code: z
    .string()
    .min(2)
    .max(50)
    .trim()
    .toUpperCase()
    .optional(),
  description: z.string().optional(),
  status: z.enum(["active", "archived", "draft"]).optional(),
  features: z.array(z.string().trim()).optional(),
});

export const productQuerySchema = z.object({
  page: z.string().optional().transform((val) => (val ? Math.max(1, parseInt(val, 10) || 1) : 1)),
  pageSize: z.string().optional().transform((val) => (val ? Math.min(100, Math.max(1, parseInt(val, 10) || 10)) : 10)),
  search: z.string().optional(),
  status: z.enum(["active", "archived", "draft"]).optional(),
});

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type ProductQueryInput = z.infer<typeof productQuerySchema>;

export class ProductService {
  /**
   * List products with pagination, search, status filtering, and child plans.
   */
  public static async getProducts(query: ProductQueryInput): Promise<{
    products: unknown[];
    pagination: PaginationMeta;
  }> {
    const page = query.page || 1;
    const pageSize = query.pageSize || 10;
    const skip = (page - 1) * pageSize;

    const where: Prisma.ProductWhereInput = {};

    if (query.status) {
      where.status = query.status as ProductStatus;
    }

    if (query.search && query.search.trim().length > 0) {
      const searchTerm = query.search.trim();
      where.OR = [
        { name: { contains: searchTerm, mode: "insensitive" } },
        { code: { contains: searchTerm, mode: "insensitive" } },
        { description: { contains: searchTerm, mode: "insensitive" } },
      ];
    }

    const [total, products] = await Promise.all([
      prisma.product.count({ where }),
      prisma.product.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { createdAt: "desc" },
        include: {
          plans: true,
          _count: {
            select: { plans: true },
          },
        },
      }),
    ]);

    const formattedProducts = products.map((p) => ({
      ...p,
      plansCount: p._count.plans,
      _count: undefined,
    }));

    return {
      products: formattedProducts,
      pagination: {
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize) || 1,
      },
    };
  }

  /**
   * Get product details with associated plans.
   */
  public static async getProductById(id: string): Promise<unknown> {
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        plans: {
          orderBy: { amount: "asc" },
        },
      },
    });

    if (!product) {
      throw new AppError("Product not found", 404);
    }

    return {
      ...product,
      plansCount: product.plans.length,
    };
  }

  /**
   * Create a new product.
   */
  public static async createProduct(data: CreateProductInput): Promise<unknown> {
    const existing = await prisma.product.findUnique({
      where: { code: data.code },
    });

    if (existing) {
      throw new AppError(`A product with code '${data.code}' already exists`, 409);
    }

    const product = await prisma.product.create({
      data: {
        name: data.name,
        code: data.code,
        description: data.description,
        status: data.status as ProductStatus,
        features: data.features || [],
      },
      include: {
        plans: true,
      },
    });

    return {
      ...product,
      plansCount: 0,
    };
  }

  /**
   * Update an existing product.
   */
  public static async updateProduct(id: string, data: UpdateProductInput): Promise<unknown> {
    const existing = await prisma.product.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new AppError("Product not found", 404);
    }

    if (data.code && data.code !== existing.code) {
      const codeTaken = await prisma.product.findUnique({
        where: { code: data.code },
      });
      if (codeTaken) {
        throw new AppError(`A product with code '${data.code}' already exists`, 409);
      }
    }

    const updateData: Prisma.ProductUpdateInput = {};

    if (data.name !== undefined) updateData.name = data.name;
    if (data.code !== undefined) updateData.code = data.code;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.status !== undefined) updateData.status = data.status as ProductStatus;
    if (data.features !== undefined) updateData.features = data.features;

    const updated = await prisma.product.update({
      where: { id },
      data: updateData,
      include: {
        plans: true,
      },
    });

    return {
      ...updated,
      plansCount: updated.plans.length,
    };
  }

  /**
   * Delete product (Blocked if plans are actively referenced by subscriptions).
   */
  public static async deleteProduct(id: string): Promise<{ id: string; name: string }> {
    const existing = await prisma.product.findUnique({
      where: { id },
      include: {
        plans: {
          select: { id: true, name: true },
        },
      },
    });

    if (!existing) {
      throw new AppError("Product not found", 404);
    }

    // Requirement 7: Prevent deletion of records that are actively referenced by subscriptions
    const planIds = existing.plans.map((p) => p.id);
    if (planIds.length > 0) {
      const activeSubsCount = await prisma.subscription.count({
        where: {
          planId: { in: planIds },
          status: { in: ["active", "trialing", "past_due", "paused"] },
        },
      });

      if (activeSubsCount > 0) {
        throw new AppError(
          `Cannot delete product '${existing.name}': plans under this product are referenced by ${activeSubsCount} active subscription(s).`,
          400
        );
      }

      // Safe to delete non-active subscriptions and plans
      await prisma.subscription.deleteMany({
        where: { planId: { in: planIds } },
      });

      await prisma.plan.deleteMany({
        where: { productId: id },
      });
    }

    await prisma.product.delete({
      where: { id },
    });

    return { id, name: existing.name };
  }
}
