# RabbitMQ Configuration for Backend Services

## ✅ Your RabbitMQ Connection Details

**AMQPS Endpoint (SSL):**
```
amqps://b-bede77dc-0652-44cb-b9ff-580e384de00b.mq.us-east-2.on.aws:5671
```

**For your application configuration, use:**

```
RABBITMQ_HOST=b-bede77dc-0652-44cb-b9ff-580e384de00b.mq.us-east-2.on.aws
RABBITMQ_PORT=5671
RABBITMQ_USER=admin (or your username)
RABBITMQ_PASSWORD=[Your RabbitMQ password]
```

## 🔍 Check for Non-SSL Endpoint (Optional)

You might also have a non-SSL endpoint on port 5672. Check the "Endpoints" tab in AWS MQ Console:
- **AMQP (non-SSL):** Port 5672
- **AMQPS (SSL):** Port 5671 (what you have)

**For simplicity, you can use port 5672 (non-SSL) if available:**
```
RABBITMQ_HOST=b-bede77dc-0652-44cb-b9ff-580e384de00b.mq.us-east-2.on.aws
RABBITMQ_PORT=5672
```

## 📝 Environment Variables for ECS Task Definitions

When creating your ECS task definitions, use these environment variables:

### For All Services (auth, catalog, cart, order, payment):

```
RABBITMQ_HOST=b-bede77dc-0652-44cb-b9ff-580e384de00b.mq.us-east-2.on.aws
RABBITMQ_PORT=5671
RABBITMQ_USER=admin
RABBITMQ_PASSWORD=[Your RabbitMQ password]
```

### Complete Environment Variables Template

**For auth-service, catalog-service, cart-service, order-service:**
```
DB_HOST=database-1.cnuq0uuoq8b1.us-east-2.rds.amazonaws.com
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=[Your RDS password]
JWT_SECRET=[Generate a strong secret - same for all services]
JWT_EXPIRATION=86400000
RABBITMQ_HOST=b-bede77dc-0652-44cb-b9ff-580e384de00b.mq.us-east-2.on.aws
RABBITMQ_PORT=5671
RABBITMQ_USER=admin
RABBITMQ_PASSWORD=[Your RabbitMQ password]
```

**Service-specific DB_NAME:**
- auth-service: `DB_NAME=grocerystore_auth`
- catalog-service: `DB_NAME=grocerystore_catalog`
- cart-service: `DB_NAME=grocerystore_cart`
- order-service: `DB_NAME=grocerystore_order`

**For payment-service (add Stripe keys):**
```
[All above variables] +
DB_NAME=grocerystore_payment
STRIPE_SECRET_KEY=[Your Stripe secret key]
STRIPE_PUBLIC_KEY=[Your Stripe public key]
STRIPE_WEBHOOK_SECRET=[Your Stripe webhook secret]
```

**For api-gateway (no database):**
```
JWT_SECRET=[Same as other services]
JWT_EXPIRATION=86400000
RABBITMQ_HOST=b-bede77dc-0652-44cb-b9ff-580e384de00b.mq.us-east-2.on.aws
RABBITMQ_PORT=5671
RABBITMQ_USER=admin
RABBITMQ_PASSWORD=[Your RabbitMQ password]
```

## 🔒 SSL vs Non-SSL

- **Port 5671 (AMQPS):** SSL encrypted - more secure, recommended for production
- **Port 5672 (AMQP):** Non-SSL - simpler, works for testing

Your Spring Boot application should handle both. Check your `application.yml` files - they should already be configured to use these environment variables.

## ✅ Next Steps

1. **Save these credentials securely**
2. **Proceed with ECR repository creation**
3. **Build and push Docker images**
4. **Create ECS task definitions** with these environment variables
5. **Deploy services**

---

## 🎯 Quick Reference

**RDS Endpoint:**
```
database-1.cnuq0uuoq8b1.us-east-2.rds.amazonaws.com
```

**RabbitMQ Endpoint:**
```
b-bede77dc-0652-44cb-b9ff-580e384de00b.mq.us-east-2.on.aws
Port: 5671 (SSL) or 5672 (non-SSL)
```

**Region:** us-east-2
