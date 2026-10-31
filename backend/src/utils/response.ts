import { Response } from "express";
import { ApiResponse } from "../types";

export function sendSuccess<T>(
  res: Response,
  data: T,
  message?: string,
  statusCode: number = 200
): Response {
  const payload: ApiResponse<T> = {
    success: true,
    ...(message && { message }),
    data,
  };
  return res.status(statusCode).json(payload);
}

export function sendError(
  res: Response,
  message: string,
  statusCode: number = 500,
  errors?: unknown
): Response {
  const payload: ApiResponse = {
    success: false,
    message,
    ...(errors !== undefined && { errors }),
  };
  return res.status(statusCode).json(payload);
}
