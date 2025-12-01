# Quick Start Guide

## Prerequisites
- Docker Desktop installed and running
- Stripe account (for payment processing)

## Step 1: Clone and Setup

```bash
git clone <repository-url>
cd DemoProject
```

## Step 2: Configure Environment

Create a `.env` file in the root directory:

```bash
# Copy the example (if .env.example exists)
cp .env.example .env

# Or create manually with these values:
STRIPE_SECRET_KEY=sk_test_your_key_here
STRIPE_PUBLIC_KEY=pk_test_your_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_secret_here
```

**Get Stripe Keys:**
1. Go to https://dashboard.stripe.com/test/apikeys
2. Copy your test keys
3. Update `.env` file

## Step 3: Start Services

```bash
docker-compose up -d
```

This will start:
- 5 PostgreSQL databases (one per service)
- RabbitMQ message broker
- 6 backend microservices
- Frontend React app

## Step 4: Wait for Services

Wait 1-2 minutes for all services to start and databases to initialize.

Check service status:
```bash
docker-compose ps
```

View logs:
```bash
docker-compose logs -f
```

## Step 5: Access the Application

- **Frontend**: http://localhost:3000
- **API Gateway**: http://localhost:8080
- **RabbitMQ Management**: http://localhost:15672 (guest/guest)

## Step 6: Test the Application

### Default Login Credentials

**Admin:**
- Email: `admin@grocerystore.com`
- Password: `admin123`

**Customer:**
- Email: `customer1@grocerystore.com`
- Password: `customer123`

### Test Flow

1. Open http://localhost:3000
2. Browse products
3. Add items to cart
4. Login/Register
5. Proceed to checkout
6. Complete payment (use Stripe test card: 4242 4242 4242 4242)

## Troubleshooting

### Services won't start
```bash
# Check logs
docker-compose logs <service-name>

# Restart a specific service
docker-compose restart <service-name>

# Rebuild and restart
docker-compose up -d --build <service-name>
```

### Database connection errors
- Wait longer for databases to initialize
- Check if ports are available
- Verify database credentials

### Frontend not loading
- Check if API Gateway is running: `curl http://localhost:8080/api/catalog/products`
- Verify frontend container: `docker-compose logs frontend`

### Payment issues
- Verify Stripe keys in `.env`
- Use Stripe test mode
- Check payment service logs: `docker-compose logs payment-service`

## Stop Services

```bash
docker-compose down
```

To remove volumes (clean slate):
```bash
docker-compose down -v
```

## Development Mode

### Run Backend Services Locally

```bash
# Terminal 1: Start databases and RabbitMQ
docker-compose up postgres-auth postgres-catalog postgres-cart postgres-order postgres-payment rabbitmq

# Terminal 2: Run auth-service
cd backend/auth-service
mvn spring-boot:run

# Terminal 3: Run catalog-service
cd backend/catalog-service
mvn spring-boot:run

# ... and so on for other services
```

### Run Frontend Locally

```bash
cd frontend
npm install
npm run dev
```

## Next Steps

- Read the full [README.md](README.md) for detailed documentation
- Check [API_DOCUMENTATION.md](API_DOCUMENTATION.md) for API endpoints
- Explore the codebase structure
- Customize for your needs

