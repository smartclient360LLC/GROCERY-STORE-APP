# Fix ALB Default Action - Path-Based Routing

## 🔍 Current Issue

Your ALB default action is forwarding to all 5 target groups with equal weights (20% each). This is **not** what we want. We need **path-based routing** instead.

## ✅ Solution: Configure Path-Based Rules

### Step 1: Fix the Default Action

1. **In the "Edit listener" page:**
   - Under "Default action", you should see all 5 target groups
   - **Remove all target groups** from the default action:
     - Click the "X" next to each target group to remove them
   - **Add only the API Gateway target group:**
     - Click "Add target group"
     - Select `grocerystore-api-gateway-tg`
     - Set weight to 1 (or leave default)
   - Click **"Save changes"**

   **Result:** Default action should forward to `grocerystore-api-gateway-tg` only

### Step 2: Add Path-Based Rules

After fixing the default action, add rules for each service:

1. **In the listener rules section** (below the default action):
   - Click **"Add rule"** or **"Insert rule"**

2. **Add Rule 1 - Auth Service:**
   - **Priority:** 1
   - **IF:** Click "Add condition" → Select "Path" → Enter `/api/auth/*`
   - **THEN:** Click "Add action" → Select "Forward to" → Choose `grocerystore-auth-tg`
   - Click **"Save"**

3. **Add Rule 2 - Catalog Service:**
   - **Priority:** 2
   - **IF:** Path is `/api/catalog/*`
   - **THEN:** Forward to `grocerystore-catalog-tg`
   - Click **"Save"**

4. **Add Rule 3 - Cart Service:**
   - **Priority:** 3
   - **IF:** Path is `/api/cart/*`
   - **THEN:** Forward to `grocerystore-cart-tg`
   - Click **"Save"**

5. **Add Rule 4 - Order Service:**
   - **Priority:** 4
   - **IF:** Path is `/api/order/*`
   - **THEN:** Forward to `grocerystore-order-tg`
   - Click **"Save"**

6. **Add Rule 5 - Payment Service:**
   - **Priority:** 5
   - **IF:** Path is `/api/payment/*`
   - **THEN:** Forward to `grocerystore-payment-tg`
   - Click **"Save"**

## 📊 Final Configuration

After configuration, your listener should have:

**Rules (in priority order):**
1. Priority 1: Path `/api/auth/*` → `grocerystore-auth-tg`
2. Priority 2: Path `/api/catalog/*` → `grocerystore-catalog-tg`
3. Priority 3: Path `/api/cart/*` → `grocerystore-cart-tg`
4. Priority 4: Path `/api/order/*` → `grocerystore-order-tg`
5. Priority 5: Path `/api/payment/*` → `grocerystore-payment-tg`

**Default Action:**
- Forward to `grocerystore-api-gateway-tg` (only this one, no weights)

## 🎯 How It Works

- Request to `/api/auth/login` → Matches Rule 1 → Routes to auth-service
- Request to `/api/catalog/products` → Matches Rule 2 → Routes to catalog-service
- Request to `/api/cart/items` → Matches Rule 3 → Routes to cart-service
- Request to `/api/order/create` → Matches Rule 4 → Routes to order-service
- Request to `/api/payment/create` → Matches Rule 5 → Routes to payment-service
- Request to `/` or any other path → No match → Default action → Routes to api-gateway

## ⚠️ Important Notes

1. **Remove weighted distribution:** The current 20% each configuration will send traffic randomly to all services, which is wrong
2. **Path-based routing:** Each service should only receive traffic for its specific path
3. **Default to API Gateway:** All other traffic should go to the API Gateway

## 🔧 Quick Fix Steps

1. **Remove all target groups from default action** (except api-gateway)
2. **Add api-gateway target group** to default action
3. **Add path-based rules** for each service
4. **Save changes**

---

**After this configuration, your ALB will route traffic correctly based on URL paths!**
