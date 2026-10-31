import express, { Application } from "express";
import cors from "cors";
import helmet from "helmet";
import routes from "./routes";
import { errorHandler, notFoundHandler } from "./middleware/error";
import { env } from "./config/env";

export function createApp(): Application {
  const app: Application = express();

  // Security HTTP headers
  app.use(helmet());

  // CORS configuration for SubscriptIQ frontend
  app.use(
    cors({
      origin: [env.CORS_ORIGIN, "http://localhost:3000", "http://127.0.0.1:3000"],
      credentials: true,
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization", "Accept", "X-Requested-With"],
    })
  );

  // Request body parsing
  app.use(express.json({ limit: "10mb" }));
  app.use(express.urlencoded({ extended: true, limit: "10mb" }));

  // Request logger in development
  if (env.NODE_ENV === "development") {
    app.use((req, _res, next) => {
      console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
      next();
    });
  }

  // Mount API Routes
  app.use(routes);

  // 404 Not Found Handler
  app.use(notFoundHandler);

  // Centralized Error Handler
  app.use(errorHandler);

  return app;
}

export default createApp();
