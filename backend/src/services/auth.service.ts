import { prisma } from "../config/database";
import { hashPassword, comparePassword } from "../utils/password";
import { generateToken } from "../utils/jwt";
import { AppError } from "../middleware/error";
import { Role } from "../types";
import { z } from "zod";

export const registerSchema = z.object({
  email: z.string().email("Invalid email address").toLowerCase().trim(),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters long")
    .max(100, "Password must not exceed 100 characters"),
  firstName: z.string().min(1, "First name is required").trim(),
  lastName: z.string().min(1, "Last name is required").trim(),
  role: z.enum(["ADMIN", "STAFF"]).optional().default("STAFF"),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email address").toLowerCase().trim(),
  password: z.string().min(1, "Password is required"),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;

export interface SafeUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: Role;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthResult {
  user: SafeUser;
  token: string;
}

function sanitizeUser(user: {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}): SafeUser {
  return {
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    role: user.role as Role,
    isActive: user.isActive,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

export class AuthService {
  /**
   * Registers a new user with hashed password and returns credentials.
   */
  public static async register(data: RegisterInput): Promise<AuthResult> {
    const existing = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existing) {
      throw new AppError("An account with this email address already exists", 409);
    }

    const hashedPassword = await hashPassword(data.password);

    const newUser = await prisma.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
        firstName: data.firstName,
        lastName: data.lastName,
        role: data.role as Role,
      },
    });

    const safeUser = sanitizeUser(newUser);
    const token = generateToken({
      id: safeUser.id,
      email: safeUser.email,
      role: safeUser.role,
    });

    return { user: safeUser, token };
  }

  /**
   * Validates credentials and returns JWT session token.
   */
  public static async login(data: LoginInput): Promise<AuthResult> {
    const user = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (!user) {
      throw new AppError("Invalid email or password", 401);
    }

    if (!user.isActive) {
      throw new AppError("This user account has been deactivated", 403);
    }

    const isPasswordValid = await comparePassword(data.password, user.password);
    if (!isPasswordValid) {
      throw new AppError("Invalid email or password", 401);
    }

    const safeUser = sanitizeUser(user);
    const token = generateToken({
      id: safeUser.id,
      email: safeUser.email,
      role: safeUser.role,
    });

    return { user: safeUser, token };
  }

  /**
   * Fetches profile of the currently authenticated user.
   */
  public static async getCurrentUser(userId: string): Promise<SafeUser> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new AppError("User not found", 404);
    }

    if (!user.isActive) {
      throw new AppError("User account has been deactivated", 403);
    }

    return sanitizeUser(user);
  }
}
