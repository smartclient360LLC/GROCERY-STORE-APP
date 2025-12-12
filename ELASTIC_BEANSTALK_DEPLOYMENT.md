# Elastic Beanstalk Deployment Guide

## 🎯 Overview

This guide will help you deploy all 6 backend services to AWS Elastic Beanstalk. Elastic Beanstalk is simpler than ECS and handles scaling, load balancing, and monitoring automatically.

## ✅ Prerequisites Completed

- ✅ AWS CLI installed and configured
- ✅ EB CLI installed (`eb --version`)
- ✅ Docker images built and pushed to ECR (optional - EB can build from source)
- ✅ RDS database created
- ✅ RabbitMQ configured

## 🚀 Deployment Strategy

You have two options:

### Option A: Deploy from Source Code (Recommended for EB)
- EB builds and deploys directly from your Java source code
- Simpler setup
- EB handles the build process

### Option B: Deploy Docker Images from ECR
- Use the Docker images you already built
- Requires Dockerfile configuration in EB

**We'll use Option A (source code deployment) as it's simpler for Java/Spring Boot apps.**

---

## 📋 Step 1: Prepare Each Service for EB

### 1.1 Create `.ebextensions` Directory (Optional)

For each service, you can create configuration files:

```bash
# Example for auth-service
cd backend/auth-service
mkdir -p .ebextensions
```

### 1.2 Create `application.properties` or Use Environment Variables

EB will use environment variables, which we'll set during deployment.

---

## 🚀 Step 2: Deploy Auth Service

### 2.1 Initialize EB

```bash
cd backend/auth-service

# Initialize Elastic Beanstalk
eb init -p java-17 grocerystore-auth --region us-east-2

# When prompted:
# - Select "us-east-2" as region
# - Select "Java 17" platform
# - Use default application name or create new
```

### 2.2 Create Environment

```bash
# Create EB environment
eb create grocerystore-auth-prod \
  --instance-type t3.small \
  --envvars \
    DB_HOST=database-1.cnuq0uuoq8b1.us-east-2.rds.amazonaws.com,\
    DB_PORT=5432,\
    DB_NAME=grocerystore_auth,\
    DB_USER=postgres,\
    DB_PASSWORD=YOUR_RDS_PASSWORD,\
    JWT_SECRET=3dc79832a314f288b203c3bd479a798111e751fec10757725dcba080204195a4,\
    JWT_EXPIRATION=86400000,\
    RABBITMQ_HOST=b-bede77dc-0652-44cb-b9ff-580e384de00b.mq.us-east-2.on.aws,\
    RABBITMQ_PORT=5671,\
    RABBITMQ_USER=admin,\
    RABBITMQ_PASSWORD=YOUR_RABBITMQ_PASSWORD,\
    SERVER_PORT=8081
```

**Note:** Replace `YOUR_RDS_PASSWORD` and `YOUR_RABBITMQ_PASSWORD` with your actual passwords.

### 2.3 Deploy

```bash
# Deploy the service
eb deploy
```

### 2.4 Get the URL

```bash
# Get the environment URL
eb status
# Note the CNAME/URL - you'll need this for the ALB
```

---

## 🚀 Step 3: Deploy Other Services

Repeat the process for each service with appropriate ports and database names:

### Catalog Service

```bash
cd backend/catalog-service
eb init -p java-17 grocerystore-catalog --region us-east-2
eb create grocerystore-catalog-prod \
  --instance-type t3.small \
  --envvars \
    DB_HOST=database-1.cnuq0uuoq8b1.us-east-2.rds.amazonaws.com,\
    DB_PORT=5432,\
    DB_NAME=grocerystore_catalog,\
    DB_USER=postgres,\
    DB_PASSWORD=YOUR_RDS_PASSWORD,\
    JWT_SECRET=3dc79832a314f288b203c3bd479a798111e751fec10757725dcba080204195a4,\
    JWT_EXPIRATION=86400000,\
    RABBITMQ_HOST=b-bede77dc-0652-44cb-b9ff-580e384de00b.mq.us-east-2.on.aws,\
    RABBITMQ_PORT=5671,\
    RABBITMQ_USER=admin,\
    RABBITMQ_PASSWORD=YOUR_RABBITMQ_PASSWORD,\
    SERVER_PORT=8084
eb deploy
```

### Cart Service

```bash
cd backend/cart-service
eb init -p java-17 grocerystore-cart --region us-east-2
eb create grocerystore-cart-prod \
  --instance-type t3.small \
  --envvars \
    DB_HOST=database-1.cnuq0uuoq8b1.us-east-2.rds.amazonaws.com,\
    DB_PORT=5432,\
    DB_NAME=grocerystore_cart,\
    DB_USER=postgres,\
    DB_PASSWORD=YOUR_RDS_PASSWORD,\
    JWT_SECRET=3dc79832a314f288b203c3bd479a798111e751fec10757725dcba080204195a4,\
    JWT_EXPIRATION=86400000,\
    RABBITMQ_HOST=b-bede77dc-0652-44cb-b9ff-580e384de00b.mq.us-east-2.on.aws,\
    RABBITMQ_PORT=5671,\
    RABBITMQ_USER=admin,\
    RABBITMQ_PASSWORD=YOUR_RABBITMQ_PASSWORD,\
    SERVER_PORT=8083
eb deploy
```

### Order Service

```bash
cd backend/order-service
eb init -p java-17 grocerystore-order --region us-east-2
eb create grocerystore-order-prod \
  --instance-type t3.small \
  --envvars \
    DB_HOST=database-1.cnuq0uuoq8b1.us-east-2.rds.amazonaws.com,\
    DB_PORT=5432,\
    DB_NAME=grocerystore_order,\
    DB_USER=postgres,\
    DB_PASSWORD=YOUR_RDS_PASSWORD,\
    JWT_SECRET=3dc79832a314f288b203c3bd479a798111e751fec10757725dcba080204195a4,\
    JWT_EXPIRATION=86400000,\
    RABBITMQ_HOST=b-bede77dc-0652-44cb-b9ff-580e384de00b.mq.us-east-2.on.aws,\
    RABBITMQ_PORT=5671,\
    RABBITMQ_USER=admin,\
    RABBITMQ_PASSWORD=YOUR_RABBITMQ_PASSWORD,\
    SERVER_PORT=8085
eb deploy
```

### Payment Service

```bash
cd backend/payment-service
eb init -p java-17 grocerystore-payment --region us-east-2
eb create grocerystore-payment-prod \
  --instance-type t3.small \
  --envvars \
    DB_HOST=database-1.cnuq0uuoq8b1.us-east-2.rds.amazonaws.com,\
    DB_PORT=5432,\
    DB_NAME=grocerystore_payment,\
    DB_USER=postgres,\
    DB_PASSWORD=YOUR_RDS_PASSWORD,\
    JWT_SECRET=3dc79832a314f288b203c3bd479a798111e751fec10757725dcba080204195a4,\
    JWT_EXPIRATION=86400000,\
    RABBITMQ_HOST=b-bede77dc-0652-44cb-b9ff-580e384de00b.mq.us-east-2.on.aws,\
    RABBITMQ_PORT=5671,\
    RABBITMQ_USER=admin,\
    RABBITMQ_PASSWORD=YOUR_RABBITMQ_PASSWORD,\
    STRIPE_SECRET_KEY=YOUR_STRIPE_SECRET_KEY,\
    STRIPE_PUBLIC_KEY=YOUR_STRIPE_PUBLIC_KEY,\
    STRIPE_WEBHOOK_SECRET=YOUR_STRIPE_WEBHOOK_SECRET,\
    SERVER_PORT=8086
eb deploy
```

### API Gateway

```bash
cd backend/api-gateway
eb init -p java-17 grocerystore-api-gateway --region us-east-2
eb create grocerystore-api-gateway-prod \
  --instance-type t3.small \
  --envvars \
    JWT_SECRET=3dc79832a314f288b203c3bd479a798111e751fec10757725dcba080204195a4,\
    JWT_EXPIRATION=86400000,\
    RABBITMQ_HOST=b-bede77dc-0652-44cb-b9ff-580e384de00b.mq.us-east-2.on.aws,\
    RABBITMQ_PORT=5671,\
    RABBITMQ_USER=admin,\
    RABBITMQ_PASSWORD=YOUR_RABBITMQ_PASSWORD,\
    SERVER_PORT=8087
eb deploy
```

---

## 🔧 Step 4: Configure Load Balancer (Optional)

Each EB environment creates its own load balancer. You can:

1. **Use individual EB URLs** for each service
2. **Create a custom ALB** and point it to EB environments
3. **Use EB's built-in load balancer** (simpler)

### Option: Use EB URLs Directly

Each service will have its own URL:
- `grocerystore-auth-prod.us-east-2.elasticbeanstalk.com`
- `grocerystore-catalog-prod.us-east-2.elasticbeanstalk.com`
- etc.

Update your frontend to use these URLs.

---

## 📝 Step 5: Update Environment Variables Later

If you need to update environment variables:

```bash
cd backend/auth-service
eb setenv DB_HOST=new-value JWT_SECRET=new-secret
eb deploy
```

---

## 🔍 Step 6: Monitor and Manage

### View Logs

```bash
eb logs
```

### Check Status

```bash
eb status
```

### Open in Browser

```bash
eb open
```

### SSH into Instance

```bash
eb ssh
```

---

## ⚙️ Configuration Files

### Create `.ebextensions/01-environment.config`

For each service, you can create configuration files:

```yaml
option_settings:
  aws:elasticbeanstalk:application:environment:
    SERVER_PORT: 8081
  aws:elasticbeanstalk:container:java:staticfiles:
    /public: static
```

---

## 🎯 Quick Deployment Script

Create a script to deploy all services:

```bash
#!/bin/bash
# deploy-all-eb.sh

SERVICES=("auth-service" "catalog-service" "cart-service" "order-service" "payment-service" "api-gateway")
PORTS=(8081 8084 8083 8085 8086 8087)
DB_NAMES=("grocerystore_auth" "grocerystore_catalog" "grocerystore_cart" "grocerystore_order" "grocerystore_payment" "")

for i in "${!SERVICES[@]}"; do
    SERVICE=${SERVICES[$i]}
    PORT=${PORTS[$i]}
    DB_NAME=${DB_NAMES[$i]}
    
    echo "Deploying $SERVICE..."
    cd backend/$SERVICE
    
    # Initialize if not already done
    if [ ! -f ".elasticbeanstalk/config.yml" ]; then
        eb init -p java-17 grocerystore-$SERVICE --region us-east-2
    fi
    
    # Create or update environment
    # (You'll need to set environment variables manually or use eb setenv)
    
    cd ../..
done
```

---

## ✅ Verification

After deploying each service:

1. **Check status:**
   ```bash
   eb status
   ```

2. **Test the endpoint:**
   ```bash
   curl http://your-eb-url.elasticbeanstalk.com/actuator/health
   ```

3. **View logs:**
   ```bash
   eb logs
   ```

---

## 🔄 Update Frontend API URLs

Update your Amplify environment variables to point to EB URLs:

```
VITE_API_BASE_URL=http://grocerystore-api-gateway-prod.us-east-2.elasticbeanstalk.com
```

Or if using individual service URLs, update your API gateway configuration.

---

## 📚 Useful EB Commands

```bash
# List all environments
eb list

# Get environment info
eb status

# View logs
eb logs

# Open in browser
eb open

# SSH into instance
eb ssh

# Deploy new version
eb deploy

# Set environment variables
eb setenv KEY=value

# Terminate environment
eb terminate
```

---

## 🎯 Next Steps

1. Deploy auth-service first (test it works)
2. Deploy other services one by one
3. Update frontend API URLs
4. Test the complete application

---

**Ready to start? Begin with auth-service deployment!**
