import { Router } from "express";
import { AuthController } from "../controllers/auth.controller";
import { validateRequest } from "../middleware/validate";
import { registerSchema, loginSchema } from "../services/auth.service";
import { authenticateJwt } from "../middleware/auth";

const router = Router();

/**
 * @route POST /api/v1/auth/register
 * @desc Register a new user
 * @access Public
 */
router.post(
  "/register",
  validateRequest({ body: registerSchema }),
  AuthController.register
);

/**
 * @route POST /api/v1/auth/login
 * @desc Authenticate user and issue JWT
 * @access Public
 */
router.post(
  "/login",
  validateRequest({ body: loginSchema }),
  AuthController.login
);

/**
 * @route GET /api/v1/auth/me
 * @desc Fetch current authenticated user's profile
 * @access Private (Requires Bearer token)
 */
router.get("/me", authenticateJwt, AuthController.getMe);

export default router;
