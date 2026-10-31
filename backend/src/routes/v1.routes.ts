import { Router, Request, Response } from "express";
import authRoutes from "./auth.routes";
import customerRoutes from "./customer.routes";
import productRoutes from "./product.routes";
import planRoutes from "./plan.routes";
import subscriptionRoutes from "./subscription.routes";
import { authenticateJwt, authorize } from "../middleware/auth";
import { sendSuccess } from "../utils/response";
import { AuthenticatedRequest } from "../types";

const router = Router();

/**
 * @route GET /api/v1
 * @desc API v1 root endpoint describing service, catalog and documentation
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
          me: "GET /api/v1/auth/me (Protected)",
        },
        customers: {
          list: "GET /api/v1/customers?page=&pageSize=&search=&status=",
          getById: "GET /api/v1/customers/:id",
          create: "POST /api/v1/customers (Protected)",
          update: "PUT /api/v1/customers/:id (Protected)",
          delete: "DELETE /api/v1/customers/:id (Protected - Guarded against active subscriptions)",
        },
        products: {
          list: "GET /api/v1/products?page=&pageSize=&search=&status=",
          getById: "GET /api/v1/products/:id",
          create: "POST /api/v1/products (Protected)",
          update: "PUT /api/v1/products/:id (Protected)",
          delete: "DELETE /api/v1/products/:id (Protected - Guarded against active subscriptions)",
        },
        plans: {
          list: "GET /api/v1/plans?page=&pageSize=&search=&productId=&interval=&isActive=",
          getById: "GET /api/v1/plans/:id",
          create: "POST /api/v1/plans (Protected)",
          update: "PUT /api/v1/plans/:id (Protected)",
          delete: "DELETE /api/v1/plans/:id (Protected - Guarded against active subscriptions)",
        },
        subscriptions: {
          list: "GET /api/v1/subscriptions?page=&pageSize=&search=&status=&customerId=&planId=",
          getById: "GET /api/v1/subscriptions/:id",
          create: "POST /api/v1/subscriptions (Protected - Calculates next billing, totals & MRR)",
          updateStatus: "PATCH /api/v1/subscriptions/:id/status (Protected - Enforces lifecycle state machine)",
          renew: "POST /api/v1/subscriptions/:id/renew (Protected - Excludes cancelled subs, advances cycle)",
          dueForBilling: "GET /api/v1/subscriptions/due/billing (Protected - Recurring billing query)",
        },
        roles: {
          adminOverview: "GET /api/v1/admin/overview (Requires ADMIN role)",
          staffOverview: "GET /api/v1/staff/overview (Requires ADMIN or STAFF role)",
        },
      },
    },
    "SubscriptIQ API v1 is active and ready"
  );
});

// Mounted module routes
router.use("/auth", authRoutes);
router.use("/customers", customerRoutes);
router.use("/products", productRoutes);
router.use("/plans", planRoutes);
router.use("/subscriptions", subscriptionRoutes);

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
