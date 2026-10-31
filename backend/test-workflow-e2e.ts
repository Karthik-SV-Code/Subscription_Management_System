import app from "./src/app";
import http from "http";
import { prisma } from "./src/config/database";

async function runBusinessWorkflowTest() {
  console.log("===============================================================================");
  console.log("SubscriptIQ: Full End-to-End Business Workflow Test (Live PostgreSQL)");
  console.log("Sequence: Login -> Customer -> Plan -> Subscription -> Invoice -> Payment -> Dashboard");
  console.log("===============================================================================");

  const PORT = 8092;
  const server = http.createServer(app);
  await new Promise<void>((resolve) => server.listen(PORT, resolve));
  const baseUrl = `http://localhost:${PORT}/api/v1`;

  let createdDiscountId: string | null = null;

  try {
    const timestamp = Date.now();

    // -------------------------------------------------------------------------
    // STEP 1: Admin logs in (or registers if new)
    // -------------------------------------------------------------------------
    console.log("\n[STEP 1] Admin Authentication...");
    const adminEmail = `admin-${timestamp}@brightloop.com`;
    const adminPassword = "BrightloopAdmin2026!";

    // Register admin user
    const regRes = await fetch(`${baseUrl}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: adminEmail,
        password: adminPassword,
        firstName: "System",
        lastName: "Administrator",
        role: "ADMIN",
      }),
    });
    const regData = await regRes.json();
    if (!regData.success) {
      throw new Error(`Admin registration failed: ${JSON.stringify(regData)}`);
    }

    // Login with registered admin
    const loginRes = await fetch(`${baseUrl}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: adminEmail,
        password: adminPassword,
      }),
    });
    const loginData = await loginRes.json();
    if (!loginData.success || !loginData.data.token) {
      throw new Error(`Admin login failed: ${JSON.stringify(loginData)}`);
    }
    const adminToken = loginData.data.token;
    console.log(`✓ Admin logged in successfully (JWT token issued for ${adminEmail})`);

    const authHeaders = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${adminToken}`,
    };

    // -------------------------------------------------------------------------
    // STEP 2: Create a customer
    // -------------------------------------------------------------------------
    console.log("\n[STEP 2] Creating Customer...");
    const customerPayload = {
      name: `Brightloop Global Corp ${timestamp}`,
      email: `finance-${timestamp}@brightloop-client.com`,
      companyName: "Brightloop Global Enterprise",
      status: "active",
      currency: "USD",
      billingAddress: {
        line1: "100 Innovation Way",
        city: "San Francisco",
        state: "CA",
        postalCode: "94105",
        country: "USA",
      },
    };

    const custRes = await fetch(`${baseUrl}/customers`, {
      method: "POST",
      headers: authHeaders,
      body: JSON.stringify(customerPayload),
    });
    const custData = await custRes.json();
    if (!custData.success) {
      throw new Error(`Customer creation failed: ${JSON.stringify(custData)}`);
    }
    const customer = custData.data;
    console.log(`✓ Customer created: ${customer.id} (${customer.name})`);

    // -------------------------------------------------------------------------
    // STEP 3: Create a product & plan
    // -------------------------------------------------------------------------
    console.log("\n[STEP 3] Creating Product & Plan...");
    const productPayload = {
      name: `SubscriptIQ Enterprise Suite ${timestamp}`,
      code: `PROD-ENT-${timestamp}`,
      description: "Full-tier recurring revenue infrastructure with revenue analytics",
      status: "active",
      features: ["Multi-currency billing", "Automated invoicing", "Payment recovery"],
    };

    const prodRes = await fetch(`${baseUrl}/products`, {
      method: "POST",
      headers: authHeaders,
      body: JSON.stringify(productPayload),
    });
    const prodData = await prodRes.json();
    if (!prodData.success) {
      throw new Error(`Product creation failed: ${JSON.stringify(prodData)}`);
    }
    const product = prodData.data;
    console.log(`✓ Product created: ${product.id} (Code: ${product.code})`);

    const planPayload = {
      productId: product.id,
      name: "Enterprise Gold Monthly",
      code: `PLAN-GOLD-${timestamp}`,
      amount: 150.0,
      currency: "USD",
      interval: "month",
      intervalCount: 1,
      pricingModel: "flat_fee",
      trialPeriodDays: 0,
      isActive: true,
    };

    const planRes = await fetch(`${baseUrl}/plans`, {
      method: "POST",
      headers: authHeaders,
      body: JSON.stringify(planPayload),
    });
    const planData = await planRes.json();
    if (!planData.success) {
      throw new Error(`Plan creation failed: ${JSON.stringify(planData)}`);
    }
    const plan = planData.data;
    console.log(`✓ Plan created: ${plan.id} ($${plan.amount} / month)`);

    // -------------------------------------------------------------------------
    // STEP 4: Create a subscription
    // -------------------------------------------------------------------------
    console.log("\n[STEP 4] Creating Subscription...");
    // Set start date 32 days in past so it is immediately due for billing
    const pastStart = new Date(Date.now() - 32 * 86400000);
    const subPayload = {
      customerId: customer.id,
      planId: plan.id,
      quantity: 2, // 2 seats = $300.00 / month
      startDate: pastStart.toISOString(),
      billingInterval: "MONTHLY",
    };

    const subRes = await fetch(`${baseUrl}/subscriptions`, {
      method: "POST",
      headers: authHeaders,
      body: JSON.stringify(subPayload),
    });
    const subData = await subRes.json();
    if (!subData.success) {
      throw new Error(`Subscription creation failed: ${JSON.stringify(subData)}`);
    }
    const subscription = subData.data;
    console.log(`✓ Subscription created: ${subscription.id}`);
    console.log(`  Quantity: ${subscription.quantity}, Unit Price: $${subscription.unitAmount}, Total: $${subscription.totalAmount}, MRR: $${subscription.mrr}`);

    // Update nextBillingDate to yesterday so it is immediately eligible for recurring billing
    const yesterday = new Date(Date.now() - 1 * 86400000);
    await prisma.subscription.update({
      where: { id: subscription.id },
      data: { nextBillingDate: yesterday, currentPeriodEnd: yesterday },
    });

    // -------------------------------------------------------------------------
    // STEP 5: Generate an invoice
    // -------------------------------------------------------------------------
    console.log("\n[STEP 5] Generating Recurring Invoice...");
    const genRes = await fetch(`${baseUrl}/invoices/generate`, {
      method: "POST",
      headers: authHeaders,
      body: JSON.stringify({
        subscriptionId: subscription.id,
        taxRate: 10.0, // 10% tax
      }),
    });
    const genData = await genRes.json();
    if (!genData.success || genData.data.generatedCount < 1) {
      throw new Error(`Invoice generation failed: ${JSON.stringify(genData)}`);
    }
    const invoice = genData.data.invoices[0];
    console.log(`✓ Invoice generated: #${invoice.invoiceNumber} (ID: ${invoice.id})`);
    console.log(`  Subtotal: $${invoice.subtotal}, Tax (10%): $${invoice.taxAmount}, Total: $${invoice.total}`);

    // -------------------------------------------------------------------------
    // STEP 6: Discounts Module Verification (Create, Validate & Apply)
    // -------------------------------------------------------------------------
    console.log("\n[STEP 6] Discounts Module Verification...");
    const discountCode = `PROMO${timestamp}`;
    const createDiscountRes = await fetch(`${baseUrl}/discounts`, {
      method: "POST",
      headers: authHeaders,
      body: JSON.stringify({
        code: discountCode,
        name: "Spring Launch Promotion",
        description: "$50 off subscription billing",
        type: "FIXED",
        value: 50.0,
        currency: "USD",
        maxUses: 100,
        expiresAt: new Date(Date.now() + 30 * 86400000).toISOString(),
        isActive: true,
      }),
    });
    const createDiscountData = await createDiscountRes.json();
    if (!createDiscountData.success) {
      throw new Error(`Discount creation failed: ${JSON.stringify(createDiscountData)}`);
    }
    createdDiscountId = createDiscountData.data.id;
    console.log(`✓ Discount code created: ${discountCode} ($50 FIXED)`);

    // Validate discount code via POST /api/v1/discounts/validate
    const validateRes = await fetch(`${baseUrl}/discounts/validate`, {
      method: "POST",
      headers: authHeaders,
      body: JSON.stringify({
        code: discountCode,
        amount: 300.0,
      }),
    });
    const validateData = await validateRes.json();
    if (!validateData.success || !validateData.data.valid) {
      throw new Error(`Discount validation failed: ${JSON.stringify(validateData)}`);
    }
    console.log(`✓ Discount code validated: calculatedDiscountAmount=$${validateData.data.discount.calculatedDiscountAmount}`);

    // Apply discount to the generated invoice
    const discountRes = await fetch(`${baseUrl}/invoices/${invoice.id}/discount`, {
      method: "POST",
      headers: authHeaders,
      body: JSON.stringify({
        discountAmount: 50.0,
        code: discountCode,
      }),
    });
    const discountData = await discountRes.json();
    if (!discountData.success) {
      throw new Error(`Discount application failed: ${JSON.stringify(discountData)}`);
    }
    const discountedInvoice = discountData.data;
    console.log(`✓ Discount applied to invoice (New Total: $${discountedInvoice.total}, Due: $${discountedInvoice.amountDue})`);

    const expectedTotal = 275.0; // (300 - 50) + 10% tax on 250 (25) = 275.00
    if (parseFloat(discountedInvoice.total) !== expectedTotal) {
      throw new Error(`Expected total $${expectedTotal}, got $${discountedInvoice.total}`);
    }

    // -------------------------------------------------------------------------
    // STEP 7: Payments Module Verification (Partial & Full Payments via POST /payments)
    // -------------------------------------------------------------------------
    console.log("\n[STEP 7] Payments Module Verification (POST /api/v1/payments)...");
    
    // 7.1 Record partial payment of $100.00
    const partialPayRes = await fetch(`${baseUrl}/payments`, {
      method: "POST",
      headers: authHeaders,
      body: JSON.stringify({
        invoiceId: invoice.id,
        amount: 100.0,
        paymentMethod: "manual",
        notes: "Cash / wire transfer partial payment",
      }),
    });
    const partialPayData = await partialPayRes.json();
    if (!partialPayData.success) {
      throw new Error(`Partial payment recording failed: ${JSON.stringify(partialPayData)}`);
    }
    const invAfterPartial = partialPayData.data.invoice;
    console.log(`✓ Partial payment recorded via POST /payments ($100.00)`);
    console.log(`  Invoice Status: ${invAfterPartial.status} (Expected: PARTIALLY_PAID)`);
    console.log(`  Amount Paid: $${invAfterPartial.amountPaid}, Remaining Due: $${invAfterPartial.amountDue}`);

    if (invAfterPartial.status !== "PARTIALLY_PAID" || parseFloat(invAfterPartial.amountDue) !== 175.0) {
      throw new Error(`Partial payment state incorrect: status=${invAfterPartial.status}, due=${invAfterPartial.amountDue}`);
    }

    // 7.2 Record remaining payment of $175.00
    const remainingPayRes = await fetch(`${baseUrl}/payments`, {
      method: "POST",
      headers: authHeaders,
      body: JSON.stringify({
        invoiceId: invoice.id,
        amount: 175.0,
        paymentMethod: "bank_transfer",
        notes: "Final settlement via bank transfer",
      }),
    });
    const remainingPayData = await remainingPayRes.json();
    if (!remainingPayData.success) {
      throw new Error(`Remaining payment recording failed: ${JSON.stringify(remainingPayData)}`);
    }
    const invAfterFull = remainingPayData.data.invoice;
    console.log(`✓ Remaining payment recorded via POST /payments ($175.00)`);
    console.log(`  Invoice Status: ${invAfterFull.status} (Expected: PAID)`);
    console.log(`  Remaining Due: $${invAfterFull.amountDue} (Expected: 0.00)`);

    if (invAfterFull.status !== "PAID" || parseFloat(invAfterFull.amountDue) !== 0.0) {
      throw new Error(`Full payment state incorrect: status=${invAfterFull.status}, due=${invAfterFull.amountDue}`);
    }

    // 7.3 List payments via GET /api/v1/payments
    const listPayRes = await fetch(`${baseUrl}/payments?invoiceId=${invoice.id}`, {
      headers: authHeaders,
    });
    const listPayData = await listPayRes.json();
    if (!listPayData.success || listPayData.data.length !== 2) {
      throw new Error(`Expected 2 payments for invoice, got ${listPayData.data?.length}`);
    }
    console.log(`✓ Verified GET /api/v1/payments returned ${listPayData.data.length} recorded payments`);

    // -------------------------------------------------------------------------
    // STEP 8: Verify invoice status is PAID
    // -------------------------------------------------------------------------
    console.log("\n[STEP 8] Verifying Final Invoice State...");
    const verifyInvoiceRes = await fetch(`${baseUrl}/invoices/${invoice.id}`);
    const verifyInvoiceData = await verifyInvoiceRes.json();
    const finalInvoice = verifyInvoiceData.data;

    console.log(`  Final Status: ${finalInvoice.status}`);
    console.log(`  Amount Paid:  $${finalInvoice.amountPaid}`);
    console.log(`  Amount Due:   $${finalInvoice.amountDue}`);
    console.log(`  Paid At:      ${finalInvoice.paidAt}`);

    if (finalInvoice.status !== "PAID" || parseFloat(finalInvoice.amountDue) !== 0) {
      throw new Error(`Invoice status or balance mismatch: status=${finalInvoice.status}, due=${finalInvoice.amountDue}`);
    }
    console.log("✓ Invoice successfully verified as PAID with $0.00 balance");

    // -------------------------------------------------------------------------
    // STEP 9: Dashboard Analytics Verification
    // -------------------------------------------------------------------------
    console.log("\n[STEP 9] Verifying Dashboard Analytics...");
    const statsRes = await fetch(`${baseUrl}/dashboard/stats`, {
      headers: authHeaders,
    });
    const statsData = await statsRes.json();
    if (!statsData.success) {
      throw new Error(`Dashboard stats fetch failed: ${JSON.stringify(statsData)}`);
    }
    const stats = statsData.data;
    console.log("✓ Dashboard Stats retrieved from PostgreSQL:");
    console.log(JSON.stringify(stats, null, 2));

    console.log(`- totalCustomers: ${stats.totalCustomers} (>= 1)`);
    console.log(`- activeSubscriptions: ${stats.activeSubscriptions} (>= 1)`);
    console.log(`- monthlyRecurringRevenue: $${stats.monthlyRecurringRevenue} (>= $300.00)`);
    console.log(`- totalRevenueCollected: $${stats.totalRevenueCollected} (>= $275.00)`);
    console.log(`- paidInvoices: ${stats.paidInvoices} (>= 1)`);
    console.log(`- outstandingInvoices: ${stats.outstandingInvoices}`);

    if (stats.totalCustomers < 1) throw new Error("totalCustomers must be at least 1");
    if (stats.activeSubscriptions < 1) throw new Error("activeSubscriptions must be at least 1");
    if (stats.monthlyRecurringRevenue < 300) throw new Error("MRR should include the $300 subscription");
    if (stats.totalRevenueCollected < 275) throw new Error("totalRevenueCollected should include the $275 payment");
    if (stats.paidInvoices < 1) throw new Error("paidInvoices must be at least 1");

    // 9.2 Revenue Chart (6-Month)
    const revRes = await fetch(`${baseUrl}/dashboard/revenue?months=6`, {
      headers: authHeaders,
    });
    const revData = await revRes.json();
    console.log("✓ Revenue Chart data:", JSON.stringify(revData.data, null, 2));

    // 9.3 Recent Activity Feed
    const actRes = await fetch(`${baseUrl}/dashboard/recent-activity?limit=5`, {
      headers: authHeaders,
    });
    const actData = await actRes.json();
    console.log("✓ Recent Activity data (Latest 5 events):", JSON.stringify(actData.data, null, 2));

    console.log("\n===============================================================================");
    console.log("🏆 FULL END-TO-END WORKFLOW VERIFIED AND PASSED ON REAL POSTGRESQL!");
    console.log("===============================================================================");

    // Clean up created entities
    console.log("\nCleaning up test entities...");
    await prisma.payment.deleteMany({ where: { invoiceId: invoice.id } });
    await prisma.invoiceLineItem.deleteMany({ where: { invoiceId: invoice.id } });
    await prisma.invoice.delete({ where: { id: invoice.id } });
    if (createdDiscountId) {
      await prisma.discount.delete({ where: { id: createdDiscountId } });
    }
    await prisma.subscription.delete({ where: { id: subscription.id } });
    await prisma.plan.delete({ where: { id: plan.id } });
    await prisma.product.delete({ where: { id: product.id } });
    await prisma.customer.delete({ where: { id: customer.id } });
    await prisma.user.delete({ where: { id: loginData.data.user.id } });
    console.log("✓ Test database cleanup complete");

  } finally {
    await new Promise<void>((resolve) => server.close(() => resolve()));
    console.log("Test server closed.");
  }
}

runBusinessWorkflowTest().catch((err) => {
  console.error("\n❌ Workflow Test Failed:", err);
  process.exit(1);
});
