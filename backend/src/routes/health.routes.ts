import { Router } from "express";
import { HealthController } from "../controllers/health.controller";

const router = Router();

/**
 * @route GET /health
 * @desc API and Database health check
 * @access Public
 */
router.get("/", HealthController.getHealth);

export default router;
