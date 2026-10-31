# SubscriptIQ REST API Documentation

**Brightloop Software — Enterprise Subscription & Recurring Revenue Management Platform**  
**Version:** `1.0.0` | **Base URL:** `http://localhost:8000/api/v1`

---

## 1. Authentication & Security

All write endpoints (`POST`, `PUT`, `DELETE`) and protected read endpoints require a JSON Web Token (JWT) passed in the `Authorization` HTTP header:

```http
Authorization: Bearer <jwt_token>
```

Tokens are obtained by logging in via `POST /api/v1/auth/login` or registering via `POST /api/v1/auth/register`.

---

## 2. Standard Response Format

All JSON responses adhere to the standard SubscriptIQ envelope:

### Single Entity / Action Response
```json
{
  "success": true,
  "message": "Resource created or retrieved successfully",
  "data": { ... }
}
```

### Paginated List Response
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

### Error Response
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

---

## 3. System & Health Endpoints

### `GET /health`
Returns system heartbeat, uptime, server environment, and PostgreSQL connectivity status.
- **Access:** Public
- **Response `200 OK`**:
  ```json
  {
    "success": true,
    "message": "SubscriptIQ API health check",
    "data": {
      "status": "ok",
      "service": "SubscriptIQ API",
      "version": "1.0.0",
      "environment": "development",
      "timestamp": "2026-10-31T05:32:18.849Z",
      "uptime": 120,
      "database": {
        "status": "connected"
      }
    }
  }
  ```

### `GET /api/v1`
Returns API metadata, organization details, and the full endpoint catalog.
- **Access:** Public

---

## 4. User Authentication Module

### `POST /api/v1/auth/register`
Register a new administrator or staff account.
- **Access:** Public
- **Body:**
  ```json
  {
    "email": "user@example.com",
    "password": "Password123!",
    "firstName": "John",
    "lastName": "Doe",
    "role": "STAFF"
  }
  ```
- **Response `201 Created`**: Returns sanitized user object (without password) and JWT token.

### `POST /api/v1/auth/login`
Authenticate existing user.
- **Access:** Public
- **Body:**
  ```json
  {
    "email": "user@example.com",
    "password": "Password123!"
  }
  ```
- **Response `200 OK`**: Returns user profile and JWT token.

### `GET /api/v1/auth/me`
Retrieve currently authenticated user's profile.
- **Access:** Private (`Bearer <token>` required)

---

## 5. Customers Module

### `GET /api/v1/customers`
List customers with pagination and filtering.
- **Access:** Public / Authenticated
- **Query Parameters:**
  - `page` (number, default: `1`)
  - `pageSize` (number, default: `10`, max: `100`)
  - `search` (string, searches `name`, `email`, `companyName`)
  - `status` (enum: `active`, `inactive`, `lead`, `churned`)
- **Response `200 OK`**: Paginated list of customers with `activeSubscriptionsCount`.

### `GET /api/v1/customers/:id`
Retrieve customer by UUID with associated subscriptions and pricing plans.
- **Access:** Public / Authenticated
- **Response `200 OK`** or `404 Not Found`.

### `POST /api/v1/customers`
Create a new customer.
- **Access:** Private (`Bearer <token>` required)
- **Body:**
  ```json
  {
    "name": "Acme Innovations Ltd",
    "email": "billing@acme.com",
    "companyName": "Acme Corp",
    "status": "active",
    "mrr": 499.00,
    "currency": "USD",
    "billingAddress": {
      "line1": "100 Tech Boulevard",
      "city": "Austin",
      "state": "TX",
      "postalCode": "78701",
      "country": "US"
    },
    "taxId": "US-987654321",
    "stripeCustomerId": "cus_12345"
  }
  ```
- **Validation Rules:**
  - `name`: Required non-empty string.
  - `email`: Valid email string (must be unique).
  - `mrr`: Non-negative number (`>= 0`).
  - `currency`: 3-letter ISO code (default: `USD`).
- **Response `201 Created`** or `400 Bad Request` or `409 Conflict`.

### `PUT /api/v1/customers/:id`
Update an existing customer.
- **Access:** Private (`Bearer <token>` required)
- **Body:** Partial `createCustomerSchema` (at least one field).
- **Response `200 OK`** or `404 Not Found`.

### `DELETE /api/v1/customers/:id`
Delete a customer.
- **Access:** Private (`Bearer <token>` required)
- **Business Rule (Requirement 7):** Blocked if customer has active subscriptions (`active`, `trialing`, `past_due`, `paused`). Returns `400 Bad Request`.
- **Response `200 OK`** or `400 Bad Request` or `404 Not Found`.

---

## 6. Products Module

### `GET /api/v1/products`
List products with pagination, search, and child plans.
- **Access:** Public / Authenticated
- **Query Parameters:**
  - `page`, `pageSize`, `search`, `status` (`active`, `archived`, `draft`)
- **Response `200 OK`**: List of products including nested `plans` and `plansCount`.

### `GET /api/v1/products/:id`
Retrieve product details and all active pricing tiers/plans.
- **Access:** Public / Authenticated

### `POST /api/v1/products`
Create a new product.
- **Access:** Private (`Bearer <token>` required)
- **Body:**
  ```json
  {
    "name": "SubscriptIQ Enterprise Analytics",
    "code": "PROD-ANALYTICS",
    "description": "Real-time subscription metrics, MRR forecasting, and churn analysis",
    "status": "active",
    "features": [
      "Custom Dashboard Builder",
      "Cohort Retention Heatmaps",
      "Automated Webhooks"
    ]
  }
  ```
- **Validation Rules:**
  - `name`: Required non-empty string.
  - `code`: Unique code, 2 to 50 uppercase characters.
- **Response `201 Created`** or `409 Conflict`.

### `PUT /api/v1/products/:id`
Update product metadata, status, or feature flags.
- **Access:** Private (`Bearer <token>` required)

### `DELETE /api/v1/products/:id`
Delete a product.
- **Access:** Private (`Bearer <token>` required)
- **Business Rule (Requirement 7):** Blocked if any plan under this product is actively referenced by active subscriptions. Returns `400 Bad Request`.

---

## 7. Plans Module

### `GET /api/v1/plans`
List pricing plans with pagination and filtering.
- **Access:** Public / Authenticated
- **Query Parameters:**
  - `page`, `pageSize`, `search`, `productId`, `interval`, `isActive`
- **Response `200 OK`**: Plans list with parent `product` summary.

### `GET /api/v1/plans/:id`
Retrieve plan details and associated product.
- **Access:** Public / Authenticated

### `POST /api/v1/plans`
Create a new pricing plan under a product.
- **Access:** Private (`Bearer <token>` required)
- **Body:**
  ```json
  {
    "productId": "e1f13b1b-52c6-43b6-b5b6-73130dcf2b17",
    "name": "Enterprise Annual Plan",
    "code": "PLAN-ENT-ANNUAL",
    "description": "Annual recurring billing with 2 months free",
    "amount": 999.00,
    "currency": "USD",
    "interval": "year",
    "intervalCount": 1,
    "pricingModel": "flat_fee",
    "trialPeriodDays": 14,
    "isActive": true
  }
  ```
- **Validation Rules (Requirement 3):**
  - `productId`: Must correspond to an existing product in the database.
  - `code`: Unique uppercase plan code.
  - `amount`: **Price must be a valid non-negative number (`>= 0`)**.
  - `interval`: One of `day`, `week`, `month`, `quarter`, `year`.
  - `intervalCount`: Integer `>= 1`.
  - `pricingModel`: One of `flat_fee`, `per_seat`, `tiered`, `usage_based`.
  - `trialPeriodDays`: Integer `>= 0`.
- **Response `201 Created`** or `400 Bad Request` or `404 Not Found` (if product missing) or `409 Conflict`.

### `PUT /api/v1/plans/:id`
Update an existing pricing plan.
- **Access:** Private (`Bearer <token>` required)
- **Body:** Partial `createPlanSchema`.

### `DELETE /api/v1/plans/:id`
Delete a pricing plan.
- **Access:** Private (`Bearer <token>` required)
- **Business Rule (Requirement 7):** Blocked if this plan is actively referenced by active subscriptions. Returns `400 Bad Request`.

---

## 8. Subscriptions & Lifecycle Module

The Subscription module manages customer recurring subscriptions, calendar billing date calculations, month-end pinning, MRR aggregation, lifecycle state machine enforcement, and duplicate-invoice prevention.

### Lifecycle State Machine & Valid Transitions

| From Status | To `PAUSED` | To `ACTIVE` | To `CANCELLED` | Notes |
| :--- | :---: | :---: | :---: | :--- |
| **`ACTIVE`** | **VALID** | Invalid (Already active) | **VALID** | Halts or cancels recurring billing |
| **`PAUSED`** | Invalid (Already paused) | **VALID** | **VALID** | Resumes or cancels subscription |
| **`CANCELLED`** | **REJECTED (400)** | **REJECTED (400)** | **REJECTED (400)** | **Terminal State:** Cancelled subs cannot be transitioned |

---

### `GET /api/v1/subscriptions`
List subscriptions with pagination, status filtering, and multi-field search.
- **Access:** Public / Authenticated
- **Query Parameters:**
  - `page` (number, default: `1`)
  - `pageSize` (number, default: `10`, max: `100`)
  - `search` (searches customer name, customer email, plan name, plan code)
  - `status` (`ACTIVE`, `PAUSED`, `CANCELLED`)
  - `customerId` (filter by specific customer UUID)
  - `planId` (filter by specific plan UUID)
- **Response `200 OK`**: Paginated list of subscriptions with embedded customer and plan details.

### `GET /api/v1/subscriptions/:id`
Retrieve subscription details by UUID.
- **Access:** Public / Authenticated

### `POST /api/v1/subscriptions`
Create a new subscription referencing an existing customer and active plan.
- **Access:** Private (`Bearer <token>` required)
- **Body:**
  ```json
  {
    "customerId": "8f972b21-4fa3-4cb5-8299-fc91950e3966",
    "planId": "3b29c9a6-5fa7-4581-807e-114d5e8efca3",
    "quantity": 3,
    "startDate": "2026-01-31T00:00:00.000Z",
    "billingInterval": "MONTHLY"
  }
  ```
- **Validation Rules & Automatic Calculations:**
  - `customerId`: Required; must reference an existing customer.
  - `planId`: Required; must reference an active, non-archived plan.
  - `quantity`: Positive integer `>= 1` (default: `1`).
  - `startDate`: ISO 8601 date string (default: current timestamp).
  - `unitAmount`: Automatically set from `plan.amount`.
  - `totalAmount`: Calculated as `plan.amount * quantity`.
  - `mrr`: Calculated based on interval (Yearly: `total / 12`, Monthly: `total`).
  - `nextBillingDate`: Computed with **month-end pinning** (e.g. Jan 31 -> Feb 28 -> Mar 31).
  - `customer.mrr`: Updated automatically in a PostgreSQL transaction.
- **Response `201 Created`** or `400 Bad Request` or `404 Not Found`.

### `PATCH /api/v1/subscriptions/:id/status`
Transition subscription lifecycle status.
- **Access:** Private (`Bearer <token>` required)
- **Body:**
  ```json
  {
    "status": "PAUSED",
    "reason": "Customer requested temporary freeze"
  }
  ```
- **Allowed Transitions:**
  - `ACTIVE` -> `PAUSED`
  - `PAUSED` -> `ACTIVE`
  - `ACTIVE` -> `CANCELLED`
  - `PAUSED` -> `CANCELLED`
- **Enforcements:**
  - Rejects attempts to transition a `CANCELLED` subscription with `400 Bad Request`.
  - Rejects duplicate transitions (e.g. `ACTIVE` -> `ACTIVE`) with `400 Bad Request`.
  - Updates customer's active MRR in a transaction (only `ACTIVE` subscriptions contribute).
- **Response `200 OK`** or `400 Bad Request`.

### `POST /api/v1/subscriptions/:id/renew`
Process a recurring billing renewal for an active subscription.
- **Access:** Private (`Bearer <token>` required)
- **Business Rules:**
  - **Excludes cancelled subscriptions:** Returns `400 Bad Request`.
  - **Excludes paused subscriptions:** Returns `400 Bad Request`.
  - Advances `currentPeriodStart` and `currentPeriodEnd` while strictly preserving the month-end anchor.
  - Increments `billingSequence` and generates an idempotent `lastBillingKey` to prevent duplicate invoices in recurring billing jobs.
- **Response `200 OK`**: Returns updated subscription and `renewalSummary`.

### `GET /api/v1/subscriptions/due/billing`
Retrieve all subscriptions currently due for recurring billing.
- **Access:** Private (`Bearer <token>` required)
- **Query Parameters:**
  - `asOfDate` (optional ISO 8601 date string, default: current time)
  - `limit` (optional integer, default: 100)
- **Business Rules:**
  - Strictly returns only `ACTIVE` subscriptions where `nextBillingDate <= asOfDate`.
  - **CANCELLED and PAUSED subscriptions are 100% excluded.**
- **Response `200 OK`**.

---

## 9. Invoices & Recurring Billing Module

The Invoices module handles automated recurring billing runs, high-precision Decimal financial calculations, line-item snapshots preserving pricing history, and database-enforced duplicate invoice prevention.

### Supported Invoice Statuses
- `DRAFT`: Preliminary invoice draft, not yet finalized or dispatched.
- `UNPAID`: Active outstanding invoice awaiting payment.
- `PARTIALLY_PAID`: Partially paid invoice with remaining `amountDue`.
- `PAID`: Fully settled invoice (`amountDue: 0.00`, `paidAt` recorded).
- `OVERDUE`: Unpaid invoice past its `dueDate`.

---

### `GET /api/v1/invoices`
List invoices with pagination, filtering, and search.
- **Access:** Public / Authenticated
- **Query Parameters:**
  - `page` (number, default: `1`)
  - `pageSize` (number, default: `10`, max: `100`)
  - `status` (`DRAFT`, `UNPAID`, `PARTIALLY_PAID`, `PAID`, `OVERDUE`)
  - `customerId` (filter by customer UUID)
  - `subscriptionId` (filter by subscription UUID)
  - `search` (searches `invoiceNumber`, `customer.name`, `customer.email`)
- **Response `200 OK`**: Paginated list of invoices with embedded customer details and line-item snapshots.

### `GET /api/v1/invoices/:id`
Retrieve detailed invoice by UUID with line-item snapshots and customer information.
- **Access:** Public / Authenticated
- **Response `200 OK`** or `404 Not Found`.

### `POST /api/v1/invoices/generate`
Run automated recurring invoice generation for active subscriptions due for billing.
- **Access:** Private (`Bearer <token>` required)
- **Body:**
  ```json
  {
    "asOfDate": "2026-10-31T00:00:00.000Z",
    "subscriptionId": "optional-subscription-uuid",
    "customerId": "optional-customer-uuid",
    "taxRate": 10.0,
    "dueDateDays": 14
  }
  ```
- **Business & Financial Rules:**
  - **Eligibility:** Strictly selects subscriptions with `status: ACTIVE` and `nextBillingDate <= asOfDate`. **CANCELLED and PAUSED subscriptions are 100% excluded.**
  - **High-Precision Decimal Arithmetic:** Subtotal (`unitAmount * quantity`), tax (`subtotal * (taxRate / 100)`), and total (`subtotal + tax`) are calculated using PostgreSQL `Decimal` types—eliminating floating-point inaccuracies.
  - **Historical Pricing Snapshots:** Each line item captures `planName`, `planCode`, `unitAmount`, `quantity`, and billing period dates at invoice creation time. Future plan price modifications never corrupt historical invoices.
  - **Unique Invoice Numbering:** Formatted as `INV-YYYYMM-{SEQ}-{RANDOM}`.
  - **Duplicate Prevention:**
    - Unique database constraint: `@@unique([subscriptionId, billingPeriodStart, billingPeriodEnd])`
    - Idempotent `billingCycleKey` constraint: `inv_{subscriptionId}_{periodStart}_{periodEnd}`
    - Prevents duplicate invoice creation if the cycle was already billed.
  - **Atomic Transaction:** In a single transaction, the invoice and line items are created and the subscription's billing period is advanced with calendar month-end pinning.
- **Response `201 Created`**:
  ```json
  {
    "success": true,
    "message": "Recurring invoice generation completed: 1 generated, 0 duplicates skipped",
    "data": {
      "generatedCount": 1,
      "skippedCount": 0,
      "totalAmountBilled": "220.00",
      "invoices": [ ... ]
    }
  }
  ```

### `PATCH /api/v1/invoices/:id/status`
Update invoice payment and workflow status.
- **Access:** Private (`Bearer <token>` required)
- **Body:**
  ```json
  {
    "status": "PAID",
    "notes": "Settled via automated ACH transfer"
  }
  ```
- **Settlement Logic:**
  - Transitioning to `PAID`: Automatically sets `amountPaid = total`, `amountDue = 0.00`, and records `paidAt = now()`.
  - Transitioning to `PARTIALLY_PAID`: Accepts `amountPaid`, automatically calculates `amountDue = total - amountPaid`.
  - Transitioning to `UNPAID` / `DRAFT`: Resets `amountPaid = 0.00`, `amountDue = total`, `paidAt = null`.
- **Response `200 OK`** or `404 Not Found`.
