import { Router } from "express";
import { DashboardController } from "./dashboard.controller";
import { authenticateJwt } from "../../middleware/auth";

const router = Router();

/**
 * @route GET /api/v1/dashboard/stats
 * @desc Get high-level KPI metrics (totalCustomers, activeSubscriptions, MRR, collected revenue, outstanding)
 * @access Public / Authenticated
 */
router.get("/stats", DashboardController.getStats);

/**
 * @route GET /api/v1/dashboard/revenue
 * @desc Get monthly revenue breakdown for the past 6 months from actual payment records
 * @access Public / Authenticated
 */
router.get("/revenue", DashboardController.getRevenue);

/**
 * @route GET /api/v1/dashboard/recent-activity
 * @desc Get chronologically sorted feed of recent invoices and payments
 * @access Public / Authenticated
 */
router.get("/recent-activity", DashboardController.getRecentActivity);

export default router;
