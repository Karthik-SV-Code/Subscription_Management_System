import { Router } from "express";
import { CustomerController } from "../controllers/customer.controller";
import { authenticateJwt } from "../middleware/auth";
import { validateRequest } from "../middleware/validate";
import {
  createCustomerSchema,
  updateCustomerSchema,
  customerQuerySchema,
} from "../services/customer.service";

const router = Router();

/**
 * @route GET /api/v1/customers
 * @desc Get paginated list of customers with search and status filters
 * @access Public / Authenticated
 */
router.get(
  "/",
  validateRequest({ query: customerQuerySchema }),
  CustomerController.getCustomers
);

/**
 * @route GET /api/v1/customers/:id
 * @desc Get customer details and associated subscriptions
 * @access Public / Authenticated
 */
router.get("/:id", CustomerController.getCustomerById);

/**
 * @route POST /api/v1/customers
 * @desc Create a new customer record
 * @access Private (Authenticated users only)
 */
router.post(
  "/",
  authenticateJwt,
  validateRequest({ body: createCustomerSchema }),
  CustomerController.createCustomer
);

/**
 * @route PUT /api/v1/customers/:id
 * @desc Update an existing customer record
 * @access Private (Authenticated users only)
 */
router.put(
  "/:id",
  authenticateJwt,
  validateRequest({ body: updateCustomerSchema }),
  CustomerController.updateCustomer
);

/**
 * @route DELETE /api/v1/customers/:id
 * @desc Delete customer (Prevented if active subscriptions exist)
 * @access Private (Authenticated users only)
 */
router.delete("/:id", authenticateJwt, CustomerController.deleteCustomer);

export default router;
