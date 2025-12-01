# Start All Services Guide

## Prerequisites
- ✅ Java 17 installed and configured
- ✅ PostgreSQL running with all databases created
- ✅ All databases: grocerystore_auth, grocerystore_catalog, grocerystore_cart, grocerystore_order, grocerystore_payment

## Quick Start Scripts

I'll create helper scripts for each service. For now, here's how to start them:

## Start Services (One Terminal Per Service)

### Terminal 1 - Catalog Service (Port 8082)
```bash
cd backend/catalog-service
export JAVA_HOME=/opt/homebrew/opt/openjdk@17/libexec/openjdk.jdk/Contents/Home
export PATH="/opt/homebrew/opt/openjdk@17/bin:$PATH"
mvn spring-boot:run
```

### Terminal 2 - Cart Service (Port 8083)
```bash
cd backend/cart-service
export JAVA_HOME=/opt/homebrew/opt/openjdk@17/libexec/openjdk.jdk/Contents/Home
export PATH="/opt/homebrew/opt/openjdk@17/bin:$PATH"
mvn spring-boot:run
```

### Terminal 3 - Order Service (Port 8084)
```bash
cd backend/order-service
export JAVA_HOME=/opt/homebrew/opt/openjdk@17/libexec/openjdk.jdk/Contents/Home
export PATH="/opt/homebrew/opt/openjdk@17/bin:$PATH"
mvn spring-boot:run
```

### Terminal 4 - Payment Service (Port 8085)
```bash
cd backend/payment-service
export JAVA_HOME=/opt/homebrew/opt/openjdk@17/libexec/openjdk.jdk/Contents/Home
export PATH="/opt/homebrew/opt/openjdk@17/bin:$PATH"
mvn spring-boot:run
```

### Terminal 5 - API Gateway (Port 8080)
```bash
cd backend/api-gateway
export JAVA_HOME=/opt/homebrew/opt/openjdk@17/libexec/openjdk.jdk/Contents/Home
export PATH="/opt/homebrew/opt/openjdk@17/bin:$PATH"
mvn spring-boot:run
```

## Service URLs

Once all services are running:
- **Auth Service**: http://localhost:8081
- **Catalog Service**: http://localhost:8082
- **Cart Service**: http://localhost:8083
- **Order Service**: http://localhost:8084
- **Payment Service**: http://localhost:8085
- **API Gateway**: http://localhost:8080 (routes to all services)

## Test Services

```bash
# Test Catalog Service
curl http://localhost:8082/api/catalog/products

# Test API Gateway (routes to catalog)
curl http://localhost:8080/api/catalog/products

# Test Auth Service
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123","firstName":"John","lastName":"Doe"}'
```

## Note About RabbitMQ

The services are configured to use RabbitMQ, but they will start even if RabbitMQ is not running (you'll just see connection warnings). For full functionality, you can:

1. Install RabbitMQ: `brew install rabbitmq`
2. Start it: `brew services start rabbitmq`
3. Or use Docker: `docker run -d -p 5672:5672 -p 15672:15672 rabbitmq:3-management`

## Troubleshooting

- **Port already in use**: Stop the service using that port or change the port in application.yml
- **Database connection error**: Make sure PostgreSQL is running and databases exist
- **Java version error**: Make sure JAVA_HOME is set to Java 17

