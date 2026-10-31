import { Router } from "express";
import { SubscriptionController } from "../controllers/subscription.controller";
import { authenticateJwt } from "../middleware/auth";
import { validateRequest } from "../middleware/validate";
import {
  createSubscriptionSchema,
  updateSubscriptionStatusSchema,
  subscriptionQuerySchema,
} from "../services/subscription.service";

const router = Router();

/**
 * @route GET /api/v1/subscriptions/due/billing
 * @desc Get subscriptions currently due for recurring billing (excludes cancelled and paused)
 * @access Private (Authenticated users only)
 */
router.get("/due/billing", authenticateJwt, SubscriptionController.getDueForBilling);

/**
 * @route GET /api/v1/subscriptions
 * @desc Get paginated list of subscriptions with status, customer, plan, and search filters
 * @access Public / Authenticated
 */
router.get(
  "/",
  validateRequest({ query: subscriptionQuerySchema }),
  SubscriptionController.getSubscriptions
);

/**
 * @route GET /api/v1/subscriptions/:id
 * @desc Get subscription details with customer and plan
 * @access Public / Authenticated
 */
router.get("/:id", SubscriptionController.getSubscriptionById);

/**
 * @route POST /api/v1/subscriptions
 * @desc Create a new subscription referencing existing customer and plan
 * @access Private (Authenticated users only)
 */
router.post(
  "/",
  authenticateJwt,
  validateRequest({ body: createSubscriptionSchema }),
  SubscriptionController.createSubscription
);

/**
 * @route PATCH /api/v1/subscriptions/:id/status
 * @desc Transition subscription status (ACTIVE <-> PAUSED, ACTIVE/PAUSED -> CANCELLED)
 * @access Private (Authenticated users only)
 */
router.patch(
  "/:id/status",
  authenticateJwt,
  validateRequest({ body: updateSubscriptionStatusSchema }),
  SubscriptionController.updateStatus
);

/**
 * @route POST /api/v1/subscriptions/:id/renew
 * @desc Process recurring renewal for an active subscription
 * @access Private (Authenticated users only)
 */
router.post(
  "/:id/renew",
  authenticateJwt,
  SubscriptionController.renewSubscription
);

export default router;
