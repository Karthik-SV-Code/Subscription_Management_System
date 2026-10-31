import app from "./app";
import { env } from "./config/env";
import { checkDatabaseConnection } from "./config/database";

const server = app.listen(env.PORT, async () => {
  console.log(`=======================================================`);
  console.log(`🚀 SubscriptIQ Backend API Service`);
  console.log(`🏢 Organization: Brightloop Software`);
  console.log(`🌐 Server running at: http://localhost:${env.PORT}`);
  console.log(`🩺 Health check: http://localhost:${env.PORT}/health`);
  console.log(`📡 API v1 base: http://localhost:${env.PORT}/api/v1`);
  console.log(`🛡️  CORS configured for: ${env.CORS_ORIGIN}`);
  console.log(`⚙️  Environment: ${env.NODE_ENV}`);
  console.log(`=======================================================`);

  // Verify database connectivity
  const isDbConnected = await checkDatabaseConnection();
  if (isDbConnected) {
    console.log(`✅ PostgreSQL database connection established successfully.`);
  } else {
    console.warn(
      `⚠️  PostgreSQL connection could not be established at: ${env.DATABASE_URL}`
    );
    console.warn(
      `👉 Please ensure PostgreSQL is running and credentials in .env are correct.`
    );
  }
});

// Graceful shutdown handling
process.on("SIGTERM", () => {
  console.log("SIGTERM signal received: closing HTTP server...");
  server.close(() => {
    console.log("HTTP server closed.");
    process.exit(0);
  });
});

process.on("SIGINT", () => {
  console.log("SIGINT signal received: closing HTTP server...");
  server.close(() => {
    console.log("HTTP server closed.");
    process.exit(0);
  });
});

export default server;
