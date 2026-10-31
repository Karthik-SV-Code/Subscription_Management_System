import { Router } from "express";
import { DiscountController } from "../controllers/discount.controller";
import { authenticateJwt } from "../middleware/auth";
import { validateRequest } from "../middleware/validate";
import {
  createDiscountSchema,
  validateDiscountSchema,
} from "../services/discount.service";

const router = Router();

/**
 * @route GET /api/v1/discounts
 * @desc List discounts with pagination, search, and status filters
 * @access Private (Authenticated users only)
 */
router.get("/", authenticateJwt, DiscountController.getDiscounts);

/**
 * @route POST /api/v1/discounts/validate
 * @desc Validate a discount code for expiry, usage limits, and compute applicable discount
 * @access Private (Authenticated users only)
 */
router.post(
  "/validate",
  authenticateJwt,
  validateRequest({ body: validateDiscountSchema }),
  DiscountController.validateDiscount
);

/**
 * @route GET /api/v1/discounts/:id
 * @desc Get discount by ID
 * @access Private (Authenticated users only)
 */
router.get("/:id", authenticateJwt, DiscountController.getDiscountById);

/**
 * @route POST /api/v1/discounts
 * @desc Create a new percentage or fixed discount code
 * @access Private (Authenticated users only)
 */
router.post(
  "/",
  authenticateJwt,
  validateRequest({ body: createDiscountSchema }),
  DiscountController.createDiscount
);

export default router;
