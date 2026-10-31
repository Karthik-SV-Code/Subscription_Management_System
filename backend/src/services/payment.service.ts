import { z } from "zod";
import { prisma } from "../config/database";
import { AppError } from "../middleware/error";
import { toDecimal } from "../utils/invoice-math";
import { PaymentMethod, PaymentStatus, Prisma } from "@prisma/client";

export const createPaymentSchema = z.object({
  invoiceId: z.string().uuid("Invalid invoice UUID"),
  amount: z.number().positive("Payment amount must be greater than 0"),
  paymentMethod: z
    .enum([
      "credit_card",
      "bank_transfer",
      "ach",
      "sepa",
      "wire",
      "manual",
      "CREDIT_CARD",
      "BANK_TRANSFER",
      "ACH",
      "SEPA",
      "WIRE",
      "MANUAL",
    ])
    .default("manual")
    .transform((val) => val.toLowerCase() as PaymentMethod),
  transactionReference: z.string().optional(),
  notes: z.string().optional(),
});

export type CreatePaymentInput = z.infer<typeof createPaymentSchema>;

export interface PaymentListQuery {
  page?: number;
  pageSize?: number;
  invoiceId?: string;
  customerId?: string;
  status?: string;
  paymentMethod?: string;
}

export class PaymentService {
  /**
   * Record a partial or full payment against an invoice inside a PostgreSQL transaction.
   * Updates invoice balance (amountPaid, amountDue), status (PARTIALLY_PAID or PAID),
   * and paidAt timestamp.
   */
  public static async recordPayment(input: CreatePaymentInput) {
    const validated = createPaymentSchema.parse(input);

    return await prisma.$transaction(async (tx) => {
      // 1. Fetch invoice with lock-compatible query
      const invoice = await tx.invoice.findUnique({
        where: { id: validated.invoiceId },
        include: {
          customer: true,
        },
      });

      if (!invoice) {
        throw new AppError(`Invoice with ID ${validated.invoiceId} not found`, 404);
      }

      // Check if invoice is already settled
      const currentDueDec = toDecimal(invoice.amountDue);
      if (invoice.status === "PAID" && currentDueDec.lte(0)) {
        throw new AppError("Invoice is already fully settled (amount due: $0.00)", 400);
      }

      const payAmountDec = toDecimal(validated.amount);
      const currentPaidDec = toDecimal(invoice.amountPaid);
      const totalDec = toDecimal(invoice.total);

      // Compute new paid amount & remaining balance
      const newPaidDec = currentPaidDec.add(payAmountDec);
      let newDueDec = totalDec.minus(newPaidDec);
      if (newDueDec.isNegative()) {
        newDueDec = toDecimal(0);
      }

      const isFullyPaid = newDueDec.equals(toDecimal(0));
      const newInvoiceStatus = isFullyPaid ? "PAID" : "PARTIALLY_PAID";

      // 2. Generate unique transaction reference if none provided
      const txnRef =
        validated.transactionReference?.trim() ||
        `TXN-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

      // 3. Create Payment record
      const payment = await tx.payment.create({
        data: {
          invoiceId: invoice.id,
          customerId: invoice.customerId,
          amount: payAmountDec,
          currency: invoice.currency,
          status: "succeeded",
          paymentMethod: validated.paymentMethod,
          transactionReference: txnRef,
        },
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
              id: true,
              invoiceNumber: true,
              total: true,
              status: true,
            },
          },
        },
      });

      // 4. Update Invoice balance and lifecycle state
      const updatedInvoice = await tx.invoice.update({
        where: { id: invoice.id },
        data: {
          amountPaid: newPaidDec,
          amountDue: newDueDec,
          status: newInvoiceStatus,
          paidAt: isFullyPaid ? new Date() : invoice.paidAt,
          notes: validated.notes
            ? invoice.notes
              ? `${invoice.notes}\nPayment: ${validated.notes}`
              : `Payment: ${validated.notes}`
            : invoice.notes,
        },
      });

      return {
        payment,
        invoice: {
          id: updatedInvoice.id,
          invoiceNumber: updatedInvoice.invoiceNumber,
          total: updatedInvoice.total.toString(),
          amountPaid: updatedInvoice.amountPaid.toString(),
          amountDue: updatedInvoice.amountDue.toString(),
          status: updatedInvoice.status,
          paidAt: updatedInvoice.paidAt,
        },
      };
    });
  }

  /**
   * List payments with pagination and filtering.
   */
  public static async getPayments(query: PaymentListQuery) {
    const page = Math.max(1, Number(query.page) || 1);
    const pageSize = Math.min(100, Math.max(1, Number(query.pageSize) || 10));
    const skip = (page - 1) * pageSize;

    const where: Prisma.PaymentWhereInput = {};

    if (query.invoiceId) {
      where.invoiceId = query.invoiceId;
    }

    if (query.customerId) {
      where.customerId = query.customerId;
    }

    if (query.status) {
      where.status = query.status.toLowerCase() as PaymentStatus;
    }

    if (query.paymentMethod) {
      where.paymentMethod = query.paymentMethod.toLowerCase() as PaymentMethod;
    }

    const [total, payments] = await Promise.all([
      prisma.payment.count({ where }),
      prisma.payment.findMany({
        where,
        skip,
        take: pageSize,
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
              id: true,
              invoiceNumber: true,
              total: true,
              status: true,
            },
          },
        },
      }),
    ]);

    return {
      data: payments,
      pagination: {
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize) || 1,
      },
    };
  }

  /**
   * Retrieve a payment by ID.
   */
  public static async getPaymentById(id: string) {
    const payment = await prisma.payment.findUnique({
      where: { id },
      include: {
        customer: true,
        invoice: {
          include: {
            lineItems: true,
          },
        },
      },
    });

    if (!payment) {
      throw new AppError(`Payment with ID ${id} not found`, 404);
    }

    return payment;
  }
}
