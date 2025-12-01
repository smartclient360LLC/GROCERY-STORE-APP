# How to Run the Grocery Store Application

## Prerequisites

- **Docker Desktop** installed and running
- **Docker Compose** (comes with Docker Desktop)
- **Stripe Account** (optional, for payment testing)

## Method 1: Run Everything with Docker Compose (Recommended)

This is the easiest way to run the entire application.

### Step 1: Navigate to Project Directory

```bash
cd /Users/sravankumarbodakonda/Documents/SmartClient360/DemoProject
```

### Step 2: (Optional) Set Up Environment Variables

For Stripe payments, create a `.env` file:

```bash
# Create .env file
cat > .env << EOF
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here
STRIPE_PUBLIC_KEY=pk_test_your_stripe_public_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
EOF
```

**Note:** If you don't have Stripe keys yet, you can still run the app. Payments won't work, but everything else will.

### Step 3: Start All Services

```bash
docker-compose up -d
```

This will start:
- 5 PostgreSQL databases
- RabbitMQ message broker
- 6 backend microservices
- Frontend React app

### Step 4: Wait for Services to Start

Wait 1-2 minutes for all services to initialize. Check status:

```bash
docker-compose ps
```

All services should show "Up" status.

### Step 5: Access the Application

- **Frontend (Main App)**: http://localhost:3000
- **API Gateway**: http://localhost:8080
- **RabbitMQ Management**: http://localhost:15672 (username: `guest`, password: `guest`)

### Step 6: Test the Application

**Default Login Credentials:**

1. **Admin User:**
   - Email: `admin@grocerystore.com`
   - Password: `admin123`

2. **Customer User:**
   - Email: `customer1@grocerystore.com`
   - Password: `customer123`

**Test Flow:**
1. Open http://localhost:3000
2. Browse products
3. Add items to cart
4. Login or Register
5. Proceed to checkout
6. Complete payment (use Stripe test card: `4242 4242 4242 4242`)

## Method 2: Run Services Individually (Local Development)

### Prerequisites for Local Development

- Java 17+
- Maven 3.9+
- Node.js 18+
- PostgreSQL (or use Docker for databases only)

### Step 1: Start Databases and RabbitMQ Only

```bash
docker-compose up -d postgres-auth postgres-catalog postgres-cart postgres-order postgres-payment rabbitmq
```

### Step 2: Run Backend Services

Open separate terminal windows for each service:

**Terminal 1 - Auth Service:**
```bash
cd backend/auth-service
mvn spring-boot:run
```

**Terminal 2 - Catalog Service:**
```bash
cd backend/catalog-service
mvn spring-boot:run
```

**Terminal 3 - Cart Service:**
```bash
cd backend/cart-service
mvn spring-boot:run
```

**Terminal 4 - Order Service:**
```bash
cd backend/order-service
mvn spring-boot:run
```

**Terminal 5 - Payment Service:**
```bash
cd backend/payment-service
mvn spring-boot:run
```

**Terminal 6 - API Gateway:**
```bash
cd backend/api-gateway
mvn spring-boot:run
```

### Step 3: Run Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend will be available at http://localhost:3000 (or 5173 if Vite uses default port).

## Useful Commands

### View Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f auth-service
docker-compose logs -f frontend
```

### Stop Services

```bash
# Stop all services
docker-compose down

# Stop and remove volumes (clean slate)
docker-compose down -v
```

### Restart a Service

```bash
docker-compose restart auth-service
```

### Rebuild After Code Changes

```bash
# Rebuild specific service
docker-compose up -d --build auth-service

# Rebuild all services
docker-compose up -d --build
```

### Check Service Health

```bash
# Check if API Gateway is responding
curl http://localhost:8080/api/catalog/products

# Check if auth service is up
curl http://localhost:8081/api/auth/validate
```

## Troubleshooting

### Services Won't Start

```bash
# Check what's wrong
docker-compose logs <service-name>

# Check if ports are in use
lsof -i :8080
lsof -i :3000
```

### Database Connection Errors

- Wait longer (databases need time to initialize)
- Check database logs: `docker-compose logs postgres-auth`
- Verify credentials in `docker-compose.yml`

### Frontend Not Loading

1. Check if API Gateway is running:
   ```bash
   curl http://localhost:8080/api/catalog/products
   ```

2. Check frontend logs:
   ```bash
   docker-compose logs frontend
   ```

3. Check browser console for errors

### Payment Issues

1. Verify Stripe keys in `.env` file
2. Use Stripe test mode keys
3. Check payment service logs:
   ```bash
   docker-compose logs payment-service
   ```

### Port Already in Use

If a port is already in use, you can:
1. Stop the service using that port
2. Or modify port mappings in `docker-compose.yml`

## Quick Verification

After starting, verify everything is working:

```bash
# 1. Check all containers are running
docker-compose ps

# 2. Test API Gateway
curl http://localhost:8080/api/catalog/products

# 3. Test Auth Service
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"customer1@grocerystore.com","password":"customer123"}'

# 4. Open frontend in browser
open http://localhost:3000
```

## Next Steps

- Read `README.md` for detailed documentation
- Check `API_DOCUMENTATION.md` for API endpoints
- See `QUICK_START.md` for more setup details

