import { Request, Response, NextFunction } from "express";
import { InvoiceService } from "../services/invoice.service";
import { sendSuccess, sendPaginated } from "../utils/response";

export class InvoiceController {
  public static async getInvoices(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const result = await InvoiceService.getInvoices(req.query as any);
      sendPaginated(
        res,
        result.invoices,
        result.pagination,
        "Invoices retrieved successfully"
      );
    } catch (error) {
      next(error);
    }
  }

  public static async getInvoiceById(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const invoice = await InvoiceService.getInvoiceById(req.params.id);
      sendSuccess(res, invoice, "Invoice retrieved successfully");
    } catch (error) {
      next(error);
    }
  }

  public static async generateInvoices(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const result = await InvoiceService.generateInvoices(req.body);
      sendSuccess(
        res,
        result,
        `Recurring invoice generation completed: ${result.generatedCount} generated, ${result.skippedCount} duplicates skipped`,
        201
      );
    } catch (error) {
      next(error);
    }
  }

  public static async updateStatus(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const updated = await InvoiceService.updateInvoiceStatus(
        req.params.id,
        req.body
      );
      sendSuccess(res, updated, "Invoice status updated successfully");
    } catch (error) {
      next(error);
    }
  }

  public static async applyDiscount(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const updated = await InvoiceService.applyDiscount(
        req.params.id,
        req.body
      );
      sendSuccess(res, updated, "Discount applied to invoice successfully");
    } catch (error) {
      next(error);
    }
  }

  public static async recordPayment(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const result = await InvoiceService.recordPayment(
        req.params.id,
        req.body
      );
      sendSuccess(res, result, "Payment recorded against invoice successfully", 201);
    } catch (error) {
      next(error);
    }
  }
}
