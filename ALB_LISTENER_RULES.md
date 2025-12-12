# Configure ALB Listener Rules - Path-Based Routing

## 🎯 Goal

Configure your Application Load Balancer to route traffic to different services based on URL paths.

## 📋 Prerequisites

- ✅ ALB created
- ✅ Target groups created for each service
- ✅ ECS services running (or will be created)

## 🔧 Step-by-Step: Configure Listener Rules

### Step 1: Open ALB Listener

1. **Go to EC2 Console → Load Balancers**
   - URL: https://console.aws.amazon.com/ec2/v2/home#LoadBalancers:
   - Select your ALB: `grocerystore-alb`

2. **Go to Listeners Tab**
   - Click on the **"Listeners"** tab
   - You should see a listener on port 80 (HTTP)

3. **View/Edit Rules**
   - Click on the listener (port 80)
   - Click **"View/Edit rules"** button

### Step 2: Add Path-Based Rules

You'll configure rules in **priority order** (lower numbers = higher priority):

#### Rule 1: Auth Service
1. Click **"Add rule"** (or edit the default rule)
2. Configure:
   - **Priority:** 1
   - **IF:** `Path is /api/auth/*`
   - **THEN:** Forward to `grocerystore-auth-tg`
   - Click **"Save"**

#### Rule 2: Catalog Service
1. Click **"Add rule"**
2. Configure:
   - **Priority:** 2
   - **IF:** `Path is /api/catalog/*`
   - **THEN:** Forward to `grocerystore-catalog-tg`
   - Click **"Save"**

#### Rule 3: Cart Service
1. Click **"Add rule"**
2. Configure:
   - **Priority:** 3
   - **IF:** `Path is /api/cart/*`
   - **THEN:** Forward to `grocerystore-cart-tg`
   - Click **"Save"**

#### Rule 4: Order Service
1. Click **"Add rule"**
2. Configure:
   - **Priority:** 4
   - **IF:** `Path is /api/order/*`
   - **THEN:** Forward to `grocerystore-order-tg`
   - Click **"Save"**

#### Rule 5: Payment Service
1. Click **"Add rule"**
2. Configure:
   - **Priority:** 5
   - **IF:** `Path is /api/payment/*`
   - **THEN:** Forward to `grocerystore-payment-tg`
   - Click **"Save"**

#### Rule 6: Default (API Gateway)
1. Edit the **default rule** (usually priority 0 or lowest)
2. Configure:
   - **Priority:** 100 (or leave as default)
   - **IF:** (no conditions - this is the default/catch-all)
   - **THEN:** Forward to `grocerystore-api-gateway-tg`
   - Click **"Save"**

## 📊 Complete Rule Configuration

Your listener rules should look like this (in priority order):

| Priority | Condition | Target |
|----------|-----------|--------|
| 1 | Path is `/api/auth/*` | grocerystore-auth-tg |
| 2 | Path is `/api/catalog/*` | grocerystore-catalog-tg |
| 3 | Path is `/api/cart/*` | grocerystore-cart-tg |
| 4 | Path is `/api/order/*` | grocerystore-order-tg |
| 5 | Path is `/api/payment/*` | grocerystore-payment-tg |
| 100 | (default - no condition) | grocerystore-api-gateway-tg |

## 🎯 How It Works

When a request comes to your ALB:

1. **Request:** `http://your-alb-dns/api/auth/login`
   - Matches Rule 1 → Routes to auth-service

2. **Request:** `http://your-alb-dns/api/catalog/products`
   - Matches Rule 2 → Routes to catalog-service

3. **Request:** `http://your-alb-dns/api/cart/items`
   - Matches Rule 3 → Routes to cart-service

4. **Request:** `http://your-alb-dns/anything-else`
   - No match → Routes to api-gateway (default rule)

## ⚙️ Advanced Configuration

### Health Check Settings

Make sure each target group has proper health checks:

- **Health check path:** `/actuator/health` or `/`
- **Health check protocol:** HTTP
- **Health check port:** [Service port]
- **Healthy threshold:** 2
- **Unhealthy threshold:** 2
- **Timeout:** 5 seconds
- **Interval:** 30 seconds

### Path Rewriting (Optional)

If your services expect different paths, you can use path rewriting:

1. In the rule action, click **"Edit"**
2. Enable **"Rewrite"**
3. Set:
   - **Forward to:** Target group
   - **Rewrite path:** `/api/auth` → `/` (removes prefix)

**Note:** Most Spring Boot apps handle `/api/*` paths, so rewriting may not be needed.

## ✅ Verification

After configuring rules:

1. **Test each path:**
   ```bash
   # Test auth service
   curl http://your-alb-dns/api/auth/health
   
   # Test catalog service
   curl http://your-alb-dns/api/catalog/products
   
   # Test default (api-gateway)
   curl http://your-alb-dns/
   ```

2. **Check target group health:**
   - Go to Target Groups
   - Check each target group's "Targets" tab
   - Verify targets are "healthy"

## 🔍 Troubleshooting

### Rule Not Matching
- Check path pattern is correct (case-sensitive)
- Verify priority order (specific paths should have lower priority numbers)
- Check if path rewriting is interfering

### 502 Bad Gateway
- Verify target groups have healthy targets
- Check security groups allow traffic from ALB to targets
- Verify services are running and responding

### 503 Service Unavailable
- Check if target groups have any healthy targets
- Verify health check configuration
- Check ECS tasks are running

## 📝 Quick Reference

**ALB DNS Name:** `grocerystore-alb-xxxxx.us-east-2.elb.amazonaws.com`

**Target Groups:**
- `grocerystore-auth-tg` (Port 8081)
- `grocerystore-catalog-tg` (Port 8084)
- `grocerystore-cart-tg` (Port 8083)
- `grocerystore-order-tg` (Port 8085)
- `grocerystore-payment-tg` (Port 8086)
- `grocerystore-api-gateway-tg` (Port 8087)

---

**After configuring listener rules, your ALB will route traffic correctly to all services!**
