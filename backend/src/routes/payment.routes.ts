import { Router } from "express";
import { PaymentController } from "../controllers/payment.controller";
import { authenticateJwt } from "../middleware/auth";
import { validateRequest } from "../middleware/validate";
import { createPaymentSchema } from "../services/payment.service";

const router = Router();

/**
 * @route GET /api/v1/payments
 * @desc List payments with pagination, status, and filter parameters
 * @access Private (Authenticated users only)
 */
router.get("/", authenticateJwt, PaymentController.getPayments);

/**
 * @route GET /api/v1/payments/:id
 * @desc Get payment details by ID
 * @access Private (Authenticated users only)
 */
router.get("/:id", authenticateJwt, PaymentController.getPaymentById);

/**
 * @route POST /api/v1/payments
 * @desc Record a partial or full payment against an invoice (manual or automated)
 * @access Private (Authenticated users only)
 */
router.post(
  "/",
  authenticateJwt,
  validateRequest({ body: createPaymentSchema }),
  PaymentController.recordPayment
);

export default router;
