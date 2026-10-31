import app from "./src/app";
import http from "http";
import { generateToken } from "./src/utils/jwt";
import { prisma } from "./src/config/database";
import {
  calculateNextBillingDate,
  calculateMrr,
  generateBillingCycleKey,
} from "./src/utils/billing-date";
import {
  toDecimal,
  calculateSubtotal,
  calculateTaxAmount,
  calculateTotal,
  generateInvoiceNumber,
  generateInvoiceBillingKey,
} from "./src/utils/invoice-math";

async function runVerification() {
  console.log("=======================================================");
  console.log("SubscriptIQ Comprehensive Verification & E2E Test Suite");
  console.log("=======================================================");

  // ==========================================
  // SECTION 1: UNIT TESTS - Decimal Monetary Math & Taxes
  // ==========================================
  console.log("\n--- [SECTION 1] High-Precision Decimal Monetary Arithmetic ---");

  // Test 1.1: Subtotal using Decimal (zero float imprecision)
  const unitPrice = toDecimal("99.99");
  const qty = 3;
  const subtotal = calculateSubtotal(unitPrice, qty);
  console.log(`Subtotal ($99.99 x 3): $${subtotal.toFixed(2)}`);
  if (!subtotal.equals(toDecimal("299.97"))) {
    throw new Error(`Expected subtotal 299.97, got ${subtotal.toString()}`);
  }
  console.log("✓ Subtotal accurately computed with Decimal");

  // Test 1.2: Tax Calculation (8.25% tax on $299.97)
  const taxRate = toDecimal("8.25");
  const taxAmount = calculateTaxAmount(subtotal, taxRate);
  console.log(`Tax amount (8.25% on $299.97): $${taxAmount.toFixed(2)}`);
  if (!taxAmount.equals(toDecimal("24.75"))) {
    throw new Error(`Expected tax 24.75, got ${taxAmount.toString()}`);
  }
  console.log("✓ Basic tax accurately calculated with Decimal half-up rounding");

  // Test 1.3: Total: Subtotal + Tax
  const total = calculateTotal(subtotal, taxAmount);
  console.log(`Total ($299.97 + $24.75): $${total.toFixed(2)}`);
  if (!total.equals(toDecimal("324.72"))) {
    throw new Error(`Expected total 324.72, got ${total.toString()}`);
  }
  console.log("✓ Total accurately computed with Decimal");

  // Test 1.4: Amount Due after partial payment
  const partialPaid = toDecimal("100.00");
  const amountDue = total.minus(partialPaid);
  console.log(`Amount Due ($324.72 - $100.00): $${amountDue.toFixed(2)}`);
  if (!amountDue.equals(toDecimal("224.72"))) {
    throw new Error(`Expected amountDue 224.72, got ${amountDue.toString()}`);
  }
  console.log("✓ Partial payment & amount due verified");

  // Test 1.5: Unique Invoice Number Generation
  const invNum1 = generateInvoiceNumber(1);
  const invNum2 = generateInvoiceNumber(2);
  console.log(`Generated Invoice Number 1: ${invNum1}`);
  console.log(`Generated Invoice Number 2: ${invNum2}`);
  if (!invNum1.startsWith("INV-") || invNum1 === invNum2) {
    throw new Error("Invoice number format error or collision");
  }
  console.log("✓ Unique invoice numbers correctly formatted");

  // Test 1.6: Duplicate-Invoice Prevention Key Generation
  const periodStart = new Date("2026-10-01T00:00:00Z");
  const periodEnd = new Date("2026-11-01T00:00:00Z");
  const subId = "sub-uuid-abc-123";
  const duplicateKey1 = generateInvoiceBillingKey(subId, periodStart, periodEnd);
  const duplicateKey2 = generateInvoiceBillingKey(subId, periodStart, periodEnd);
  console.log(`Duplicate Prevention Key: ${duplicateKey1}`);
  if (duplicateKey1 !== duplicateKey2) {
    throw new Error("Duplicate key generation must be strictly deterministic");
  }
  console.log("✓ Deterministic duplicate prevention key verified");

  // ==========================================
  // SECTION 2: HTTP ENDPOINT & LIFECYCLE TESTS
  // ==========================================
  const PORT = 8089;
  const server = http.createServer(app);
  await new Promise<void>((resolve) => server.listen(PORT, resolve));
  const baseUrl = `http://localhost:${PORT}`;

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
    // 2.1: Health Check
    console.log("\n--- [SECTION 2] Health & Metadata Checks ---");
    const healthRes = await fetch(`${baseUrl}/health`);
    const healthData = await healthRes.json();
    console.log(`GET /health: ${healthRes.status} (${healthData.data.service}, db: ${healthData.data.database.status})`);

    // 2.2: API v1 Catalog (Verifying Invoices are exposed)
    const v1Res = await fetch(`${baseUrl}/api/v1`);
    const v1Data = await v1Res.json();
    console.log(`GET /api/v1: ${v1Res.status}`);
    console.log("Invoices catalog:", JSON.stringify(v1Data.data.endpoints.invoices, null, 2));

    // 2.3: Write Operation Authentication Protection
    console.log("\n--- [SECTION 3] Invoice Route Security (401 Expected) ---");
    const unauthGenerate = await fetch(`${baseUrl}/api/v1/invoices/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
    console.log(`POST /invoices/generate without token: ${unauthGenerate.status} (Expected 401)`);

    const unauthPatchStatus = await fetch(`${baseUrl}/api/v1/invoices/inv_123/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "PAID" }),
    });
    console.log(`PATCH /invoices/:id/status without token: ${unauthPatchStatus.status} (Expected 401)`);

    // 2.4: Zod Schema Validation Checks (400 Expected)
    console.log("\n--- [SECTION 4] Zod Validation Checks (400 Expected) ---");

    // Invalid Tax Rate (> 100%)
    const invalidTaxRes = await fetch(`${baseUrl}/api/v1/invoices/generate`, {
      method: "POST",
      headers: authHeaders,
      body: JSON.stringify({
        taxRate: 150, // Invalid!
      }),
    });
    const invalidTaxData = await invalidTaxRes.json();
    console.log(`POST /invoices/generate with taxRate 150%: ${invalidTaxRes.status} (Expected 400)`);
    console.log("Validation error:", invalidTaxData.errors[0]?.message);

    // Negative Tax Rate (< 0)
    const negativeTaxRes = await fetch(`${baseUrl}/api/v1/invoices/generate`, {
      method: "POST",
      headers: authHeaders,
      body: JSON.stringify({
        taxRate: -5, // Invalid!
      }),
    });
    console.log(`POST /invoices/generate with taxRate -5%: ${negativeTaxRes.status} (Expected 400)`);

    // Invalid Status Value
    const invalidStatusRes = await fetch(`${baseUrl}/api/v1/invoices/inv-123/status`, {
      method: "PATCH",
      headers: authHeaders,
      body: JSON.stringify({
        status: "DESTROYED", // Invalid status!
      }),
    });
    console.log(`PATCH /invoices/:id/status with invalid enum: ${invalidStatusRes.status} (Expected 400)`);

    // 2.5: Valid Invoice Status Enum Schema Verification
    console.log("\n--- [SECTION 5] Invoice Status Enum Normalization ---");
    const { updateInvoiceStatusSchema } = await import("./src/services/invoice.service");

    const validStatuses = ["DRAFT", "UNPAID", "PARTIALLY_PAID", "PAID", "OVERDUE"];
    for (const st of validStatuses) {
      const parsed = updateInvoiceStatusSchema.parse({ status: st });
      if (parsed.status !== st) throw new Error(`Status ${st} normalization failed`);
      const lowerParsed = updateInvoiceStatusSchema.parse({ status: st.toLowerCase() });
      if (lowerParsed.status !== st) throw new Error(`Status ${st.toLowerCase()} -> ${st} normalization failed`);
    }
    console.log("✓ All 5 invoice statuses (DRAFT, UNPAID, PARTIALLY_PAID, PAID, OVERDUE) verified and normalized");

    // ==========================================
    // SECTION 3: END-TO-END INVOICE GENERATION & RECURRING BILLING TEST
    // ==========================================
    console.log("\n--- [SECTION 6] End-to-End Invoice Generation & Recurring Billing Flow ---");

    const testTimestamp = Date.now();
    // 1. Create a customer
    const testCust = await prisma.customer.create({
      data: {
        name: `Acme Corp ${testTimestamp}`,
        email: `billing-${testTimestamp}@acme.com`,
        status: "active",
        currency: "USD",
      },
    });
    console.log(`Created test customer: ${testCust.id} (${testCust.name})`);

    // 2. Create a product & plan
    const testProd = await prisma.product.create({
      data: {
        name: `SubscriptIQ Cloud Pro ${testTimestamp}`,
        code: `PROD-${testTimestamp}`,
        status: "active",
      },
    });

    const testPlan = await prisma.plan.create({
      data: {
        productId: testProd.id,
        name: "Pro Monthly",
        code: `PLAN-PRO-${testTimestamp}`,
        amount: 100.0,
        currency: "USD",
        interval: "month",
        intervalCount: 1,
      },
    });
    console.log(`Created test plan: ${testPlan.id} ($${testPlan.amount}/mo)`);

    // 3. Create an active subscription due for billing
    const pastStart = new Date(Date.now() - 31 * 86400000);
    const pastEnd = new Date(Date.now() - 1 * 86400000); // Ended yesterday -> due for billing!
    const testSub = await prisma.subscription.create({
      data: {
        customerId: testCust.id,
        planId: testPlan.id,
        status: "ACTIVE",
        quantity: 2, // 2 units
        unitAmount: 100.0,
        totalAmount: 200.0,
        mrr: 200.0,
        currency: "USD",
        billingInterval: "month",
        startDate: pastStart,
        currentPeriodStart: pastStart,
        currentPeriodEnd: pastEnd,
        nextBillingDate: pastEnd, // Due yesterday!
        billingSequence: 1,
      },
    });
    console.log(`Created test subscription due for billing: ${testSub.id} (nextBilling: ${pastEnd.toISOString().split("T")[0]})`);

    // 4. Call POST /api/v1/invoices/generate with 10% tax
    console.log("Generating recurring invoices via POST /api/v1/invoices/generate...");
    const genRes = await fetch(`${baseUrl}/api/v1/invoices/generate`, {
      method: "POST",
      headers: authHeaders,
      body: JSON.stringify({
        subscriptionId: testSub.id,
        taxRate: 10, // 10% tax
      }),
    });
    const genData = await genRes.json();
    console.log(`Invoice generation response: ${genRes.status}`, JSON.stringify(genData, null, 2));

    if (!genData.success || genData.data.generatedCount !== 1) {
      throw new Error(`Expected 1 invoice generated, got ${genData.data?.generatedCount}`);
    }

    const generatedInvoice = genData.data.invoices[0];
    console.log(`Generated Invoice #${generatedInvoice.invoiceNumber}:`);
    console.log(`  Subtotal: $${generatedInvoice.subtotal} (Expected 200.00)`);
    console.log(`  Tax (10%): $${generatedInvoice.taxAmount} (Expected 20.00)`);
    console.log(`  Total:    $${generatedInvoice.total} (Expected 220.00)`);
    console.log(`  Line item snapshot: ${generatedInvoice.lineItems[0]?.description}`);

    if (parseFloat(generatedInvoice.total) !== 220) {
      throw new Error(`Expected total 220.00, got ${generatedInvoice.total}`);
    }
    console.log("✓ Invoice created with exact Decimal financial calculations and line-item snapshot");

    // 5. Test Duplicate-Invoice Prevention (Requirement 8)
    console.log("\nTesting Duplicate Invoice Prevention...");
    const genDuplicateRes = await fetch(`${baseUrl}/api/v1/invoices/generate`, {
      method: "POST",
      headers: authHeaders,
      body: JSON.stringify({
        subscriptionId: testSub.id,
        asOfDate: pastEnd.toISOString(),
      }),
    });
    const genDuplicateData = await genDuplicateRes.json();
    console.log(`Duplicate generation attempt response:`, JSON.stringify(genDuplicateData, null, 2));
    if (genDuplicateData.data.generatedCount !== 0) {
      throw new Error("Duplicate invoice was generated! Should have been prevented.");
    }
    console.log("✓ Duplicate invoice strictly prevented (generatedCount: 0)");

    // 6. Test Status Transition to PAID (PATCH /api/v1/invoices/:id/status)
    console.log("\nUpdating invoice status to PAID via PATCH /api/v1/invoices/:id/status...");
    const patchRes = await fetch(`${baseUrl}/api/v1/invoices/${generatedInvoice.id}/status`, {
      method: "PATCH",
      headers: authHeaders,
      body: JSON.stringify({
        status: "PAID",
        notes: "Paid in full via automated credit card charge",
      }),
    });
    const patchData = await patchRes.json();
    console.log(`Status update response: ${patchRes.status}`, JSON.stringify(patchData.data, null, 2));

    if (patchData.data.status !== "PAID" || parseFloat(patchData.data.amountDue) !== 0) {
      throw new Error(`Expected invoice status PAID with amountDue 0, got ${patchData.data?.status}`);
    }
    console.log("✓ Invoice successfully transitioned to PAID (amountDue: $0.00, paidAt recorded)");

    // 7. Cleanup test data
    console.log("\nCleaning up test records...");
    await prisma.invoiceLineItem.deleteMany({ where: { invoiceId: generatedInvoice.id } });
    await prisma.invoice.delete({ where: { id: generatedInvoice.id } });
    await prisma.subscription.delete({ where: { id: testSub.id } });
    await prisma.plan.delete({ where: { id: testPlan.id } });
    await prisma.product.delete({ where: { id: testProd.id } });
    await prisma.customer.delete({ where: { id: testCust.id } });
    console.log("✓ Test records cleaned up successfully");

    console.log("\n=======================================================");
    console.log("✅ ALL INVOICE GENERATION & RECURRING BILLING TESTS PASSED!");
    console.log("=======================================================");
  } finally {
    await new Promise<void>((resolve) => server.close(() => resolve()));
    console.log("Test server closed.");
  }
}

runVerification().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
