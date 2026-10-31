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
