import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import { Prisma } from "@prisma/client";
import { sendError } from "../utils/response";
import { env } from "../config/env";

export class AppError extends Error {
  public statusCode: number;
  public isOperational: boolean;
  public details?: unknown;

  constructor(message: string, statusCode: number = 400, details?: unknown) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    this.details = details;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export function notFoundHandler(
  req: Request,
  res: Response,
  _next: NextFunction
): Response {
  return sendError(
    res,
    `Cannot ${req.method} ${req.originalUrl} - Route not found`,
    404
  );
}

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): Response {
  // Operational AppError
  if (err instanceof AppError) {
    return sendError(res, err.message, err.statusCode, err.details);
  }

  // Zod Validation Error
  if (err instanceof ZodError) {
    const formattedErrors = err.errors.map((e) => ({
      field: e.path.join("."),
      message: e.message,
    }));
    return sendError(res, "Validation failed", 400, formattedErrors);
  }

  // Prisma Unique Constraint Violation
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === "P2002") {
      const target = (err.meta?.target as string[]) || ["field"];
      return sendError(
        res,
        `A record with this ${target.join(", ")} already exists`,
        409,
        { target }
      );
    }
    if (err.code === "P2025") {
      return sendError(res, "Requested record was not found", 404);
    }
  }

  // JWT Errors
  if (err.name === "JsonWebTokenError") {
    return sendError(res, "Invalid authentication token", 401);
  }
  if (err.name === "TokenExpiredError") {
    return sendError(res, "Authentication token has expired", 401);
  }

  // Unhandled / Internal Server Error
  console.error("💥 Unhandled Error:", err);
  const message =
    env.NODE_ENV === "production"
      ? "An unexpected internal server error occurred"
      : err.message || "Internal Server Error";

  return sendError(
    res,
    message,
    500,
    env.NODE_ENV === "development" ? { stack: err.stack } : undefined
  );
}
