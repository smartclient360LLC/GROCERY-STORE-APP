# Step-by-Step Deployment Guide

## 🎯 Goal: Deploy to Production with Custom Domain

---

## PART 1: GitHub Setup (15 minutes)

### Step 1.1: Initialize Git Repository

```bash
cd /Users/sravankumarbodakonda/Documents/SmartClient360/GROCERYSTOREAPP

# Check if git is initialized
git status

# If not initialized:
git init
git add .
git commit -m "Initial commit - Production ready Grocery Store App"
```

### Step 1.2: Create GitHub Repository

1. Go to https://github.com/new
2. Repository name: `grocerystore-app` (or your choice)
3. Description: "Full-stack grocery store application"
4. Visibility: Private (recommended) or Public
5. **DO NOT** initialize with README, .gitignore, or license
6. Click "Create repository"

### Step 1.3: Push to GitHub

```bash
# Add remote (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/grocerystore-app.git

# Rename branch to main
git branch -M main

# Push code
git push -u origin main
```

**Verify:** Go to GitHub and check your repository has all files.

---

## PART 2: AWS Backend Setup (1-2 hours)

### Step 2.1: Create RDS PostgreSQL Database

1. **AWS Console → RDS**
   - URL: https://console.aws.amazon.com/rds/
   - Click "Create database"

2. **Database Configuration:**
   ```
   Engine: PostgreSQL
   Version: 15.4 (or latest)
   Template: Free tier (for demo)
   
   Settings:
   - DB instance identifier: grocerystore-db
   - Master username: postgres
   - Master password: [Create strong password - SAVE THIS!]
   
   Instance configuration:
   - DB instance class: db.t3.micro (Free tier eligible)
   
   Storage:
   - Storage type: General Purpose SSD (gp3)
   - Allocated storage: 20 GB
   - Enable storage autoscaling: Yes (optional)
   
   Connectivity:
   - VPC: Default VPC
   - Public access: Yes (for demo - easier setup)
   - VPC security group: Create new
     - Security group name: grocerystore-db-sg
   - Availability Zone: No preference
   - Database port: 5432
   
   Database authentication:
   - Password authentication
   
   Additional configuration:
   - Initial database name: postgres (we'll create separate DBs later)
   - Backup retention: 7 days (free tier)
   - Enable encryption: Yes (recommended)
   ```

3. **Click "Create database"**
   - Wait 5-10 minutes for database to be created
   - **Note the endpoint:** `grocerystore-db.xxxxx.us-east-1.rds.amazonaws.com`

4. **Create Separate Databases:**
   ```sql
   -- Connect to RDS using psql or pgAdmin
   -- You'll need to connect from an EC2 instance or use AWS CloudShell
   
   CREATE DATABASE grocerystore_auth;
   CREATE DATABASE grocerystore_catalog;
   CREATE DATABASE grocerystore_cart;
   CREATE DATABASE grocerystore_order;
   CREATE DATABASE grocerystore_payment;
   ```

### Step 2.2: Set Up RabbitMQ (Option A: AWS MQ - Recommended)

1. **AWS Console → Amazon MQ**
   - URL: https://console.aws.amazon.com/amazon-mq/
   - Click "Create broker"

2. **Broker Configuration:**
   ```
   Broker engine: RabbitMQ
   Broker instance type: mq.t3.micro (Free tier eligible)
   Broker name: grocerystore-rabbitmq
   Deployment mode: Single-instance broker
   
   Authentication:
   - Username: admin
   - Password: [Create strong password - SAVE THIS!]
   
   Network:
   - VPC: Default VPC
   - Subnet: Default subnet
   - Public accessibility: Yes (for demo)
   
   Security:
   - Security group: Create new (grocerystore-mq-sg)
   ```

3. **Click "Create broker"**
   - Wait 10-15 minutes
   - **Note the endpoint:** `b-xxxxx-1.mq.us-east-1.amazonaws.com`

**Alternative: Use EC2 for RabbitMQ (Cheaper)**
- Launch EC2 t2.micro instance
- Install RabbitMQ
- Configure security groups

### Step 2.3: Deploy Backend Services to AWS ECS

#### A. Create ECR Repositories

```bash
# Configure AWS CLI first (if not done)
aws configure

# Set your region
export AWS_REGION=us-east-1

# Create ECR repositories
aws ecr create-repository --repository-name grocerystore-auth-service --region $AWS_REGION
aws ecr create-repository --repository-name grocerystore-catalog-service --region $AWS_REGION
aws ecr create-repository --repository-name grocerystore-cart-service --region $AWS_REGION
aws ecr create-repository --repository-name grocerystore-order-service --region $AWS_REGION
aws ecr create-repository --repository-name grocerystore-payment-service --region $AWS_REGION
aws ecr create-repository --repository-name grocerystore-api-gateway --region $AWS_REGION

# Get your AWS account ID
export AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
echo "AWS Account ID: $AWS_ACCOUNT_ID"
```

#### B. Build and Push Docker Images

```bash
# Login to ECR
aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com

# Build and push each service
cd backend/auth-service
docker build -t grocerystore-auth-service .
docker tag grocerystore-auth-service:latest $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/grocerystore-auth-service:latest
docker push $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/grocerystore-auth-service:latest

# Repeat for other services...
cd ../catalog-service
docker build -t grocerystore-catalog-service .
docker tag grocerystore-catalog-service:latest $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/grocerystore-catalog-service:latest
docker push $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/grocerystore-catalog-service:latest

cd ../cart-service
docker build -t grocerystore-cart-service .
docker tag grocerystore-cart-service:latest $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/grocerystore-cart-service:latest
docker push $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/grocerystore-cart-service:latest

cd ../order-service
docker build -t grocerystore-order-service .
docker tag grocerystore-order-service:latest $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/grocerystore-order-service:latest
docker push $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/grocerystore-order-service:latest

cd ../payment-service
docker build -t grocerystore-payment-service .
docker tag grocerystore-payment-service:latest $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/grocerystore-payment-service:latest
docker push $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/grocerystore-payment-service:latest

cd ../api-gateway
docker build -t grocerystore-api-gateway .
docker tag grocerystore-api-gateway:latest $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/grocerystore-api-gateway:latest
docker push $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/grocerystore-api-gateway:latest
```

#### C. Create ECS Cluster

1. **AWS Console → ECS**
   - URL: https://console.aws.amazon.com/ecs/
   - Click "Create cluster"

2. **Cluster Configuration:**
   ```
   Cluster name: grocerystore-cluster
   Infrastructure: AWS Fargate (Serverless)
   ```

3. **Click "Create"**

#### D. Create Task Definitions

For each service, create a task definition:

1. **ECS → Task Definitions → Create new task definition**
2. **Configuration:**
   ```
   Task definition family: grocerystore-auth-service
   Launch type: Fargate
   Operating system/Architecture: Linux/X86_64
   Task size:
   - CPU: 0.25 vCPU (256)
   - Memory: 0.5 GB (512)
   
   Container:
   - Container name: auth-service
   - Image URI: [Your ECR image URI]
   - Port mappings: 8081:8081
   - Environment variables:
     * DB_HOST: [RDS endpoint]
     * DB_PORT: 5432
     * DB_NAME: grocerystore_auth
     * DB_USER: postgres
     * DB_PASSWORD: [Your RDS password]
     * JWT_SECRET: [Your JWT secret - same for all services]
     * JWT_EXPIRATION: 86400000
     * RABBITMQ_HOST: [RabbitMQ endpoint]
     * RABBITMQ_PORT: 5672
     * RABBITMQ_USER: admin
     * RABBITMQ_PASSWORD: [RabbitMQ password]
   ```

3. **Repeat for all services** with appropriate ports:
   - catalog-service: 8084
   - cart-service: 8083
   - order-service: 8085
   - payment-service: 8086
   - api-gateway: 8087

#### E. Create ECS Services

1. **In your cluster → Services tab → Create**
2. **Configuration:**
   ```
   Launch type: Fargate
   Task definition: [Select your task definition]
   Service name: [service-name]
   Number of tasks: 1
   VPC: Default VPC
   Subnets: Select all
   Security group: Create new (allow HTTP on service port)
   Load balancer: Application Load Balancer (create new)
   ```

### Step 2.4: Create Application Load Balancer

1. **EC2 Console → Load Balancers → Create Load Balancer**
2. **Type: Application Load Balancer**
3. **Configuration:**
   ```
   Name: grocerystore-alb
   Scheme: Internet-facing
   IP address type: IPv4
   VPC: Default VPC
   Availability Zones: Select all
   
   Security groups: Create new
   - Allow HTTP (80) from 0.0.0.0/0
   - Allow HTTPS (443) from 0.0.0.0/0
   
   Listeners:
   - HTTP:80 → Forward to target group
   - HTTPS:443 → Forward to target group (add SSL certificate)
   
   Target groups:
   - Create target group for each service
   - Health check path: /actuator/health (or /)
   ```

4. **Note the ALB DNS name:** `grocerystore-alb-xxxxx.us-east-1.elb.amazonaws.com`

---

## PART 3: AWS Amplify Frontend (30 minutes)

### Step 3.1: Connect GitHub Repository

1. **AWS Console → Amplify**
   - URL: https://console.aws.amazon.com/amplify/
   - Click "New app" → "Host web app"

2. **Repository Selection:**
   - Choose "GitHub"
   - Authorize AWS Amplify (if first time)
   - Select repository: `grocerystore-app`
   - Branch: `main`

3. **Build Settings:**
   - Amplify will auto-detect `amplify.yml`
   - If not detected, use this:
   ```yaml
   version: 1
   frontend:
     phases:
       preBuild:
         commands:
           - cd frontend
           - npm ci
       build:
         commands:
           - npm run build
     artifacts:
       baseDirectory: frontend/dist
       files:
         - '**/*'
   ```

### Step 3.2: Configure Environment Variables

In Amplify Console → App settings → Environment variables:

```
VITE_STRIPE_PUBLIC_KEY=pk_live_your_stripe_public_key
VITE_API_BASE_URL=https://your-alb-dns-name.elb.amazonaws.com
```

**Note:** Update `VITE_API_BASE_URL` after ALB is created.

### Step 3.3: Deploy

1. Click "Save and deploy"
2. Wait for build to complete (5-10 minutes)
3. **Note the Amplify URL:** `https://main.xxxxx.amplifyapp.com`

---

## PART 4: Custom Domain Setup (20 minutes)

### Step 4.1: Purchase Domain (if not owned)

**Option A: AWS Route 53**
1. Route 53 → Registered domains → Register domain
2. Choose domain name
3. Complete registration

**Option B: External Provider (GoDaddy, Namecheap, etc.)**
- Purchase domain from provider

### Step 4.2: Configure Domain in Amplify

1. **Amplify Console → Domain management → Add domain**
2. **Enter your domain:** `yourdomain.com`
3. **Configure subdomain:**
   - `www.yourdomain.com` → Main branch
   - `yourdomain.com` → Main branch (root domain)

4. **DNS Configuration:**
   - Amplify will provide DNS records
   - Add these to your domain provider:

**If using Route 53:**
- Records are added automatically

**If using external provider:**
- Add CNAME record:
  - Name: `www` (or `@` for root)
  - Value: Amplify provided domain
- Add A record (for root domain):
  - Use Amplify provided IP addresses

### Step 4.3: SSL Certificate

- Amplify automatically provisions SSL via AWS Certificate Manager
- Wait for DNS validation (can take 30 minutes to 24 hours)
- SSL will be active once validated

### Step 4.4: Configure Backend Domain

1. **Request SSL Certificate in ACM:**
   - AWS Certificate Manager → Request certificate
   - Domain: `api.yourdomain.com`
   - Validation: DNS

2. **Update ALB:**
   - Edit HTTPS listener (443)
   - Select certificate
   - Update target group

3. **Update DNS:**
   - Add CNAME: `api` → ALB DNS name

4. **Update Frontend Environment Variable:**
   - In Amplify: `VITE_API_BASE_URL=https://api.yourdomain.com`
   - Redeploy

---

## PART 5: Update Backend CORS (10 minutes)

Update all backend services to allow your domain:

**In each service's SecurityConfig.java:**

```java
@Bean
public CorsConfigurationSource corsConfigurationSource() {
    CorsConfiguration configuration = new CorsConfiguration();
    configuration.setAllowedOrigins(List.of(
        "https://yourdomain.com",
        "https://www.yourdomain.com",
        "https://main.xxxxx.amplifyapp.com"  // Amplify default domain
    ));
    configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
    configuration.setAllowedHeaders(List.of("*"));
    configuration.setAllowCredentials(true);
    UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
    source.registerCorsConfiguration("/**", configuration);
    return source;
}
```

**Rebuild and redeploy services after CORS update.**

---

## PART 6: Database Migrations (15 minutes)

### Option A: Run Migrations via ECS Task

1. **Create one-time ECS task:**
   - Use same task definition
   - Override command to run migrations
   - Or SSH into container and run manually

### Option B: Run Locally (Pointing to RDS)

```bash
# Update application.yml temporarily with RDS endpoint
# Then run:
cd backend/auth-service
mvn flyway:migrate

# Repeat for each service
```

### Option C: Use AWS CloudShell

1. Install PostgreSQL client in CloudShell
2. Connect to RDS
3. Run migrations manually

---

## PART 7: Stripe Production Setup (10 minutes)

1. **Stripe Dashboard → API Keys**
   - Switch to "Live mode"
   - Copy Live keys

2. **Update Environment Variables:**
   - In payment-service ECS task definition:
     - `STRIPE_SECRET_KEY=sk_live_...`
     - `STRIPE_PUBLIC_KEY=pk_live_...`

3. **Update Frontend:**
   - In Amplify environment variables:
     - `VITE_STRIPE_PUBLIC_KEY=pk_live_...`

4. **Configure Webhooks:**
   - Stripe Dashboard → Webhooks → Add endpoint
   - URL: `https://api.yourdomain.com/api/payments/webhook`
   - Events: `payment_intent.succeeded`, `payment_intent.payment_failed`
   - Copy webhook secret
   - Update: `STRIPE_WEBHOOK_SECRET` in payment-service

---

## PART 8: Testing & Verification (30 minutes)

### 8.1 Test Frontend
```bash
# Visit your domain
https://yourdomain.com

# Verify:
- [ ] Homepage loads
- [ ] Can browse products
- [ ] Can add to cart
- [ ] Can checkout
- [ ] Payment works
```

### 8.2 Test Backend APIs
```bash
# Test catalog
curl https://api.yourdomain.com/api/catalog/products

# Test auth
curl -X POST https://api.yourdomain.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password"}'
```

### 8.3 Verify Database
- Connect to RDS
- Check tables are created
- Verify data exists

---

## 📋 Final Checklist

- [ ] Code pushed to GitHub
- [ ] RDS database created and accessible
- [ ] RabbitMQ/MQ configured
- [ ] All services deployed to ECS
- [ ] ALB created and routing correctly
- [ ] Frontend deployed to Amplify
- [ ] Custom domain configured
- [ ] SSL certificates active
- [ ] CORS updated in all services
- [ ] Database migrations run
- [ ] Stripe production keys configured
- [ ] Webhooks configured
- [ ] All endpoints tested
- [ ] Frontend and backend communicating

---

## 🆘 Troubleshooting

### Issue: CORS Errors
**Solution:** Check CORS configuration in all backend services includes your domain

### Issue: Database Connection Failed
**Solution:** 
- Check RDS security group allows connections from ECS security group
- Verify endpoint and credentials
- Check VPC configuration

### Issue: Services Not Starting
**Solution:**
- Check CloudWatch logs
- Verify environment variables
- Check task definition configuration

### Issue: Domain Not Resolving
**Solution:**
- Wait for DNS propagation (up to 48 hours)
- Verify DNS records are correct
- Check Route 53 hosted zone

---

## 💰 Cost Optimization Tips

1. **Use Free Tier:**
   - RDS: db.t3.micro (750 hours/month free)
   - EC2: t2.micro (750 hours/month free)
   - ECS Fargate: Pay only for usage
   - Amplify: 5 GB storage, 15 GB transfer free

2. **Stop Services When Not in Use:**
   - Stop ECS services when not demoing
   - Stop RDS when not needed (snapshot first)

3. **Use Reserved Instances** (if running 24/7)

---

## 📞 Next Steps

1. Set up monitoring (CloudWatch alarms)
2. Configure backups (RDS automated backups)
3. Set up CI/CD pipeline
4. Add staging environment
5. Implement logging and error tracking

---

**Need help with any step? Let me know!**

