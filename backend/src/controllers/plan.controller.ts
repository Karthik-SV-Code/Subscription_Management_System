import { Request, Response, NextFunction } from "express";
import { PlanService } from "../services/plan.service";
import { sendSuccess, sendPaginated } from "../utils/response";

export class PlanController {
  public static async getPlans(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const result = await PlanService.getPlans(req.query as any);
      sendPaginated(
        res,
        result.plans,
        result.pagination,
        "Plans retrieved successfully"
      );
    } catch (error) {
      next(error);
    }
  }

  public static async getPlanById(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const plan = await PlanService.getPlanById(req.params.id);
      sendSuccess(res, plan, "Plan retrieved successfully");
    } catch (error) {
      next(error);
    }
  }

  public static async createPlan(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const plan = await PlanService.createPlan(req.body);
      sendSuccess(res, plan, "Plan created successfully", 201);
    } catch (error) {
      next(error);
    }
  }

  public static async updatePlan(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const plan = await PlanService.updatePlan(req.params.id, req.body);
      sendSuccess(res, plan, "Plan updated successfully");
    } catch (error) {
      next(error);
    }
  }

  public static async deletePlan(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const result = await PlanService.deletePlan(req.params.id);
      sendSuccess(res, result, `Plan '${result.name}' deleted successfully`);
    } catch (error) {
      next(error);
    }
  }
}
