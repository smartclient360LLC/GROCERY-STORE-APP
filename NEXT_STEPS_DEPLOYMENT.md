# Next Steps: Backend Deployment Checklist

You've completed: ✅ Database setup

Now let's continue with the backend deployment.

---

## 🎯 Step 1: Set Up RabbitMQ (15-20 minutes)

### Option A: AWS MQ (Managed - Recommended for Production)

1. **Go to AWS MQ Console**
   - URL: https://console.aws.amazon.com/amazon-mq/
   - Make sure you're in **us-east-2** region (same as your RDS)

2. **Create Broker**
   - Click **"Create broker"**
   - Configure:
     ```
     Broker engine: RabbitMQ
     Broker instance type: mq.t3.micro (Free tier eligible)
     Broker name: grocerystore-rabbitmq
     Deployment mode: Single-instance broker
     
     Authentication:
     - Username: admin
     - Password: [Create strong password - SAVE THIS!]
     
     Network:
     - VPC: Default VPC (or same VPC as RDS)
     - Subnet: Default subnet
     - Public accessibility: Yes (for easier setup)
     
     Security:
     - Security group: Create new (grocerystore-mq-sg)
       - Allow inbound: Port 5672 from 0.0.0.0/0 (temporarily)
     ```

3. **Click "Create broker"**
   - Takes 10-15 minutes to create
   - **Note the endpoint:** `b-xxxxx-1.mq.us-east-2.amazonaws.com`
   - **Note the port:** Usually 5671 (SSL) or 5672 (non-SSL)

4. **Save these credentials:**
   - Endpoint: `b-xxxxx-1.mq.us-east-2.amazonaws.com`
   - Port: `5672`
   - Username: `admin`
   - Password: `[Your password]`

### Option B: EC2 Instance (Cheaper for Testing)

If you want to save costs, you can run RabbitMQ on EC2:

1. **Launch EC2 Instance:**
   - AMI: Amazon Linux 2023
   - Instance type: t2.micro (free tier)
   - Same VPC as RDS
   - Security group: Allow port 5672 from 0.0.0.0/0

2. **Install RabbitMQ:**
   ```bash
   sudo yum update -y
   sudo yum install -y rabbitmq-server
   sudo systemctl start rabbitmq-server
   sudo systemctl enable rabbitmq-server
   sudo rabbitmq-plugins enable rabbitmq_management
   ```

3. **Set credentials:**
   ```bash
   sudo rabbitmqctl add_user admin your_password
   sudo rabbitmqctl set_user_tags admin administrator
   sudo rabbitmqctl set_permissions -p / admin ".*" ".*" ".*"
   ```

4. **Note the endpoint:** Use EC2 public IP or private IP

---

## 🐳 Step 2: Create ECR Repositories (5 minutes)

Run these commands in your terminal:

```bash
# Set your region (must match RDS region)
export AWS_REGION=us-east-2

# Get your AWS account ID
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

echo "✅ All ECR repositories created!"
```

**Note:** If you get "repository already exists" errors, that's fine - they're already created.

---

## 🚀 Step 3: Build and Push Docker Images (10-15 minutes)

### Option A: Use the Deployment Script

```bash
cd /Users/sravankumarbodakonda/Documents/SmartClient360/GROCERYSTOREAPP

# Make sure the script is executable
chmod +x deploy.sh

# Update the script to use us-east-2 (if needed)
# Then run:
./deploy.sh
```

### Option B: Manual Build and Push

```bash
# Set variables
export AWS_REGION=us-east-2
export AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)

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
    echo "✅ $SERVICE pushed successfully"
done
```

---

## 📋 Step 4: Create ECS Cluster and Services

### 4.1 Create ECS Cluster

1. **Go to ECS Console**
   - URL: https://console.aws.amazon.com/ecs/
   - Make sure you're in **us-east-2** region

2. **Create Cluster**
   - Click **"Create cluster"**
   - Configure:
     ```
     Cluster name: grocerystore-cluster
     Infrastructure: AWS Fargate (Serverless)
     ```
   - Click **"Create"**

### 4.2 Create Task Definitions

For each service, you'll need to create a task definition with environment variables.

**Important Environment Variables for All Services:**
```
DB_HOST=database-1.cnuq0uuoq8b1.us-east-2.rds.amazonaws.com
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=[Your RDS password]
JWT_SECRET=[Generate a strong secret - same for all services]
JWT_EXPIRATION=86400000
RABBITMQ_HOST=[Your RabbitMQ endpoint]
RABBITMQ_PORT=5672
RABBITMQ_USER=admin
RABBITMQ_PASSWORD=[Your RabbitMQ password]
```

**Service-Specific Database Names:**
- auth-service: `DB_NAME=grocerystore_auth`
- catalog-service: `DB_NAME=grocerystore_catalog`
- cart-service: `DB_NAME=grocerystore_cart`
- order-service: `DB_NAME=grocerystore_order`
- payment-service: `DB_NAME=grocerystore_payment` + Stripe keys

**Payment Service Additional Variables:**
```
STRIPE_SECRET_KEY=[Your Stripe secret key]
STRIPE_PUBLIC_KEY=[Your Stripe public key]
STRIPE_WEBHOOK_SECRET=[Your Stripe webhook secret]
```

See `BACKEND_DEPLOYMENT_GUIDE.md` for detailed task definition steps.

---

## ✅ Quick Reference: Your Current Setup

- **RDS Endpoint:** `database-1.cnuq0uuoq8b1.us-east-2.rds.amazonaws.com`
- **Region:** `us-east-2`
- **Databases Created:** ✅ All 5 databases ready

---

## 🎯 What to Do Next

1. **Set up RabbitMQ** (Step 1 above) - Choose Option A (AWS MQ) or Option B (EC2)
2. **Create ECR repositories** (Step 2) - Run the commands
3. **Build and push images** (Step 3) - Use the script or manual commands
4. **Create ECS cluster and services** (Step 4) - Follow the detailed guide

---

## 💡 Tips

- **Keep all resources in the same region:** us-east-2
- **Save all credentials** in a secure place (password manager)
- **Use the same JWT_SECRET** for all services
- **Test each service** after deployment

---

## 📚 Full Documentation

For complete details, see:
- `BACKEND_DEPLOYMENT_GUIDE.md` - Complete step-by-step guide
- `DEPLOYMENT_STEPS.md` - Alternative deployment methods

Let me know which step you'd like to start with!
