# Quick Deployment Steps - Summary

## 🚀 Fast Track Deployment

### 1. GitHub Setup (5 minutes)
```bash
cd /Users/sravankumarbodakonda/Documents/SmartClient360/GROCERYSTOREAPP
git init
git add .
git commit -m "Production ready - Grocery Store App"
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```

### 2. AWS RDS Setup (10 minutes)
1. AWS Console → RDS → Create Database
2. PostgreSQL, Free tier
3. Note endpoint: `xxxxx.region.rds.amazonaws.com`
4. Create databases: `grocerystore_auth`, `grocerystore_catalog`, `grocerystore_cart`, `grocerystore_order`, `grocerystore_payment`

### 3. AWS Amplify Frontend (15 minutes)
1. AWS Console → Amplify → New app → Host web app
2. Connect GitHub repository
3. Build settings: Use `amplify.yml` (already created)
4. Environment variables:
   - `VITE_STRIPE_PUBLIC_KEY`
   - `VITE_API_BASE_URL` (set after backend is deployed)
5. Deploy

### 4. Backend Deployment Options

#### Option A: AWS Elastic Beanstalk (Easiest - 30 minutes)
```bash
# Install EB CLI
pip install awsebcli

# For each service
cd backend/auth-service
eb init -p java-17 grocerystore-auth --region us-east-1
eb create grocerystore-auth-prod
eb setenv DB_HOST=your-rds-endpoint JWT_SECRET=your-secret
eb deploy
```

#### Option B: AWS ECS Fargate (More scalable - 1 hour)
- Use provided Dockerfiles
- Push to ECR
- Create ECS cluster and services
- Configure ALB

### 5. Domain Setup (10 minutes)
1. Buy domain (Route 53, GoDaddy, etc.)
2. In Amplify: Add custom domain
3. Update DNS records as instructed
4. SSL certificate auto-provisioned

### 6. Update Configuration
- Update CORS in all backend services
- Update frontend API base URL
- Run database migrations
- Configure Stripe webhooks

---

## 📋 Pre-Deployment Checklist

- [ ] All code committed to GitHub
- [ ] Environment variables documented
- [ ] Database migrations ready
- [ ] Stripe keys (production) ready
- [ ] Domain name purchased
- [ ] AWS account set up
- [ ] AWS CLI configured

---

## ⚡ Estimated Total Time: 2-3 hours

For detailed instructions, see `DEPLOYMENT_GUIDE.md`

