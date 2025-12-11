# Complete Deployment Guide - GitHub, AWS Amplify & AWS Backend

This guide will help you deploy your grocery store application to production with a custom domain.

## 📋 Prerequisites

1. **GitHub Account** - https://github.com
2. **AWS Account** - https://aws.amazon.com
3. **Domain Name** (optional but recommended) - from Route 53, GoDaddy, Namecheap, etc.
4. **AWS CLI** installed and configured
5. **Docker** installed (for containerized deployment)

---

## 🚀 Step 1: Prepare Code for GitHub

### 1.1 Create .gitignore (if not exists)

```bash
# Frontend
frontend/node_modules/
frontend/dist/
frontend/.env
frontend/.env.local
frontend/.env.production

# Backend
backend/*/target/
backend/*/.mvn/
backend/*/.idea/
backend/*/.vscode/
backend/*/logs/

# General
.DS_Store
*.log
.env
.env.local
```

### 1.2 Create Environment Variables Template

Create `.env.example` files:

**frontend/.env.example:**
```env
VITE_STRIPE_PUBLIC_KEY=pk_test_your_stripe_public_key
VITE_API_BASE_URL=https://your-api-domain.com
```

**backend/.env.example:**
```env
# Database
DB_HOST=your-db-host
DB_PORT=5432
DB_NAME=grocerystore
DB_USER=postgres
DB_PASSWORD=your-password

# JWT
JWT_SECRET=your-256-bit-secret-key-minimum-32-characters
JWT_EXPIRATION=86400000

# Stripe
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_PUBLIC_KEY=pk_test_your_stripe_public_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# RabbitMQ
RABBITMQ_HOST=your-rabbitmq-host
RABBITMQ_PORT=5672
RABBITMQ_USER=guest
RABBITMQ_PASSWORD=guest
```

### 1.3 Initialize Git and Push to GitHub

```bash
cd /Users/sravankumarbodakonda/Documents/SmartClient360/GROCERYSTOREAPP

# Initialize git (if not already)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit - Grocery Store App with all features"

# Create repository on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
git branch -M main
git push -u origin main
```

---

## ☁️ Step 2: AWS Setup - Backend Services

### 2.1 Create AWS RDS PostgreSQL Database

1. **Go to AWS RDS Console**
   - Navigate to: https://console.aws.amazon.com/rds/
   - Click "Create database"

2. **Database Configuration:**
   - Engine: PostgreSQL
   - Version: 15.x or 14.x
   - Template: Free tier (for demo) or Production
   - DB instance identifier: `grocerystore-db`
   - Master username: `postgres`
   - Master password: `[Create strong password]`
   - DB instance class: `db.t3.micro` (free tier) or `db.t3.small`
   - Storage: 20 GB (free tier) or as needed
   - VPC: Default VPC
   - Public access: Yes (for demo) or No (more secure)
   - Security group: Create new or use existing

3. **Note the endpoint** - You'll need this for connection strings

### 2.2 Create AWS ElastiCache for RabbitMQ (or use AWS MQ)

**Option A: AWS MQ (Managed RabbitMQ)**
1. Go to AWS MQ Console
2. Create broker
3. Engine: RabbitMQ
4. Note the endpoint

**Option B: Deploy RabbitMQ on EC2** (cheaper for demo)
- Launch EC2 instance
- Install RabbitMQ
- Configure security groups

### 2.3 Deploy Backend Services to AWS ECS (Recommended)

#### Option A: AWS ECS with Fargate (Serverless)

1. **Create ECR Repositories** (one for each service):
```bash
aws ecr create-repository --repository-name grocerystore-auth-service
aws ecr create-repository --repository-name grocerystore-catalog-service
aws ecr create-repository --repository-name grocerystore-cart-service
aws ecr create-repository --repository-name grocerystore-order-service
aws ecr create-repository --repository-name grocerystore-payment-service
aws ecr create-repository --repository-name grocerystore-api-gateway
```

2. **Build and Push Docker Images:**
```bash
# Login to ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin YOUR_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com

# For each service, build and push:
cd backend/auth-service
docker build -t grocerystore-auth-service .
docker tag grocerystore-auth-service:latest YOUR_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/grocerystore-auth-service:latest
docker push YOUR_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/grocerystore-auth-service:latest

# Repeat for other services...
```

3. **Create ECS Cluster:**
   - Go to ECS Console
   - Create cluster: "grocerystore-cluster"
   - Infrastructure: AWS Fargate

4. **Create Task Definitions** for each service with:
   - Container image from ECR
   - Environment variables
   - Port mappings
   - Memory and CPU limits

5. **Create Services** in the cluster for each task definition

#### Option B: AWS Elastic Beanstalk (Simpler)

1. **Install EB CLI:**
```bash
pip install awsebcli
```

2. **Initialize EB for each service:**
```bash
cd backend/auth-service
eb init -p java-17 grocerystore-auth-service --region us-east-1
eb create grocerystore-auth-service-env
```

3. **Configure environment variables** in EB Console

### 2.4 Create Application Load Balancer (ALB)

1. Go to EC2 Console → Load Balancers
2. Create Application Load Balancer
3. Configure:
   - Name: `grocerystore-alb`
   - Scheme: Internet-facing
   - Listeners: HTTP (80) and HTTPS (443)
   - Target groups: One for each service
   - Security groups: Allow HTTP/HTTPS

### 2.5 Configure API Gateway (if using ALB)

1. Create API Gateway
2. Create REST API
3. Integrate with ALB using VPC Link
4. Create routes for each service

---

## 🌐 Step 3: AWS Amplify - Frontend Deployment

### 3.1 Connect GitHub Repository

1. **Go to AWS Amplify Console:**
   - Navigate to: https://console.aws.amazon.com/amplify/
   - Click "New app" → "Host web app"

2. **Connect Repository:**
   - Choose GitHub
   - Authorize AWS Amplify
   - Select your repository
   - Select branch: `main`

### 3.2 Configure Build Settings

**Build specification (amplify.yml):**
```yaml
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - cd frontend
        - npm install
    build:
      commands:
        - npm run build
  artifacts:
    baseDirectory: frontend/dist
    files:
      - '**/*'
  cache:
    paths:
      - frontend/node_modules/**/*
```

### 3.3 Environment Variables

Add in Amplify Console:
```
VITE_STRIPE_PUBLIC_KEY=pk_live_your_stripe_public_key
VITE_API_BASE_URL=https://api.yourdomain.com
```

### 3.4 Custom Domain Setup

1. **In Amplify Console:**
   - Go to "Domain management"
   - Click "Add domain"
   - Enter your domain name

2. **DNS Configuration:**
   - Add CNAME record in your domain provider:
     - Name: `www` or `@`
     - Value: Amplify provided domain
   - Or use Route 53 if domain is in AWS

3. **SSL Certificate:**
   - Amplify automatically provisions SSL via AWS Certificate Manager
   - Wait for certificate validation

---

## 🔧 Step 4: Backend Configuration

### 4.1 Update Backend Environment Variables

For each service, set these in ECS/EB:

```env
# Database (RDS)
DB_HOST=your-rds-endpoint.region.rds.amazonaws.com
DB_PORT=5432
DB_NAME=grocerystore_auth  # or catalog, cart, order, payment
DB_USER=postgres
DB_PASSWORD=your-password

# JWT (same for all services)
JWT_SECRET=your-production-secret-key-minimum-32-characters
JWT_EXPIRATION=86400000

# Stripe (payment-service only)
STRIPE_SECRET_KEY=sk_live_your_stripe_secret_key
STRIPE_PUBLIC_KEY=pk_live_your_stripe_public_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# RabbitMQ
RABBITMQ_HOST=your-rabbitmq-endpoint
RABBITMQ_PORT=5672
RABBITMQ_USER=guest
RABBITMQ_PASSWORD=guest
```

### 4.2 Update CORS Settings

Update all backend services to allow your Amplify domain:

```java
@CrossOrigin(origins = {
    "https://yourdomain.com",
    "https://www.yourdomain.com",
    "https://main.xxxxx.amplifyapp.com"  // Amplify default domain
})
```

### 4.3 Update Frontend API Base URL

**frontend/vite.config.js** (for production):
```javascript
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: process.env.VITE_API_BASE_URL || 'https://api.yourdomain.com',
        changeOrigin: true
      }
    }
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: undefined
      }
    }
  }
})
```

**Or use environment variable directly:**
```javascript
// In your axios calls or API client
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api.yourdomain.com'
```

---

## 🔐 Step 5: Security & SSL

### 5.1 SSL Certificate for Backend

1. **Request Certificate in AWS Certificate Manager:**
   - Go to ACM Console
   - Request public certificate
   - Domain: `api.yourdomain.com`
   - Validation: DNS or Email

2. **Attach to ALB:**
   - Edit ALB listener
   - Add HTTPS listener (443)
   - Select certificate

### 5.2 Security Groups

**ALB Security Group:**
- Inbound: HTTP (80), HTTPS (443) from 0.0.0.0/0
- Outbound: All traffic

**ECS/EC2 Security Group:**
- Inbound: HTTP (8080-8087) from ALB security group only
- Outbound: All traffic

**RDS Security Group:**
- Inbound: PostgreSQL (5432) from ECS/EC2 security group only
- Outbound: None

---

## 📝 Step 6: Database Migration

### 6.1 Run Flyway Migrations

Option A: Run migrations in ECS task
Option B: Run locally pointing to RDS:
```bash
cd backend/auth-service
mvn flyway:migrate -Dflyway.url=jdbc:postgresql://your-rds-endpoint:5432/grocerystore_auth
```

---

## 🧪 Step 7: Testing

### 7.1 Test Endpoints

```bash
# Test API Gateway
curl https://api.yourdomain.com/api/catalog/products

# Test Frontend
curl https://yourdomain.com
```

### 7.2 Verify Stripe Webhooks

1. **In Stripe Dashboard:**
   - Go to Webhooks
   - Add endpoint: `https://api.yourdomain.com/api/payments/webhook`
   - Select events: `payment_intent.succeeded`, `payment_intent.payment_failed`

2. **Update webhook secret** in payment-service environment variables

---

## 📊 Step 8: Monitoring & Logging

### 8.1 CloudWatch Logs

- ECS tasks automatically send logs to CloudWatch
- View logs in CloudWatch Console

### 8.2 Set Up Alarms

- Create CloudWatch alarms for:
  - High CPU usage
  - High memory usage
  - Error rates
  - Database connections

---

## 🎯 Quick Start Checklist

- [ ] Push code to GitHub
- [ ] Create RDS PostgreSQL database
- [ ] Set up RabbitMQ (AWS MQ or EC2)
- [ ] Deploy backend services to ECS/EB
- [ ] Create ALB and configure routing
- [ ] Set up API Gateway (if needed)
- [ ] Deploy frontend to Amplify
- [ ] Configure custom domain
- [ ] Set up SSL certificates
- [ ] Update environment variables
- [ ] Run database migrations
- [ ] Test all endpoints
- [ ] Configure Stripe webhooks
- [ ] Set up monitoring

---

## 💰 Cost Estimation (Monthly)

**Free Tier Eligible:**
- RDS: db.t3.micro (750 hours/month free)
- EC2: t2.micro (750 hours/month free)
- Amplify: 5 GB storage, 15 GB transfer free
- Route 53: First hosted zone free

**Estimated Costs (beyond free tier):**
- RDS: ~$15-30/month
- ECS Fargate: ~$20-50/month
- ALB: ~$20/month
- Amplify: ~$0-15/month
- Data transfer: ~$10-20/month
- **Total: ~$65-135/month** (for small demo)

---

## 🆘 Troubleshooting

### Common Issues:

1. **CORS Errors:**
   - Check CORS settings in backend
   - Verify allowed origins include your domain

2. **Database Connection:**
   - Check security groups
   - Verify RDS endpoint
   - Check credentials

3. **API Not Reachable:**
   - Check ALB health checks
   - Verify target groups
   - Check security groups

4. **Build Failures:**
   - Check Amplify build logs
   - Verify environment variables
   - Check Node.js version

---

## 📞 Support

If you encounter issues, check:
- AWS CloudWatch Logs
- Amplify build logs
- Browser console errors
- Network tab in DevTools

Need help with any specific step? Let me know!

