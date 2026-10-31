import { Request, Response, NextFunction } from "express";
import { SubscriptionService } from "../services/subscription.service";
import { sendSuccess, sendPaginated } from "../utils/response";

export class SubscriptionController {
  public static async getSubscriptions(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const result = await SubscriptionService.getSubscriptions(
        req.query as any
      );
      sendPaginated(
        res,
        result.subscriptions,
        result.pagination,
        "Subscriptions retrieved successfully"
      );
    } catch (error) {
      next(error);
    }
  }

  public static async getSubscriptionById(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const subscription = await SubscriptionService.getSubscriptionById(
        req.params.id
      );
      sendSuccess(res, subscription, "Subscription retrieved successfully");
    } catch (error) {
      next(error);
    }
  }

  public static async createSubscription(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const subscription = await SubscriptionService.createSubscription(
        req.body
      );
      sendSuccess(res, subscription, "Subscription created successfully", 201);
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
      const result = await SubscriptionService.updateStatus(
        req.params.id,
        req.body
      );
      sendSuccess(res, result, "Subscription status updated successfully");
    } catch (error) {
      next(error);
    }
  }

  public static async renewSubscription(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const result = await SubscriptionService.renewSubscription(req.params.id);
      sendSuccess(res, result, "Subscription renewed successfully");
    } catch (error) {
      next(error);
    }
  }

  public static async getDueForBilling(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const asOfDate = req.query.asOfDate
        ? new Date(String(req.query.asOfDate))
        : new Date();
      const limit = req.query.limit ? parseInt(String(req.query.limit), 10) : 100;
      const subscriptions =
        await SubscriptionService.getSubscriptionsDueForBilling({
          asOfDate,
          limit,
        });
      sendSuccess(
        res,
        {
          asOfDate: asOfDate.toISOString(),
          count: subscriptions.length,
          subscriptions,
        },
        "Subscriptions due for recurring billing retrieved successfully"
      );
    } catch (error) {
      next(error);
    }
  }
}
