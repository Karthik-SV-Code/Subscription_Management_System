import { Request, Response, NextFunction } from "express";
import { DiscountService } from "../services/discount.service";
import { sendSuccess, sendPaginated } from "../utils/response";

export class DiscountController {
  public static async getDiscounts(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const result = await DiscountService.getDiscounts(req.query as any);
      sendPaginated(
        res,
        result.data,
        result.pagination,
        "Discounts retrieved successfully"
      );
    } catch (error) {
      next(error);
    }
  }

  public static async getDiscountById(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const discount = await DiscountService.getDiscountById(req.params.id);
      sendSuccess(res, discount, "Discount retrieved successfully");
    } catch (error) {
      next(error);
    }
  }

  public static async createDiscount(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const discount = await DiscountService.createDiscount(req.body);
      sendSuccess(res, discount, "Discount created successfully", 201);
    } catch (error) {
      next(error);
    }
  }

  public static async validateDiscount(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const result = await DiscountService.validateDiscount(req.body);
      if (result.valid) {
        sendSuccess(res, result, "Discount code is valid");
      } else {
        res.status(200).json({
          success: false,
          message: result.reason,
          data: result,
        });
      }
    } catch (error) {
      next(error);
    }
  }
}
