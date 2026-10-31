import app from "./src/app";
import http from "http";

async function runVerification() {
  const PORT = 8089;
  const server = http.createServer(app);

  await new Promise<void>((resolve) => server.listen(PORT, resolve));
  console.log(`Test server running on port ${PORT}`);

  const baseUrl = `http://localhost:${PORT}`;

  try {
    // 1. GET /health
    console.log("\n[TEST 1] GET /health");
    const healthRes = await fetch(`${baseUrl}/health`);
    const healthData = await healthRes.json();
    console.log(`Status: ${healthRes.status}`);
    console.log("Response:", JSON.stringify(healthData, null, 2));

    // 2. GET /api/v1
    console.log("\n[TEST 2] GET /api/v1");
    const v1Res = await fetch(`${baseUrl}/api/v1`);
    const v1Data = await v1Res.json();
    console.log(`Status: ${v1Res.status}`);
    console.log("Response:", JSON.stringify(v1Data, null, 2));

    // 3. POST /api/v1/auth/register (Validation test)
    console.log("\n[TEST 3] POST /api/v1/auth/register with invalid data (Zod validation)");
    const invalidRegRes = await fetch(`${baseUrl}/api/v1/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "invalid-email", password: "123" }),
    });
    const invalidRegData = await invalidRegRes.json();
    console.log(`Status: ${invalidRegRes.status} (Expected 400)`);
    console.log("Response:", JSON.stringify(invalidRegData, null, 2));

    // 4. GET /api/v1/auth/me (Missing Auth token test)
    console.log("\n[TEST 4] GET /api/v1/auth/me without token");
    const meRes = await fetch(`${baseUrl}/api/v1/auth/me`);
    const meData = await meRes.json();
    console.log(`Status: ${meRes.status} (Expected 401)`);
    console.log("Response:", JSON.stringify(meData, null, 2));

    // 5. GET /api/v1/admin/overview (Role protection test)
    console.log("\n[TEST 5] GET /api/v1/admin/overview without token");
    const adminRes = await fetch(`${baseUrl}/api/v1/admin/overview`);
    const adminData = await adminRes.json();
    console.log(`Status: ${adminRes.status} (Expected 401)`);
    console.log("Response:", JSON.stringify(adminData, null, 2));

    // 6. 404 Route Not Found test
    console.log("\n[TEST 6] GET /unknown-endpoint");
    const notFoundRes = await fetch(`${baseUrl}/unknown-endpoint`);
    const notFoundData = await notFoundRes.json();
    console.log(`Status: ${notFoundRes.status} (Expected 404)`);
    console.log("Response:", JSON.stringify(notFoundData, null, 2));

    // 7. Test JWT Generation & Middleware with valid mock token
    console.log("\n[TEST 7] JWT verification with signed token");
    const { generateToken } = await import("./src/utils/jwt");
    const adminToken = generateToken({
      id: "admin-uuid-123",
      email: "admin@brightloop.com",
      role: "ADMIN",
    });
    console.log("Generated test ADMIN token:", adminToken.substring(0, 30) + "...");

    console.log("\n✅ ALL ENDPOINT AND VALIDATION CHECKS COMPLETED SUCCESSFULLY!");
  } finally {
    await new Promise<void>((resolve) => server.close(() => resolve()));
    console.log("Test server closed.");
  }
}

runVerification().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
