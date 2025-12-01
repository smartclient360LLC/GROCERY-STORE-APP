# Grocery Store Ordering Application

A complete full-stack grocery store ordering application built with React frontend and Java Spring Boot microservices backend.

## Architecture

### Frontend
- **React** with Vite
- **React Router** for navigation
- **React Context** for state management
- **Stripe** for payment processing
- Responsive design with modern UI

### Backend Microservices
- **auth-service** (Port 8081): User authentication and authorization with JWT
- **catalog-service** (Port 8082): Product and category management
- **cart-service** (Port 8083): Shopping cart operations
- **order-service** (Port 8084): Order management and history
- **payment-service** (Port 8085): Stripe payment processing
- **api-gateway** (Port 8080): Spring Cloud Gateway for routing

### Infrastructure
- **PostgreSQL**: Separate database per service
- **RabbitMQ**: Message broker for async communication
- **Docker & Docker Compose**: Containerization and orchestration
- **Flyway**: Database migrations

## Prerequisites

- Docker and Docker Compose
- Java 17+ (for local development)
- Node.js 18+ (for local frontend development)
- Maven 3.9+ (for local backend development)
- Stripe account (for payment processing)

## Quick Start with Docker

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd DemoProject
   ```

2. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env and add your Stripe keys
   ```

3. **Start all services**
   ```bash
   docker-compose up -d
   ```

4. **Access the application**
   - Frontend: http://localhost:3000
   - API Gateway: http://localhost:8080
   - RabbitMQ Management: http://localhost:15672 (guest/guest)

## Local Development

### Backend Services

Each service can be run independently:

```bash
cd backend/auth-service
mvn spring-boot:run
```

Or build and run with Docker:
```bash
docker-compose up auth-service
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

The frontend will be available at http://localhost:3000 (or 5173 if using Vite default).

## API Endpoints

### Authentication Service
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/validate` - Validate token

### Catalog Service
- `GET /api/catalog/products` - Get all products
- `GET /api/catalog/products/{id}` - Get product by ID
- `GET /api/catalog/products/category/{categoryId}` - Get products by category
- `GET /api/catalog/categories` - Get all categories
- `POST /api/catalog/products` - Create product (Admin)
- `PUT /api/catalog/products/{id}` - Update product (Admin)

### Cart Service
- `GET /api/cart/{userId}` - Get user's cart
- `POST /api/cart/{userId}/items` - Add item to cart
- `PUT /api/catalog/{userId}/items/{itemId}` - Update item quantity
- `DELETE /api/cart/{userId}/items/{itemId}` - Remove item from cart
- `DELETE /api/cart/{userId}` - Clear cart

### Order Service
- `POST /api/orders` - Create order
- `GET /api/orders/{id}` - Get order by ID
- `GET /api/orders/number/{orderNumber}` - Get order by order number
- `GET /api/orders/user/{userId}` - Get user's orders
- `PUT /api/orders/{id}/status` - Update order status (Admin)

### Payment Service
- `POST /api/payments/create-intent` - Create Stripe payment intent
- `POST /api/payments/webhook` - Stripe webhook endpoint
- `GET /api/payments/order/{orderNumber}` - Get payment by order number

## Database Schema

Each service has its own PostgreSQL database with the following schemas:

### Auth Service
- `users` - User accounts with roles (CUSTOMER, ADMIN)

### Catalog Service
- `categories` - Product categories
- `products` - Product catalog with inventory

### Cart Service
- `cart_items` - Shopping cart items

### Order Service
- `orders` - Order records
- `order_items` - Order line items

### Payment Service
- `payments` - Payment records linked to orders

## Sample Data

The application includes seed data:
- Default admin user: `admin@grocerystore.com` / `admin123`
- Sample customer users: `customer1@grocerystore.com` / `customer123`
- Product categories and sample products

## Stripe Integration

1. Create a Stripe account at https://stripe.com
2. Get your API keys from the Stripe Dashboard
3. Update `.env` file with your keys:
   ```
   STRIPE_SECRET_KEY=sk_test_...
   STRIPE_PUBLIC_KEY=pk_test_...
   STRIPE_WEBHOOK_SECRET=whsec_...
   ```
4. For webhook testing, use Stripe CLI:
   ```bash
   stripe listen --forward-to localhost:8080/api/payments/webhook
   ```

## Testing

### Unit Tests
```bash
cd backend/auth-service
mvn test
```

### Integration Tests
Run integration tests for each service:
```bash
mvn verify
```

## CI/CD

GitHub Actions workflow is configured in `.github/workflows/ci.yml` to:
- Build all services
- Run tests
- Build Docker images

## Project Structure

```
DemoProject/
├── backend/
│   ├── auth-service/
│   ├── catalog-service/
│   ├── cart-service/
│   ├── order-service/
│   ├── payment-service/
│   └── api-gateway/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   └── context/
│   └── package.json
├── docker-compose.yml
├── .env.example
└── README.md
```

## Features

- ✅ User authentication and authorization (JWT)
- ✅ Product catalog with categories
- ✅ Shopping cart management
- ✅ Order creation and history
- ✅ Stripe payment integration
- ✅ Admin dashboard
- ✅ Responsive UI
- ✅ Docker containerization
- ✅ Database migrations (Flyway)
- ✅ Message queue (RabbitMQ)

## Troubleshooting

### Services not starting
- Check Docker logs: `docker-compose logs <service-name>`
- Verify database connections
- Ensure ports are not already in use

### Database connection errors
- Wait for databases to fully initialize
- Check database credentials in `.env`
- Verify network connectivity between services

### Payment issues
- Verify Stripe keys are correct
- Check webhook endpoint is accessible
- Use Stripe test mode for development

## License

This project is for demonstration purposes.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

# GROCERY-STORE-APP
