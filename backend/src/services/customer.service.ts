import { prisma } from "../config/database";
import { AppError } from "../middleware/error";
import { PaginationMeta } from "../types";
import { CustomerStatus, Prisma } from "@prisma/client";
import { z } from "zod";

// Zod Schemas for Customer
export const customerBillingAddressSchema = z.object({
  line1: z.string().min(1, "Address line 1 is required").trim(),
  line2: z.string().optional(),
  city: z.string().min(1, "City is required").trim(),
  state: z.string().min(1, "State is required").trim(),
  postalCode: z.string().min(1, "Postal code is required").trim(),
  country: z.string().min(1, "Country is required").trim(),
});

export const createCustomerSchema = z.object({
  name: z.string().min(1, "Customer name is required").trim(),
  email: z.string().email("Invalid email address").toLowerCase().trim(),
  companyName: z.string().optional(),
  status: z.enum(["active", "inactive", "lead", "churned"]).optional().default("active"),
  mrr: z.number().min(0, "MRR cannot be negative").optional().default(0),
  currency: z.string().length(3, "Currency must be a 3-letter ISO code").default("USD"),
  billingAddress: customerBillingAddressSchema.optional(),
  taxId: z.string().optional(),
  stripeCustomerId: z.string().optional(),
});

export const updateCustomerSchema = z.object({
  name: z.string().min(1).trim().optional(),
  email: z.string().email("Invalid email address").toLowerCase().trim().optional(),
  companyName: z.string().optional(),
  status: z.enum(["active", "inactive", "lead", "churned"]).optional(),
  mrr: z.number().min(0, "MRR cannot be negative").optional(),
  currency: z.string().length(3).optional(),
  billingAddress: customerBillingAddressSchema.optional(),
  taxId: z.string().optional(),
  stripeCustomerId: z.string().optional(),
});

export const customerQuerySchema = z.object({
  page: z.string().optional().transform((val) => (val ? Math.max(1, parseInt(val, 10) || 1) : 1)),
  pageSize: z.string().optional().transform((val) => (val ? Math.min(100, Math.max(1, parseInt(val, 10) || 10)) : 10)),
  search: z.string().optional(),
  status: z.enum(["active", "inactive", "lead", "churned"]).optional(),
});

export type CreateCustomerInput = z.infer<typeof createCustomerSchema>;
export type UpdateCustomerInput = z.infer<typeof updateCustomerSchema>;
export type CustomerQueryInput = z.infer<typeof customerQuerySchema>;

export class CustomerService {
  /**
   * List customers with pagination, status filtering, and search.
   */
  public static async getCustomers(query: CustomerQueryInput): Promise<{
    customers: unknown[];
    pagination: PaginationMeta;
  }> {
    const page = query.page || 1;
    const pageSize = query.pageSize || 10;
    const skip = (page - 1) * pageSize;

    const where: Prisma.CustomerWhereInput = {};

    if (query.status) {
      where.status = query.status as CustomerStatus;
    }

    if (query.search && query.search.trim().length > 0) {
      const searchTerm = query.search.trim();
      where.OR = [
        { name: { contains: searchTerm, mode: "insensitive" } },
        { email: { contains: searchTerm, mode: "insensitive" } },
        { companyName: { contains: searchTerm, mode: "insensitive" } },
      ];
    }

    const [total, customers] = await Promise.all([
      prisma.customer.count({ where }),
      prisma.customer.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { createdAt: "desc" },
        include: {
          _count: {
            select: { subscriptions: true },
          },
        },
      }),
    ]);

    const formattedCustomers = customers.map((c) => ({
      ...c,
      activeSubscriptionsCount: c._count.subscriptions,
      _count: undefined,
    }));

    return {
      customers: formattedCustomers,
      pagination: {
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize) || 1,
      },
    };
  }

  /**
   * Get single customer by ID with active subscriptions.
   */
  public static async getCustomerById(id: string): Promise<unknown> {
    const customer = await prisma.customer.findUnique({
      where: { id },
      include: {
        subscriptions: {
          include: {
            plan: {
              include: {
                product: true,
              },
            },
          },
        },
      },
    });

    if (!customer) {
      throw new AppError("Customer not found", 404);
    }

    return {
      ...customer,
      activeSubscriptionsCount: customer.subscriptions.filter(
        (s) => s.status === "active" || s.status === "trialing"
      ).length,
    };
  }

  /**
   * Create a new customer.
   */
  public static async createCustomer(data: CreateCustomerInput): Promise<unknown> {
    const existing = await prisma.customer.findUnique({
      where: { email: data.email },
    });

    if (existing) {
      throw new AppError("A customer with this email address already exists", 409);
    }

    const customer = await prisma.customer.create({
      data: {
        name: data.name,
        email: data.email,
        companyName: data.companyName,
        status: data.status as CustomerStatus,
        mrr: data.mrr,
        currency: data.currency.toUpperCase(),
        billingAddress: data.billingAddress ? (data.billingAddress as Prisma.InputJsonValue) : Prisma.JsonNull,
        taxId: data.taxId,
        stripeCustomerId: data.stripeCustomerId,
      },
    });

    return {
      ...customer,
      activeSubscriptionsCount: 0,
    };
  }

  /**
   * Update an existing customer.
   */
  public static async updateCustomer(id: string, data: UpdateCustomerInput): Promise<unknown> {
    const existing = await prisma.customer.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new AppError("Customer not found", 404);
    }

    if (data.email && data.email !== existing.email) {
      const emailTaken = await prisma.customer.findUnique({
        where: { email: data.email },
      });
      if (emailTaken) {
        throw new AppError("A customer with this email address already exists", 409);
      }
    }

    const updateData: Prisma.CustomerUpdateInput = {};

    if (data.name !== undefined) updateData.name = data.name;
    if (data.email !== undefined) updateData.email = data.email;
    if (data.companyName !== undefined) updateData.companyName = data.companyName;
    if (data.status !== undefined) updateData.status = data.status as CustomerStatus;
    if (data.mrr !== undefined) updateData.mrr = data.mrr;
    if (data.currency !== undefined) updateData.currency = data.currency.toUpperCase();
    if (data.billingAddress !== undefined) {
      updateData.billingAddress = data.billingAddress ? (data.billingAddress as Prisma.InputJsonValue) : Prisma.JsonNull;
    }
    if (data.taxId !== undefined) updateData.taxId = data.taxId;
    if (data.stripeCustomerId !== undefined) updateData.stripeCustomerId = data.stripeCustomerId;

    const updated = await prisma.customer.update({
      where: { id },
      data: updateData,
    });

    const activeSubsCount = await prisma.subscription.count({
      where: { customerId: id },
    });

    return {
      ...updated,
      activeSubscriptionsCount: activeSubsCount,
    };
  }

  /**
   * Delete customer (Protected against active subscription references).
   */
  public static async deleteCustomer(id: string): Promise<{ id: string; name: string }> {
    const existing = await prisma.customer.findUnique({
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
      throw new AppError("Customer not found", 404);
    }

    // Requirement 7: Prevent deletion of records that are actively referenced by subscriptions
    if (existing.subscriptions.length > 0) {
      throw new AppError(
        `Cannot delete customer '${existing.name}': actively referenced by ${existing.subscriptions.length} active subscription(s). Cancel or remove subscriptions before deleting.`,
        400
      );
    }

    // Clean up canceled/inactive subscriptions if any exist before customer deletion
    await prisma.subscription.deleteMany({
      where: { customerId: id },
    });

    await prisma.customer.delete({
      where: { id },
    });

    return { id, name: existing.name };
  }
}
