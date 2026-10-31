import { Router } from "express";
import healthRoutes from "./health.routes";
import v1Routes from "./v1.routes";

const router = Router();

// Health check endpoint
router.use("/health", healthRoutes);

// Version 1 API routes
router.use("/api/v1", v1Routes);

export default router;
