import app from "./src/app";
import http from "http";
import { prisma } from "./src/config/database";

async function runBusinessWorkflowTest() {
  console.log("===============================================================================");
  console.log("SubscriptIQ Sprint 5: Full End-to-End Business Workflow Test (Live PostgreSQL)");
  console.log("===============================================================================");

  const PORT = 8091;
  const server = http.createServer(app);
  await new Promise<void>((resolve) => server.listen(PORT, resolve));
  const baseUrl = `http://localhost:${PORT}/api/v1`;

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
    // STEP 3: Create a product
    // -------------------------------------------------------------------------
    console.log("\n[STEP 3] Creating Product...");
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

    // -------------------------------------------------------------------------
    // STEP 4: Create a subscription plan
    // -------------------------------------------------------------------------
    console.log("\n[STEP 4] Creating Subscription Plan...");
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
    // STEP 5: Create a subscription
    // -------------------------------------------------------------------------
    console.log("\n[STEP 5] Creating Subscription...");
    // Set start date 32 days in the past so it is due for billing today!
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

    // Update nextBillingDate to yesterday so it is immediately eligible for recurring billing run
    const yesterday = new Date(Date.now() - 1 * 86400000);
    await prisma.subscription.update({
      where: { id: subscription.id },
      data: { nextBillingDate: yesterday, currentPeriodEnd: yesterday },
    });

    // -------------------------------------------------------------------------
    // STEP 6: Generate an invoice
    // -------------------------------------------------------------------------
    console.log("\n[STEP 6] Generating Recurring Invoice...");
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
    // STEP 7: Apply a discount
    // -------------------------------------------------------------------------
    console.log("\n[STEP 7] Applying Discount...");
    const discountRes = await fetch(`${baseUrl}/invoices/${invoice.id}/discount`, {
      method: "POST",
      headers: authHeaders,
      body: JSON.stringify({
        discountAmount: 50.0, // $50 fixed discount
        code: "HACKATHON50",
      }),
    });
    const discountData = await discountRes.json();
    if (!discountData.success) {
      throw new Error(`Discount application failed: ${JSON.stringify(discountData)}`);
    }
    const discountedInvoice = discountData.data;
    console.log(`✓ Discount applied ($50.00 off with code ${discountedInvoice.discountCode})`);
    console.log(`  New Taxable Subtotal: $${parseFloat(discountedInvoice.subtotal) - 50}`);
    console.log(`  New Tax: $${discountedInvoice.taxAmount}`);
    console.log(`  New Total: $${discountedInvoice.total} (Amount Due: $${discountedInvoice.amountDue})`);

    const expectedTotal = 275.0; // (300 - 50) + 10% tax on 250 (25) = 275.00
    if (parseFloat(discountedInvoice.total) !== expectedTotal) {
      throw new Error(`Expected total $${expectedTotal}, got $${discountedInvoice.total}`);
    }

    // -------------------------------------------------------------------------
    // STEP 8: Record partial payment
    // -------------------------------------------------------------------------
    console.log("\n[STEP 8] Recording Partial Payment ($100.00)...");
    const partialPayRes = await fetch(`${baseUrl}/invoices/${invoice.id}/payments`, {
      method: "POST",
      headers: authHeaders,
      body: JSON.stringify({
        amount: 100.0,
        paymentMethod: "credit_card",
        lastFour: "4242",
      }),
    });
    const partialPayData = await partialPayRes.json();
    if (!partialPayData.success) {
      throw new Error(`Partial payment recording failed: ${JSON.stringify(partialPayData)}`);
    }
    const invoiceAfterPartial = partialPayData.data.invoice;
    console.log(`✓ Partial payment recorded: $100.00`);
    console.log(`  Status: ${invoiceAfterPartial.status} (Expected: PARTIALLY_PAID)`);
    console.log(`  Amount Paid: $${invoiceAfterPartial.amountPaid}, Remaining Due: $${invoiceAfterPartial.amountDue}`);

    if (invoiceAfterPartial.status !== "PARTIALLY_PAID" || parseFloat(invoiceAfterPartial.amountDue) !== 175.0) {
      throw new Error(`Partial payment state incorrect: status=${invoiceAfterPartial.status}, due=${invoiceAfterPartial.amountDue}`);
    }

    // -------------------------------------------------------------------------
    // STEP 9: Record remaining payment
    // -------------------------------------------------------------------------
    console.log("\n[STEP 9] Recording Remaining Payment ($175.00)...");
    const remainingPayRes = await fetch(`${baseUrl}/invoices/${invoice.id}/payments`, {
      method: "POST",
      headers: authHeaders,
      body: JSON.stringify({
        amount: 175.0,
        paymentMethod: "bank_transfer",
      }),
    });
    const remainingPayData = await remainingPayRes.json();
    if (!remainingPayData.success) {
      throw new Error(`Remaining payment recording failed: ${JSON.stringify(remainingPayData)}`);
    }
    const invoiceAfterFull = remainingPayData.data.invoice;
    console.log(`✓ Remaining payment recorded: $175.00`);

    // -------------------------------------------------------------------------
    // STEP 10: Verify invoice becomes PAID
    // -------------------------------------------------------------------------
    console.log("\n[STEP 10] Verifying Invoice Status is PAID...");
    const verifyInvoiceRes = await fetch(`${baseUrl}/invoices/${invoice.id}`);
    const verifyInvoiceData = await verifyInvoiceRes.json();
    const finalInvoice = verifyInvoiceData.data;

    console.log(`  Final Status: ${finalInvoice.status}`);
    console.log(`  Amount Paid: $${finalInvoice.amountPaid}`);
    console.log(`  Amount Due:  $${finalInvoice.amountDue}`);
    console.log(`  Paid At:     ${finalInvoice.paidAt}`);

    if (finalInvoice.status !== "PAID") {
      throw new Error(`Expected invoice status PAID, got ${finalInvoice.status}`);
    }
    if (parseFloat(finalInvoice.amountDue) !== 0) {
      throw new Error(`Expected amountDue 0, got ${finalInvoice.amountDue}`);
    }
    if (!finalInvoice.paidAt) {
      throw new Error("Expected paidAt timestamp to be populated");
    }
    console.log("✓ Invoice successfully verified as PAID with $0.00 balance");

    // -------------------------------------------------------------------------
    // STEP 11: Fetch dashboard stats
    // -------------------------------------------------------------------------
    console.log("\n[STEP 11] Fetching Dashboard Stats...");
    const statsRes = await fetch(`${baseUrl}/dashboard/stats`);
    const statsData = await statsRes.json();
    if (!statsData.success) {
      throw new Error(`Dashboard stats fetch failed: ${JSON.stringify(statsData)}`);
    }
    const stats = statsData.data;
    console.log("✓ Dashboard Stats retrieved from PostgreSQL:");
    console.log(JSON.stringify(stats, null, 2));

    // -------------------------------------------------------------------------
    // STEP 12: Verify collected revenue and subscription metrics
    // -------------------------------------------------------------------------
    console.log("\n[STEP 12] Verifying Real Metrics...");
    console.log(`- totalCustomers: ${stats.totalCustomers} (>= 1)`);
    console.log(`- activeSubscriptions: ${stats.activeSubscriptions} (>= 1)`);
    console.log(`- monthlyRecurringRevenue: $${stats.monthlyRecurringRevenue} (>= $300.00)`);
    console.log(`- totalRevenueCollected: $${stats.totalRevenueCollected} (>= $275.00)`);
    console.log(`- paidInvoices: ${stats.paidInvoices} (>= 1)`);

    if (stats.totalCustomers < 1) throw new Error("totalCustomers must be at least 1");
    if (stats.activeSubscriptions < 1) throw new Error("activeSubscriptions must be at least 1");
    if (stats.monthlyRecurringRevenue < 300) throw new Error("MRR should include the $300 subscription");
    if (stats.totalRevenueCollected < 275) throw new Error("totalRevenueCollected should include the $275 payment");
    if (stats.paidInvoices < 1) throw new Error("paidInvoices must be at least 1");

    console.log("\nFetching 6-Month Monthly Revenue Chart...");
    const revRes = await fetch(`${baseUrl}/dashboard/revenue?months=6`);
    const revData = await revRes.json();
    console.log("✓ Revenue Chart data:", JSON.stringify(revData.data, null, 2));

    console.log("\nFetching Recent Activity Feed...");
    const actRes = await fetch(`${baseUrl}/dashboard/recent-activity?limit=5`);
    const actData = await actRes.json();
    console.log("✓ Recent Activity data (Latest 5 events):", JSON.stringify(actData.data, null, 2));

    console.log("\n===============================================================================");
    console.log("🏆 ALL 12 WORKFLOW STEPS VERIFIED & PASSED END-TO-END ON REAL POSTGRESQL!");
    console.log("===============================================================================");

    // Clean up created entities
    console.log("\nCleaning up test entities...");
    await prisma.payment.deleteMany({ where: { invoiceId: invoice.id } });
    await prisma.invoiceLineItem.deleteMany({ where: { invoiceId: invoice.id } });
    await prisma.invoice.delete({ where: { id: invoice.id } });
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
