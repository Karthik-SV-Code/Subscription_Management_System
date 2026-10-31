import { Router } from "express";
import { ProductController } from "../controllers/product.controller";
import { authenticateJwt } from "../middleware/auth";
import { validateRequest } from "../middleware/validate";
import {
  createProductSchema,
  updateProductSchema,
  productQuerySchema,
} from "../services/product.service";

const router = Router();

/**
 * @route GET /api/v1/products
 * @desc Get paginated list of products with search and status filters
 * @access Public / Authenticated
 */
router.get(
  "/",
  validateRequest({ query: productQuerySchema }),
  ProductController.getProducts
);

/**
 * @route GET /api/v1/products/:id
 * @desc Get product details with associated plans
 * @access Public / Authenticated
 */
router.get("/:id", ProductController.getProductById);

/**
 * @route POST /api/v1/products
 * @desc Create a new product
 * @access Private (Authenticated users only)
 */
router.post(
  "/",
  authenticateJwt,
  validateRequest({ body: createProductSchema }),
  ProductController.createProduct
);

/**
 * @route PUT /api/v1/products/:id
 * @desc Update an existing product
 * @access Private (Authenticated users only)
 */
router.put(
  "/:id",
  authenticateJwt,
  validateRequest({ body: updateProductSchema }),
  ProductController.updateProduct
);

/**
 * @route DELETE /api/v1/products/:id
 * @desc Delete product (Blocked if plans have active subscriptions)
 * @access Private (Authenticated users only)
 */
router.delete("/:id", authenticateJwt, ProductController.deleteProduct);

export default router;
