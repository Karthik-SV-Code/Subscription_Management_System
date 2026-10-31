import { Request, Response, NextFunction } from "express";
import { DashboardService } from "./dashboard.service";
import { sendSuccess } from "../../utils/response";

export class DashboardController {
  public static async getStats(
    _req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const stats = await DashboardService.getStats();
      sendSuccess(res, stats, "Dashboard statistics retrieved successfully");
    } catch (error) {
      next(error);
    }
  }

  public static async getRevenue(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const months = req.query.months ? parseInt(String(req.query.months), 10) : 6;
      const revenue = await DashboardService.getRevenueChart(months);
      sendSuccess(res, revenue, "Monthly revenue metrics retrieved successfully");
    } catch (error) {
      next(error);
    }
  }

  public static async getRecentActivity(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const limit = req.query.limit ? parseInt(String(req.query.limit), 10) : 10;
      const activity = await DashboardService.getRecentActivity(limit);
      sendSuccess(res, activity, "Recent activity retrieved successfully");
    } catch (error) {
      next(error);
    }
  }
}
