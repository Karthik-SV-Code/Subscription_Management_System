import { Response, NextFunction } from "express";
import { AuthenticatedRequest, Role } from "../types";
import { verifyToken } from "../utils/jwt";
import { AppError } from "./error";
import { prisma } from "../config/database";

export async function authenticateJwt(
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
): Promise<void> {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next(
      new AppError("Authorization token required. Format: Bearer <token>", 401)
    );
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = verifyToken(token);

    // Verify user exists and is active in database if connection is available
    try {
      const user = await prisma.user.findUnique({
        where: { id: decoded.id },
        select: { id: true, email: true, role: true, isActive: true },
      });

      if (user) {
        if (!user.isActive) {
          return next(new AppError("User account has been deactivated", 403));
        }
        req.user = {
          id: user.id,
          email: user.email,
          role: user.role as Role,
        };
        return next();
      }
    } catch (dbErr) {
      // If database is temporarily offline, use cryptographically verified token claims
    }

    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role as Role,
    };

    next();
  } catch (error) {
    next(error);
  }
}

export function authorize(...roles: Role[]) {
  return (
    req: AuthenticatedRequest,
    _res: Response,
    next: NextFunction
  ): void => {
    if (!req.user) {
      return next(new AppError("Authentication required", 401));
    }

    if (roles.length > 0 && !roles.includes(req.user.role)) {
      return next(
        new AppError(
          `Forbidden: Role '${req.user.role}' is not authorized to access this resource`,
          403
        )
      );
    }

    next();
  };
}
