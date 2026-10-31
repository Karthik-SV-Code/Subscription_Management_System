import { Router, Request, Response } from "express";
import authRoutes from "./auth.routes";
import { authenticateJwt, authorize } from "../middleware/auth";
import { sendSuccess } from "../utils/response";
import { AuthenticatedRequest } from "../types";

const router = Router();

/**
 * @route GET /api/v1
 * @desc API v1 root endpoint describing service and available routes
 * @access Public
 */
router.get("/", (_req: Request, res: Response) => {
  sendSuccess(
    res,
    {
      name: "SubscriptIQ REST API",
      version: "v1",
      organization: "Brightloop Software",
      documentation: "/api/v1/docs",
      endpoints: {
        health: "GET /health",
        auth: {
          register: "POST /api/v1/auth/register",
          login: "POST /api/v1/auth/login",
          me: "GET /api/v1/auth/me",
        },
        roles: {
          adminCheck: "GET /api/v1/admin/overview (Requires ADMIN role)",
          staffCheck: "GET /api/v1/staff/overview (Requires ADMIN or STAFF role)",
        },
      },
    },
    "SubscriptIQ API v1 is active and ready"
  );
});

// Authentication routes
router.use("/auth", authRoutes);

// Role-based authorization demonstration routes
router.get(
  "/admin/overview",
  authenticateJwt,
  authorize("ADMIN"),
  (req: AuthenticatedRequest, res: Response) => {
    sendSuccess(
      res,
      {
        message: "Welcome to the Admin Portal",
        authenticatedUser: req.user,
        role: "ADMIN",
        privileges: ["FULL_SYSTEM_ACCESS", "BILLING_OVERRIDE", "USER_MANAGEMENT"],
      },
      "Admin authorization verified"
    );
  }
);

router.get(
  "/staff/overview",
  authenticateJwt,
  authorize("ADMIN", "STAFF"),
  (req: AuthenticatedRequest, res: Response) => {
    sendSuccess(
      res,
      {
        message: "Welcome to the Staff Workspace",
        authenticatedUser: req.user,
        role: req.user?.role,
        privileges: ["SUBSCRIPTION_VIEW", "CUSTOMER_SUPPORT"],
      },
      "Staff authorization verified"
    );
  }
);

export default router;
