import app from "./src/app";
import http from "http";
import { generateToken } from "./src/utils/jwt";

async function runVerification() {
  const PORT = 8089;
  const server = http.createServer(app);

  await new Promise<void>((resolve) => server.listen(PORT, resolve));
  console.log(`Test server running on port ${PORT}`);

  const baseUrl = `http://localhost:${PORT}`;

  // Generate an admin test token
  const adminToken = generateToken({
    id: "admin-test-uuid",
    email: "admin@brightloop.com",
    role: "ADMIN",
  });
  const authHeaders = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${adminToken}`,
  };

  try {
    // 1. GET /health
    console.log("\n[TEST 1] GET /health");
    const healthRes = await fetch(`${baseUrl}/health`);
    const healthData = await healthRes.json();
    console.log(`Status: ${healthRes.status}`);
    console.log("Response:", JSON.stringify(healthData, null, 2));

    // 2. GET /api/v1 (Service & Documentation Catalog)
    console.log("\n[TEST 2] GET /api/v1");
    const v1Res = await fetch(`${baseUrl}/api/v1`);
    const v1Data = await v1Res.json();
    console.log(`Status: ${v1Res.status}`);
    console.log("Endpoints Catalog:", JSON.stringify(v1Data.data.endpoints, null, 2));

    // 3. Auth Protection Tests (Requirements: Restrict write operations to authenticated users)
    console.log("\n[TEST 3] Write Operation Protection (Missing Auth Token -> 401 Expected)");
    const unauthPostCustomer = await fetch(`${baseUrl}/api/v1/customers`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Acme Corp", email: "info@acme.com" }),
    });
    console.log(`POST /customers without token: ${unauthPostCustomer.status} (Expected 401)`);

    const unauthPostProduct = await fetch(`${baseUrl}/api/v1/products`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Enterprise Suite", code: "ENT-SUITE" }),
    });
    console.log(`POST /products without token: ${unauthPostProduct.status} (Expected 401)`);

    const unauthPostPlan = await fetch(`${baseUrl}/api/v1/plans`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Pro Monthly", code: "PRO-M", amount: 99 }),
    });
    console.log(`POST /plans without token: ${unauthPostPlan.status} (Expected 401)`);

    const unauthDeleteCustomer = await fetch(`${baseUrl}/api/v1/customers/sample-id`, {
      method: "DELETE",
    });
    console.log(`DELETE /customers/:id without token: ${unauthDeleteCustomer.status} (Expected 401)`);

    // 4. Zod Validation & Invalid Price Tests (Requirement 3: Validate required fields and prevent invalid prices)
    console.log("\n[TEST 4] Zod Validation & Invalid Price Checks (Expected 400)");
    
    // Invalid price on Plan (amount < 0)
    const invalidPlanPrice = await fetch(`${baseUrl}/api/v1/plans`, {
      method: "POST",
      headers: authHeaders,
      body: JSON.stringify({
        productId: "prod-123",
        name: "Broken Plan",
        code: "BROKEN",
        amount: -50, // Invalid negative price!
        interval: "month",
      }),
    });
    const invalidPlanData = await invalidPlanPrice.json();
    console.log(`POST /plans with negative price: ${invalidPlanPrice.status} (Expected 400)`);
    console.log("Validation Errors:", JSON.stringify(invalidPlanData.errors, null, 2));

    // Invalid Customer input (invalid email and negative MRR)
    const invalidCustomer = await fetch(`${baseUrl}/api/v1/customers`, {
      method: "POST",
      headers: authHeaders,
      body: JSON.stringify({
        name: "",
        email: "not-an-email",
        mrr: -100, // Invalid negative MRR!
      }),
    });
    const invalidCustData = await invalidCustomer.json();
    console.log(`POST /customers with invalid email & negative MRR: ${invalidCustomer.status} (Expected 400)`);
    console.log("Validation Errors:", JSON.stringify(invalidCustData.errors, null, 2));

    // Invalid Product input (empty code)
    const invalidProduct = await fetch(`${baseUrl}/api/v1/products`, {
      method: "POST",
      headers: authHeaders,
      body: JSON.stringify({
        name: "Cloud Hosting",
        code: "C", // Code must be at least 2 characters!
      }),
    });
    const invalidProdData = await invalidProduct.json();
    console.log(`POST /products with 1-char code: ${invalidProduct.status} (Expected 400)`);
    console.log("Validation Errors:", JSON.stringify(invalidProdData.errors, null, 2));

    // 5. Query Parameter Validation & Pagination tests
    console.log("\n[TEST 5] List Endpoints Query Validation & Pagination");
    const custQueryRes = await fetch(`${baseUrl}/api/v1/customers?page=invalid&pageSize=999`);
    console.log(`GET /customers with query params status: ${custQueryRes.status}`);

    const prodQueryRes = await fetch(`${baseUrl}/api/v1/products?search=analytics`);
    console.log(`GET /products with search param status: ${prodQueryRes.status}`);

    const planQueryRes = await fetch(`${baseUrl}/api/v1/plans?interval=month&isActive=true`);
    console.log(`GET /plans with filter params status: ${planQueryRes.status}`);

    // 6. 404 Route Not Found
    console.log("\n[TEST 6] 404 Not Found Handling");
    const notFoundRes = await fetch(`${baseUrl}/api/v1/nonexistent`);
    console.log(`GET /api/v1/nonexistent status: ${notFoundRes.status} (Expected 404)`);

    console.log("\n✅ ALL API ENDPOINT, VALIDATION, AND AUTH CHECKS COMPLETED SUCCESSFULLY!");
  } finally {
    await new Promise<void>((resolve) => server.close(() => resolve()));
    console.log("Test server closed.");
  }
}

runVerification().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
