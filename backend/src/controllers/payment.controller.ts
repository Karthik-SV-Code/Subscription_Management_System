import { Request, Response, NextFunction } from "express";
import { PaymentService } from "../services/payment.service";
import { sendSuccess, sendPaginated } from "../utils/response";

export class PaymentController {
  public static async getPayments(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const result = await PaymentService.getPayments(req.query as any);
      sendPaginated(
        res,
        result.data,
        result.pagination,
        "Payments retrieved successfully"
      );
    } catch (error) {
      next(error);
    }
  }

  public static async getPaymentById(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const payment = await PaymentService.getPaymentById(req.params.id);
      sendSuccess(res, payment, "Payment retrieved successfully");
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
      const result = await PaymentService.recordPayment(req.body);
      sendSuccess(res, result, "Payment recorded successfully", 201);
    } catch (error) {
      next(error);
    }
  }
}
