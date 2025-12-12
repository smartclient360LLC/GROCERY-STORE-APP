# Backend Deployment Guide - Step by Step

This guide will help you deploy all 6 backend services to AWS.

## 📋 Prerequisites

1. **AWS Account** with appropriate permissions
2. **AWS CLI** installed and configured: `aws configure`
3. **Docker** installed and running
4. **PostgreSQL database** (RDS or local for testing)
5. **RabbitMQ** (AWS MQ, EC2, or local for testing)

---

## 🎯 Quick Overview

Your backend consists of 6 services:
- **auth-service** (Port 8081)
- **catalog-service** (Port 8084)
- **cart-service** (Port 8083)
- **order-service** (Port 8085)
- **payment-service** (Port 8086)
- **api-gateway** (Port 8087) - Main entry point

---

## 🚀 Option 1: AWS ECS Fargate (Recommended - Scalable)

### Step 1: Set Up AWS Resources

#### 1.1 Create RDS PostgreSQL Database

1. Go to [AWS RDS Console](https://console.aws.amazon.com/rds/)
2. Click **"Create database"**
3. Configure:
   ```
   Engine: PostgreSQL
   Version: 15.x
   Template: Free tier (or Production)
   DB instance identifier: grocerystore-db
   Master username: postgres
   Master password: [Create strong password - SAVE THIS!]
   DB instance class: db.t3.micro (Free tier)
   Storage: 20 GB
   Public access: Yes (for easier setup)
   ```
4. Click **"Create database"** (takes 5-10 minutes)
5. **Note the endpoint:** `grocerystore-db.xxxxx.us-east-1.rds.amazonaws.com`

6. **Create separate databases:**

   You need to connect to your RDS PostgreSQL instance to create the databases. Here are 3 options:

   **Option A: Using AWS CloudShell (Easiest - No setup required)**
   
   1. Go to [AWS CloudShell](https://console.aws.amazon.com/cloudshell/)
   2. Click "Open CloudShell" (top right)
   3. Install PostgreSQL client:
      ```bash
      sudo yum install -y postgresql15
      ```
   4. Connect to your RDS instance:
      ```bash
      psql -h YOUR_RDS_ENDPOINT -U postgres -d postgres
      # Example: psql -h grocerystore-db.xxxxx.us-east-1.rds.amazonaws.com -U postgres -d postgres
      ```
   5. Enter your RDS master password when prompted
   6. Run the SQL commands:
      ```sql
      CREATE DATABASE grocerystore_auth;
      CREATE DATABASE grocerystore_catalog;
      CREATE DATABASE grocerystore_cart;
      CREATE DATABASE grocerystore_order;
      CREATE DATABASE grocerystore_payment;
      ```
   7. Verify databases were created:
      ```sql
      \l
      ```
   8. Exit: `\q`

   **Option B: Using Your Local Machine (If PostgreSQL is installed)**
   
   1. Make sure your RDS security group allows connections from your IP
   2. Connect from your terminal:
      ```bash
      psql -h YOUR_RDS_ENDPOINT -U postgres -d postgres
      # Example: psql -h grocerystore-db.xxxxx.us-east-1.rds.amazonaws.com -U postgres -d postgres
      ```
   3. Enter your RDS password
   4. Run the CREATE DATABASE commands (same as above)

   **Option C: Using AWS RDS Query Editor (No command line needed)**
   
   1. Go to [RDS Console](https://console.aws.amazon.com/rds/)
   2. Select your database instance
   3. Click "Query Editor" (or "Connectivity & security" → "Query Editor")
   4. Enter your master username and password
   5. Click "Connect to database"
   6. In the query editor, paste and run:
      ```sql
      CREATE DATABASE grocerystore_auth;
      CREATE DATABASE grocerystore_catalog;
      CREATE DATABASE grocerystore_cart;
      CREATE DATABASE grocerystore_order;
      CREATE DATABASE grocerystore_payment;
      ```
   7. Verify by running: `SELECT datname FROM pg_database;`

   **Important Notes:**
   - Replace `YOUR_RDS_ENDPOINT` with your actual RDS endpoint from step 5
   - Make sure your RDS security group allows inbound connections on port 5432 from your IP (for local) or from CloudShell/EC2
   - The default database `postgres` is used to connect, then you create the new databases

#### 1.2 Set Up RabbitMQ

**Option A: AWS MQ (Managed - Easier)**
1. Go to [AWS MQ Console](https://console.aws.amazon.com/amazon-mq/)
2. Click **"Create broker"**
3. Configure:
   ```
   Broker engine: RabbitMQ
   Broker instance type: mq.t3.micro (Free tier)
   Broker name: grocerystore-rabbitmq
   Username: admin
   Password: [Create strong password - SAVE THIS!]
   Public accessibility: Yes
   ```
4. Click **"Create broker"** (takes 10-15 minutes)
5. **Note the endpoint:** `b-xxxxx-1.mq.us-east-1.amazonaws.com`

**Option B: EC2 Instance (Cheaper)**
- Launch EC2 t2.micro instance
- Install RabbitMQ: `sudo apt-get install rabbitmq-server`
- Configure security groups to allow port 5672

---

### Step 2: Create ECR Repositories

```bash
# Set your region
export AWS_REGION=us-east-1
export AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)

echo "AWS Account ID: $AWS_ACCOUNT_ID"
echo "AWS Region: $AWS_REGION"

# Create ECR repositories for each service
aws ecr create-repository --repository-name grocerystore-auth-service --region $AWS_REGION
aws ecr create-repository --repository-name grocerystore-catalog-service --region $AWS_REGION
aws ecr create-repository --repository-name grocerystore-cart-service --region $AWS_REGION
aws ecr create-repository --repository-name grocerystore-order-service --region $AWS_REGION
aws ecr create-repository --repository-name grocerystore-payment-service --region $AWS_REGION
aws ecr create-repository --repository-name grocerystore-api-gateway --region $AWS_REGION
```

---

### Step 3: Build and Push Docker Images

**Option A: Use the provided script**

```bash
cd /Users/sravankumarbodakonda/Documents/SmartClient360/GROCERYSTOREAPP

# Make script executable
chmod +x deploy.sh

# Run the deployment script
./deploy.sh
```

**Option B: Manual build and push**

```bash
# Login to ECR
aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com

# Build and push each service
SERVICES=("auth-service" "catalog-service" "cart-service" "order-service" "payment-service" "api-gateway")

for SERVICE in "${SERVICES[@]}"; do
    echo "Building $SERVICE..."
    cd backend/$SERVICE
    docker build -t grocerystore-$SERVICE .
    docker tag grocerystore-$SERVICE:latest $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/grocerystore-$SERVICE:latest
    docker push $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/grocerystore-$SERVICE:latest
    cd ../..
    echo "✓ $SERVICE pushed successfully"
done
```

---

### Step 4: Create ECS Cluster

1. Go to [ECS Console](https://console.aws.amazon.com/ecs/)
2. Click **"Create cluster"**
3. Configure:
   ```
   Cluster name: grocerystore-cluster
   Infrastructure: AWS Fargate (Serverless)
   ```
4. Click **"Create"**

---

### Step 5: Create Task Definitions

For each service, create a task definition:

1. Go to **ECS → Task Definitions → Create new task definition**
2. Configure for **auth-service**:
   ```
   Task definition family: grocerystore-auth-service
   Launch type: Fargate
   Operating system: Linux/X86_64
   Task size:
   - CPU: 0.25 vCPU (256)
   - Memory: 0.5 GB (512)
   
   Container:
   - Container name: auth-service
   - Image URI: [Your ECR URI: ACCOUNT_ID.dkr.ecr.REGION.amazonaws.com/grocerystore-auth-service:latest]
   - Port mappings: 8081:8081
   - Environment variables (add all):
     DB_HOST=[Your RDS endpoint]
     DB_PORT=5432
     DB_NAME=grocerystore_auth
     DB_USER=postgres
     DB_PASSWORD=[Your RDS password]
     JWT_SECRET=[Generate a strong secret - same for all services]
     JWT_EXPIRATION=86400000
     RABBITMQ_HOST=[Your RabbitMQ endpoint]
     RABBITMQ_PORT=5672
     RABBITMQ_USER=admin
     RABBITMQ_PASSWORD=[Your RabbitMQ password]
   ```

3. **Repeat for other services** with these ports and DB names:
   - **catalog-service**: Port 8084, DB: `grocerystore_catalog`
   - **cart-service**: Port 8083, DB: `grocerystore_cart`
   - **order-service**: Port 8085, DB: `grocerystore_order`
   - **payment-service**: Port 8086, DB: `grocerystore_payment`
     - Also add: `STRIPE_SECRET_KEY`, `STRIPE_PUBLIC_KEY`, `STRIPE_WEBHOOK_SECRET`
   - **api-gateway**: Port 8087, DB: (none - it's just a gateway)

**Important:** Use the **same JWT_SECRET** for all services!

---

### Step 6: Create ECS Services

For each service:

1. Go to your cluster → **Services tab → Create**
2. Configure:
   ```
   Launch type: Fargate
   Task definition: [Select your task definition]
   Service name: [service-name]-service
   Number of tasks: 1
   VPC: Default VPC
   Subnets: Select all available subnets
   Security group: Create new
     - Allow inbound: Port [service-port] from 0.0.0.0/0
   Auto-assign public IP: Enabled
   ```
3. Click **"Create"**

---

### Step 7: Create Application Load Balancer (ALB)

1. Go to [EC2 Console → Load Balancers](https://console.aws.amazon.com/ec2/v2/home#LoadBalancers:)
2. Click **"Create Load Balancer"**
3. Select **"Application Load Balancer"**
4. Configure:
   ```
   Name: grocerystore-alb
   Scheme: Internet-facing
   IP address type: IPv4
   VPC: Default VPC
   Availability Zones: Select all
   
   Security group: Create new
     - Allow HTTP (80) from 0.0.0.0/0
     - Allow HTTPS (443) from 0.0.0.0/0
   
   Listeners:
   - HTTP:80 → Forward to target group
   ```
5. **Create target groups** for each service:
   - Go to **Target Groups → Create target group**
   - Type: **IP addresses**
   - Target group name: `grocerystore-auth-tg`
   - Protocol: HTTP, Port: 8081
   - VPC: Default VPC
   - Health check path: `/actuator/health` or `/`
   - Register targets: Select your ECS tasks
   - Repeat for all services

6. **Configure ALB listeners** to route to target groups:
   - `/api/auth/*` → auth-service target group
   - `/api/catalog/*` → catalog-service target group
   - `/api/cart/*` → cart-service target group
   - `/api/order/*` → order-service target group
   - `/api/payment/*` → payment-service target group
   - Default → api-gateway target group

7. **Note the ALB DNS name:** `grocerystore-alb-xxxxx.us-east-1.elb.amazonaws.com`

---

### Step 8: Update Frontend API URL

1. Go to [AWS Amplify Console](https://console.aws.amazon.com/amplify/)
2. Select your app → **App settings → Environment variables**
3. Update `VITE_API_BASE_URL` to: `http://your-alb-dns-name.elb.amazonaws.com`
4. **Redeploy** the frontend

---

## 🚀 Option 2: AWS Elastic Beanstalk (Simpler - Less Scalable)

### For Each Service:

```bash
# Install EB CLI
pip install awsebcli

# Navigate to service directory
cd backend/auth-service

# Initialize Elastic Beanstalk
eb init -p java-17 grocerystore-auth --region us-east-1

# Create environment
eb create grocerystore-auth-prod

# Set environment variables
eb setenv \
  DB_HOST=your-rds-endpoint \
  DB_PORT=5432 \
  DB_NAME=grocerystore_auth \
  DB_USER=postgres \
  DB_PASSWORD=your-password \
  JWT_SECRET=your-jwt-secret \
  JWT_EXPIRATION=86400000 \
  RABBITMQ_HOST=your-rabbitmq-endpoint \
  RABBITMQ_PORT=5672 \
  RABBITMQ_USER=admin \
  RABBITMQ_PASSWORD=your-rabbitmq-password

# Deploy
eb deploy

# Get the URL
eb status
```

**Repeat for all 6 services.**

---

## 🔧 Environment Variables Reference

### Common Variables (All Services):
```
DB_HOST=[RDS endpoint]
DB_PORT=5432
DB_NAME=[service-specific database]
DB_USER=postgres
DB_PASSWORD=[RDS password]
JWT_SECRET=[Same secret for all services - min 32 characters]
JWT_EXPIRATION=86400000
RABBITMQ_HOST=[RabbitMQ endpoint]
RABBITMQ_PORT=5672
RABBITMQ_USER=admin
RABBITMQ_PASSWORD=[RabbitMQ password]
```

### Payment Service Additional:
```
STRIPE_SECRET_KEY=[Your Stripe secret key]
STRIPE_PUBLIC_KEY=[Your Stripe public key]
STRIPE_WEBHOOK_SECRET=[Your Stripe webhook secret]
```

---

## ✅ Verification Steps

1. **Check ECS Services:**
   - Go to ECS Console → Your cluster → Services
   - All services should show "Running" status

2. **Test API Gateway:**
   ```bash
   curl http://your-alb-dns-name.elb.amazonaws.com/api/catalog/products
   ```

3. **Check Logs:**
   - ECS → Your cluster → Tasks → Select task → Logs tab
   - Look for any errors

4. **Test Frontend:**
   - Visit your Amplify URL
   - Try logging in, browsing products, adding to cart

---

## 🐛 Troubleshooting

### Service won't start
- Check ECS task logs for errors
- Verify environment variables are set correctly
- Check security groups allow traffic on service port
- Verify RDS and RabbitMQ are accessible from ECS tasks

### Database connection errors
- Verify RDS security group allows connections from ECS security group
- Check database name, username, password are correct
- Ensure databases are created in RDS

### RabbitMQ connection errors
- Verify RabbitMQ security group allows port 5672 from ECS
- Check RabbitMQ endpoint and credentials

### CORS errors
- Update CORS configuration in backend services to include Amplify domain
- Restart services after CORS changes

---

## 📝 Next Steps

1. ✅ Set up HTTPS/SSL certificate for ALB
2. ✅ Configure custom domain
3. ✅ Set up CloudWatch alarms for monitoring
4. ✅ Configure auto-scaling for services
5. ✅ Set up CI/CD pipeline for automatic deployments

---

## 🆘 Need Help?

- Check AWS CloudWatch Logs for detailed error messages
- Review ECS task definition and service configuration
- Verify all environment variables are set correctly
- Check security group rules allow necessary traffic
