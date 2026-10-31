import { Router } from "express";
import { InvoiceController } from "../controllers/invoice.controller";
import { authenticateJwt } from "../middleware/auth";
import { validateRequest } from "../middleware/validate";
import {
  generateInvoicesSchema,
  updateInvoiceStatusSchema,
  invoiceQuerySchema,
} from "../services/invoice.service";

const router = Router();

/**
 * @route GET /api/v1/invoices
 * @desc Get paginated list of invoices with status, customer, and search filters
 * @access Public / Authenticated
 */
router.get(
  "/",
  validateRequest({ query: invoiceQuerySchema }),
  InvoiceController.getInvoices
);

/**
 * @route POST /api/v1/invoices/generate
 * @desc Generate recurring invoices for active subscriptions due for billing
 * @access Private (Authenticated users only)
 */
router.post(
  "/generate",
  authenticateJwt,
  validateRequest({ body: generateInvoicesSchema }),
  InvoiceController.generateInvoices
);

/**
 * @route GET /api/v1/invoices/:id
 * @desc Get single invoice details with line-item snapshots and customer info
 * @access Public / Authenticated
 */
router.get("/:id", InvoiceController.getInvoiceById);

/**
 * @route PATCH /api/v1/invoices/:id/status
 * @desc Update invoice status (DRAFT, UNPAID, PARTIALLY_PAID, PAID, OVERDUE)
 * @access Private (Authenticated users only)
 */
router.patch(
  "/:id/status",
  authenticateJwt,
  validateRequest({ body: updateInvoiceStatusSchema }),
  InvoiceController.updateStatus
);

export default router;
