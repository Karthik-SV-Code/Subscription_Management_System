import { Request, Response } from "express";
import { checkDatabaseConnection } from "../config/database";
import { env } from "../config/env";
import { sendSuccess } from "../utils/response";

export class HealthController {
  public static async getHealth(_req: Request, res: Response): Promise<void> {
    const isDbConnected = await checkDatabaseConnection();

    const healthData = {
      status: isDbConnected ? "ok" : "degraded",
      service: "SubscriptIQ API",
      version: "1.0.0",
      environment: env.NODE_ENV,
      timestamp: new Date().toISOString(),
      uptime: Math.floor(process.uptime()),
      database: {
        status: isDbConnected ? "connected" : "disconnected",
      },
    };

    // Return 200 even if degraded so health checkers can inspect the response payload
    sendSuccess(res, healthData, "SubscriptIQ API health check", 200);
  }
}
