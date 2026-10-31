# SubscriptIQ REST API Documentation

**Brightloop Software — Enterprise Subscription & Recurring Revenue Management Platform**  
**Version:** `1.0.0` | **Base URL:** `http://localhost:8000/api/v1`

---

## 1. Architecture & Overview

SubscriptIQ is an enterprise-grade subscription management and recurring billing platform backend engineered with:
- **Runtime:** Node.js & Express.js with TypeScript
- **Database & ORM:** PostgreSQL with Prisma ORM
- **Security:** JWT authentication, bcryptjs (salt rounds = 10), Helmet HTTP headers, CORS protection
- **Validation:** Type-safe Zod runtime schema validation
- **Financial Arithmetic:** Zero-loss PostgreSQL `Decimal(12, 2)` calculations avoiding IEEE-754 floating-point inaccuracies
- **Data Protection:** Password hashes are strictly sanitized and never exposed in responses

---

## 2. Authentication & Authorization

All write endpoints (`POST`, `PUT`, `PATCH`, `DELETE`) and protected read endpoints require a JSON Web Token (JWT) provided in the HTTP `Authorization` header:

```http
Authorization: Bearer <jwt_token>
```

### Roles & Access Control
- `ADMIN`: Unrestricted administrative access across all modules, configuration, and overview.
- `STAFF`: Access to day-to-day subscription and customer operational endpoints.
- Role-based guard middleware (`authorize("ADMIN")`) rejects unpermitted requests with HTTP `403 Forbidden`.

---

## 3. Standard API Envelopes & Error Handling

### 3.1 Standard Success Envelope
```json
{
  "success": true,
  "message": "Resource retrieved successfully",
  "data": { ... }
}
```

### 3.2 Standard Paginated Envelope
```json
{
  "success": true,
  "message": "List retrieved successfully",
  "data": [ ... ],
  "pagination": {
    "total": 45,
    "page": 1,
    "pageSize": 10,
    "totalPages": 5
  }
}
```

### 3.3 Standard Error Envelope
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "amount",
      "message": "Price amount must be non-negative (>= 0)"
    }
  ]
}
```

### Common HTTP Status Codes
- `200 OK`: Request succeeded.
- `201 Created`: Resource successfully created.
- `400 Bad Request`: Validation failure or invalid lifecycle transition.
- `401 Unauthorized`: Missing, invalid, or expired JWT token.
- `403 Forbidden`: Insufficient role permissions.
- `404 Not Found`: Target resource not found in database.
- `409 Conflict`: Unique constraint violation (e.g. duplicate email, product code, or billing cycle).
- `500 Internal Server Error`: Centralized exception handler catch-all.

---

## 4. System & Health Endpoints

### `GET /health`
Returns system uptime, environment, and PostgreSQL connection health.
- **Access:** Public
- **Example cURL:**
  ```bash
  curl -X GET http://localhost:8000/health
  ```
- **Response `200 OK`:**
  ```json
  {
    "success": true,
    "message": "SubscriptIQ API health check",
    "data": {
      "status": "ok",
      "service": "SubscriptIQ API",
      "version": "1.0.0",
      "environment": "development",
      "timestamp": "2026-10-31T08:46:46.313Z",
      "uptime": 120,
      "database": {
        "status": "connected"
      }
    }
  }
  ```

### `GET /api/v1`
API v1 root route returning service metadata and catalog of available endpoints.
- **Access:** Public

---

## 5. Authentication Module

### `POST /api/v1/auth/register`
Register a new administrator or staff account.
- **Access:** Public
- **Body Schema:**
  | Field | Type | Required | Description |
  | :--- | :--- | :---: | :--- |
  | `email` | String | Yes | Valid email address (unique) |
  | `password` | String | Yes | Min 8 chars, 1 uppercase, 1 lowercase, 1 number |
  | `firstName` | String | Yes | Non-empty string |
  | `lastName` | String | Yes | Non-empty string |
  | `role` | String | No | `"ADMIN"` or `"STAFF"` (default: `"STAFF"`) |
- **Example cURL:**
  ```bash
  curl -X POST http://localhost:8000/api/v1/auth/register \
    -H "Content-Type: application/json" \
    -d '{
      "email": "admin@brightloop.com",
      "password": "Password123!",
      "firstName": "Alex",
      "lastName": "Vance",
      "role": "ADMIN"
    }'
  ```
- **Response `201 Created`:**
  ```json
  {
    "success": true,
    "message": "User registered successfully",
    "data": {
      "user": {
        "id": "e21bda1b-684c-4734-b258-0056ce48f98c",
        "email": "admin@brightloop.com",
        "firstName": "Alex",
        "lastName": "Vance",
        "role": "ADMIN",
        "isActive": true
      },
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    }
  }
  ```

### `POST /api/v1/auth/login`
Authenticate user with email and password to receive a JWT.
- **Access:** Public
- **Example cURL:**
  ```bash
  curl -X POST http://localhost:8000/api/v1/auth/login \
    -H "Content-Type: application/json" \
    -d '{
      "email": "admin@brightloop.com",
      "password": "Password123!"
    }'
  ```

### `GET /api/v1/auth/me`
Retrieve authenticated user profile.
- **Access:** Protected (`Bearer <token>`)

---

## 6. Customers Module

### `GET /api/v1/customers`
List customers with pagination and filtering.
- **Access:** Protected / Public
- **Query Parameters:**
  - `page`: Page number (default: `1`)
  - `pageSize`: Page size (default: `10`, max: `100`)
  - `search`: Filter by name, email, or company name
  - `status`: `active`, `inactive`, `lead`, `churned`
- **Response `200 OK`:** Paginated customer records with `activeSubscriptionsCount`.

### `GET /api/v1/customers/:id`
Retrieve customer by UUID including associated subscriptions.
- **Access:** Protected / Public

### `POST /api/v1/customers`
Create a customer.
- **Access:** Protected (`Bearer <token>`)
- **Body Schema:**
  ```json
  {
    "name": "Acme Innovations Ltd",
    "email": "billing@acme.com",
    "companyName": "Acme Corp",
    "status": "active",
    "currency": "USD",
    "billingAddress": {
      "line1": "100 Tech Blvd",
      "city": "Austin",
      "state": "TX",
      "postalCode": "78701",
      "country": "US"
    },
    "taxId": "US-987654321"
  }
  ```

### `PUT /api/v1/customers/:id`
Update customer details.
- **Access:** Protected (`Bearer <token>`)

### `DELETE /api/v1/customers/:id`
Delete customer.
- **Access:** Protected (`Bearer <token>`)
- **Guarded Deletion:** Rejects deletion with `400 Bad Request` if customer has active subscriptions.

---

## 7. Products Module

### `GET /api/v1/products`
List products with pagination and search.
- **Access:** Protected / Public
- **Query Parameters:** `page`, `pageSize`, `search`, `status`

### `GET /api/v1/products/:id`
Retrieve product and all child pricing plans.
- **Access:** Protected / Public

### `POST /api/v1/products`
Create product.
- **Access:** Protected (`Bearer <token>`)
- **Body Schema:**
  ```json
  {
    "name": "SubscriptIQ Cloud Analytics",
    "code": "PROD-ANALYTICS",
    "description": "Enterprise recurring analytics",
    "status": "active",
    "features": ["Dashboards", "Cohort Analysis", "Automated Billing"]
  }
  ```

### `PUT /api/v1/products/:id`
Update product metadata.
- **Access:** Protected (`Bearer <token>`)

### `DELETE /api/v1/products/:id`
Delete product.
- **Access:** Protected (`Bearer <token>`)
- **Guarded Deletion:** Rejects deletion with `400 Bad Request` if any of its plans are actively subscribed.

---

## 8. Plans Module

### `GET /api/v1/plans`
List plans with pagination and filters.
- **Access:** Protected / Public
- **Query Parameters:** `page`, `pageSize`, `search`, `productId`, `interval`, `isActive`

### `GET /api/v1/plans/:id`
Retrieve plan details and parent product.
- **Access:** Protected / Public

### `POST /api/v1/plans`
Create a pricing plan.
- **Access:** Protected (`Bearer <token>`)
- **Body Schema:**
  ```json
  {
    "productId": "97b102b4-52d3-4629-9dc4-ca20c7a52bb9",
    "name": "Enterprise Pro Monthly",
    "code": "PLAN-PRO-MONTHLY",
    "description": "Full access for enterprise teams",
    "amount": 150.00,
    "currency": "USD",
    "interval": "month",
    "intervalCount": 1,
    "pricingModel": "flat_fee",
    "trialPeriodDays": 0,
    "isActive": true
  }
  ```
- **Validation Rule:** Price `amount` must be non-negative (`>= 0`). Invalid values return `400 Bad Request`.

### `PUT /api/v1/plans/:id`
Update plan parameters.
- **Access:** Protected (`Bearer <token>`)

### `DELETE /api/v1/plans/:id`
Delete plan.
- **Access:** Protected (`Bearer <token>`)
- **Guarded Deletion:** Rejects deletion with `400 Bad Request` if plan is referenced by active subscriptions.

---

## 9. Subscriptions & Lifecycle Module

### Lifecycle State Machine & Valid Transitions

| Current Status | Target `PAUSED` | Target `ACTIVE` | Target `CANCELLED` | Notes |
| :--- | :---: | :---: | :---: | :--- |
| **`ACTIVE`** | **VALID (200)** | Invalid (Already active) | **VALID (200)** | Pauses or halts subscription |
| **`PAUSED`** | Invalid (Already paused) | **VALID (200)** | **VALID (200)** | Resumes or cancels subscription |
| **`CANCELLED`** | **REJECTED (400)** | **REJECTED (400)** | **REJECTED (400)** | **Terminal State:** Cannot transition |

### `GET /api/v1/subscriptions`
List subscriptions with filters.
- **Access:** Protected / Public
- **Query Parameters:** `page`, `pageSize`, `search`, `status`, `customerId`, `planId`

### `GET /api/v1/subscriptions/:id`
Retrieve subscription by UUID.
- **Access:** Protected / Public

### `POST /api/v1/subscriptions`
Create a subscription.
- **Access:** Protected (`Bearer <token>`)
- **Body Schema:**
  ```json
  {
    "customerId": "4d78140d-3890-4b19-a75e-e269e41d32aa",
    "planId": "3ff59526-728b-494b-a010-fb81da9636c7",
    "quantity": 2,
    "startDate": "2026-10-31T00:00:00.000Z",
    "billingInterval": "month"
  }
  ```
- **Automatic Calculations:**
  - `unitAmount`: Inherited from `plan.amount`.
  - `totalAmount`: Calculated as `unitAmount * quantity`.
  - `mrr`: Computed via Decimal-safe math (Monthly: `totalAmount`; Yearly: `totalAmount / 12`).
  - `nextBillingDate`: Calculated with **month-end pinning** (e.g. Jan 31 -> Feb 28 -> Mar 31).

### `PATCH /api/v1/subscriptions/:id/status`
Transition subscription lifecycle state.
- **Access:** Protected (`Bearer <token>`)
- **Body Schema:**
  ```json
  {
    "status": "PAUSED",
    "reason": "Temporary customer pause"
  }
  ```

### `POST /api/v1/subscriptions/:id/renew`
Renew an active subscription.
- **Access:** Protected (`Bearer <token>`)
- **Business Rule:** Rejects paused or cancelled subscriptions with `400 Bad Request`.

### `GET /api/v1/subscriptions/due/billing`
Query subscriptions eligible for recurring billing run.
- **Access:** Protected (`Bearer <token>`)
- **Query Parameters:** `asOfDate`, `limit`
- **Business Rule:** Strictly returns only `ACTIVE` subscriptions where `nextBillingDate <= asOfDate`. Cancelled and paused subscriptions are excluded.

---

## 10. Invoices & Billing Engine Module

### Invoice Status Flow
```
[DRAFT] --> [UNPAID] --> [PARTIALLY_PAID] --> [PAID]
                 |
                 +-----> [OVERDUE]
```

### `GET /api/v1/invoices`
List invoices with pagination and filters.
- **Access:** Protected / Public
- **Query Parameters:** `page`, `pageSize`, `status`, `customerId`, `subscriptionId`, `search`

### `GET /api/v1/invoices/:id`
Retrieve invoice by UUID with line-item snapshots and payments.
- **Access:** Protected / Public

### `POST /api/v1/invoices/generate`
Run recurring billing engine for due subscriptions.
- **Access:** Protected (`Bearer <token>`)
- **Body Schema:**
  ```json
  {
    "asOfDate": "2026-10-31T00:00:00.000Z",
    "subscriptionId": "optional-subscription-uuid",
    "taxRate": 10.0,
    "dueDateDays": 14
  }
  ```
- **Duplicate Prevention Guarantee:**
  - Unique composite constraint: `@@unique([subscriptionId, billingPeriodStart, billingPeriodEnd])`
  - Idempotent `billingCycleKey`: `inv_{subscriptionId}_{periodStart}_{periodEnd}`
  - Second invocation for the same period safely returns `skippedCount: 1` without creating duplicates.
- **Historical Snapshots:** Each line item stores a frozen snapshot of plan name, code, quantity, unit price, and period dates.

### `PATCH /api/v1/invoices/:id/status`
Update invoice status.
- **Access:** Protected (`Bearer <token>`)
- **Body Schema:**
  ```json
  {
    "status": "PAID",
    "notes": "Settled via automated ACH"
  }
  ```

### `POST /api/v1/invoices/:id/discount`
Apply an amount or percentage discount to an invoice before payment.
- **Access:** Protected (`Bearer <token>`)
- **Body Schema:**
  ```json
  {
    "discountAmount": 50.00,
    "discountCode": "PROMO50"
  }
  ```
  *(Or `{ "discountPercent": 10, "discountCode": "FALL10" }`)*
- **Calculations:**
  - Discount is subtracted from subtotal before tax recalculation.
  - Recalculates `subtotal`, `taxAmount`, `total`, and updates `amountDue`.

### `POST /api/v1/invoices/:id/payments`
Record a partial or full payment against an invoice.
- **Access:** Protected (`Bearer <token>`)
- **Body Schema:**
  ```json
  {
    "amount": 100.00,
    "method": "CREDIT_CARD",
    "transactionReference": "TXN_CC_987654",
    "notes": "First installment"
  }
  ```
- **Automated Settlement Logic:**
  - If `amountPaid < total`: Sets invoice status to `PARTIALLY_PAID` and updates `amountDue`.
  - If `amountPaid >= total`: Sets invoice status to `PAID`, sets `amountDue = 0.00`, and records `paidAt = now()`.

### `GET /api/v1/invoices/:id/payments`
Retrieve complete payment history for an invoice.
- **Access:** Protected (`Bearer <token>`)

---

## 11. Dashboard Analytics Module

All dashboard analytics are computed directly from live PostgreSQL records using high-precision Decimal arithmetic.

### `GET /api/v1/dashboard/stats`
Retrieve high-level subscription and revenue KPI metrics.
- **Access:** Protected (`Bearer <token>`)
- **Example cURL:**
  ```bash
  curl -X GET http://localhost:8000/api/v1/dashboard/stats \
    -H "Authorization: Bearer <token>"
  ```
- **Response `200 OK`:**
  ```json
  {
    "success": true,
    "message": "Dashboard statistics retrieved successfully",
    "data": {
      "totalCustomers": 12,
      "activeSubscriptions": 8,
      "totalSubscriptions": 14,
      "monthlyRecurringRevenue": 1250.00,
      "totalRevenueCollected": 5420.50,
      "outstandingAmount": 380.00,
      "paidInvoices": 18,
      "unpaidInvoices": 2
    }
  }
  ```

### `GET /api/v1/dashboard/revenue`
Retrieve monthly revenue trends for the previous six months from actual payment records.
- **Access:** Protected (`Bearer <token>`)
- **Query Parameters:** `months` (optional integer, default: `6`)
- **Example cURL:**
  ```bash
  curl -X GET "http://localhost:8000/api/v1/dashboard/revenue?months=6" \
    -H "Authorization: Bearer <token>"
  ```
- **Response `200 OK`:**
  ```json
  {
    "success": true,
    "message": "Revenue chart data retrieved successfully",
    "data": [
      { "month": "2026-05", "label": "May 2026", "revenue": 850.00, "paymentsCount": 4 },
      { "month": "2026-06", "label": "Jun 2026", "revenue": 920.00, "paymentsCount": 5 },
      { "month": "2026-07", "label": "Jul 2026", "revenue": 1100.00, "paymentsCount": 6 },
      { "month": "2026-08", "label": "Aug 2026", "revenue": 1050.00, "paymentsCount": 6 },
      { "month": "2026-09", "label": "Sep 2026", "revenue": 1225.50, "paymentsCount": 7 },
      { "month": "2026-10", "label": "Oct 2026", "revenue": 1275.00, "paymentsCount": 8 }
    ]
  }
  ```

### `GET /api/v1/dashboard/recent-activity`
Chronologically sorted real-time feed of recent invoices and payments.
- **Access:** Protected (`Bearer <token>`)
- **Query Parameters:** `limit` (optional integer, default: `10`, max: `50`)
- **Response `200 OK`:**
  ```json
  {
    "success": true,
    "message": "Recent activity feed retrieved successfully",
    "data": [
      {
        "id": "pay-uuid-1",
        "type": "PAYMENT",
        "description": "Payment for #INV-202610-0001 (CREDIT_CARD)",
        "amount": 175.00,
        "currency": "USD",
        "status": "COMPLETED",
        "customer": {
          "id": "cust-uuid-1",
          "name": "Acme Corp",
          "email": "finance@acme.com",
          "companyName": "Acme Global"
        },
        "date": "2026-10-31T08:47:31.382Z"
      },
      {
        "id": "inv-uuid-1",
        "type": "INVOICE",
        "description": "Invoice #INV-202610-0001-3305 (PAID)",
        "amount": 275.00,
        "currency": "USD",
        "status": "PAID",
        "customer": {
          "id": "cust-uuid-1",
          "name": "Acme Corp",
          "email": "finance@acme.com",
          "companyName": "Acme Global"
        },
        "date": "2026-10-31T08:47:31.336Z"
      }
    ]
  }
  ```

---

## 12. MRR Calculation Methodology

Monthly Recurring Revenue (MRR) represents the normalized monthly recurring subscription revenue under contract.

### Formula
- **For monthly plans (`interval: "month"`):**
  $$\text{MRR} = \text{monthly plan price} \times \text{quantity}$$
- **For yearly plans (`interval: "year"`):**
  $$\text{MRR} = \frac{\text{yearly plan price} \times \text{quantity}}{12}$$

### Calculation Rules & Exclusions
1. **Strictly Active Subscriptions:** Only subscriptions with `status = "ACTIVE"` are included in MRR calculations.
2. **Exclusion of Non-Active States:**
   - `PAUSED`: Excluded (billing is temporarily frozen).
   - `CANCELLED`: Excluded (contract terminated).
   - Expired or Trialing without conversion: Excluded.
3. **Decimal-Safe Precision:** All arithmetic uses `Prisma.Decimal` to avoid floating-point rounding errors. Division by 12 uses half-up rounding to 2 decimal places.

---

## 13. End-to-End Business Workflow (Verified Sequence)

The complete end-to-end business flow is fully automated and verified via `test-workflow-e2e.ts`:

```
1. Admin logs in -> POST /api/v1/auth/login
2. Create customer -> POST /api/v1/customers
3. Create product -> POST /api/v1/products
4. Create pricing plan ($150/mo) -> POST /api/v1/plans
5. Create subscription (2 seats) -> POST /api/v1/subscriptions ($300/mo MRR)
6. Generate invoice -> POST /api/v1/invoices/generate ($300 subtotal + $30 tax = $330)
7. Apply discount ($50 off) -> POST /api/v1/invoices/:id/discount ($250 subtotal + $25 tax = $275 total)
8. Record partial payment ($100) -> POST /api/v1/invoices/:id/payments (Status: PARTIALLY_PAID, Due: $175)
9. Record remaining payment ($175) -> POST /api/v1/invoices/:id/payments
10. Verify invoice becomes PAID -> Status: PAID, Amount Due: $0.00, paidAt recorded
11. Fetch dashboard stats -> GET /api/v1/dashboard/stats
12. Verify collected revenue and subscription metrics from live PostgreSQL
```

---

## 14. OpenAPI 3.0 / Swagger Specification

For API clients and automated tooling, an OpenAPI 3.0 document is maintained at `docs/openapi.json`.
Base server URL: `http://localhost:8000/api/v1`.
Authentication Scheme: HTTP Bearer JWT (`bearerAuth`).
