import { Router } from "express";
import { PlanController } from "../controllers/plan.controller";
import { authenticateJwt } from "../middleware/auth";
import { validateRequest } from "../middleware/validate";
import {
  createPlanSchema,
  updatePlanSchema,
  planQuerySchema,
} from "../services/plan.service";

const router = Router();

/**
 * @route GET /api/v1/plans
 * @desc Get paginated list of plans with optional search, productId and interval filters
 * @access Public / Authenticated
 */
router.get(
  "/",
  validateRequest({ query: planQuerySchema }),
  PlanController.getPlans
);

/**
 * @route GET /api/v1/plans/:id
 * @desc Get plan details and parent product information
 * @access Public / Authenticated
 */
router.get("/:id", PlanController.getPlanById);

/**
 * @route POST /api/v1/plans
 * @desc Create a new pricing plan under a product
 * @access Private (Authenticated users only)
 */
router.post(
  "/",
  authenticateJwt,
  validateRequest({ body: createPlanSchema }),
  PlanController.createPlan
);

/**
 * @route PUT /api/v1/plans/:id
 * @desc Update an existing pricing plan
 * @access Private (Authenticated users only)
 */
router.put(
  "/:id",
  authenticateJwt,
  validateRequest({ body: updatePlanSchema }),
  PlanController.updatePlan
);

/**
 * @route DELETE /api/v1/plans/:id
 * @desc Delete plan (Blocked if actively referenced by active subscriptions)
 * @access Private (Authenticated users only)
 */
router.delete("/:id", authenticateJwt, PlanController.deletePlan);

export default router;
