import { Response, NextFunction } from "express";
import { AuthService } from "../services/auth.service";
import { sendSuccess } from "../utils/response";
import { AuthenticatedRequest } from "../types";

export class AuthController {
  public static async register(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const result = await AuthService.register(req.body);
      sendSuccess(res, result, "User registered successfully", 201);
    } catch (error) {
      next(error);
    }
  }

  public static async login(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const result = await AuthService.login(req.body);
      sendSuccess(res, result, "Login successful", 200);
    } catch (error) {
      next(error);
    }
  }

  public static async getMe(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = req.user!.id;
      const user = await AuthService.getCurrentUser(userId);
      sendSuccess(res, user, "User profile retrieved successfully", 200);
    } catch (error) {
      next(error);
    }
  }
}
