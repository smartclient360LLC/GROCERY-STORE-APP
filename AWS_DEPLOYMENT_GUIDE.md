# 🚀 AWS Deployment Guide

## Overview
This guide will help you deploy your Grocery Store application to AWS.

---

## 📋 Deployment Architecture

```
Frontend (React)     → AWS Amplify
Backend Services     → AWS Elastic Beanstalk or EC2
Database (PostgreSQL) → AWS RDS
Message Queue        → AWS MQ or EC2
```

---

## 🎯 Step 1: Deploy Frontend to AWS Amplify

### Prerequisites
- AWS Account (free tier available)
- GitHub repository connected

### Steps

1. **Go to AWS Amplify Console**
   - Visit: https://console.aws.amazon.com/amplify
   - Click "New app" → "Host web app"

2. **Connect Repository**
   - Choose GitHub
   - Authorize AWS Amplify
   - Select your repository: `smartclient360LLC/GROCERY-STORE-APP`
   - Select branch: `main`

3. **Configure Build Settings**
   - App name: `grocery-store-app`
   - Build settings: Use default or paste this:
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

4. **Environment Variables**
   Add these in Amplify Console → App settings → Environment variables:
   ```
   VITE_API_URL=https://your-api-gateway-url.com
   ```

5. **Deploy**
   - Click "Save and deploy"
   - Wait 5-10 minutes
   - Your app will be live at: `https://main.xxxxx.amplifyapp.com`

---

## 🔧 Step 2: Deploy Backend Services

### Option A: AWS Elastic Beanstalk (Easier)

1. **Install EB CLI**
   ```bash
   pip install awsebcli
   ```

2. **Initialize EB for each service**
   ```bash
   cd backend/auth-service
   eb init -p "Java 17" -r us-east-1 grocery-store-auth
   eb create auth-service-env
   ```

3. **Deploy**
   ```bash
   eb deploy
   ```

### Option B: AWS EC2 with Docker (More Control)

1. **Launch EC2 Instance**
   - AMI: Amazon Linux 2023
   - Instance type: t3.medium (or larger)
   - Security group: Open ports 8080-8085, 22

2. **Install Docker on EC2**
   ```bash
   ssh -i your-key.pem ec2-user@your-ec2-ip
   sudo yum update -y
   sudo yum install docker -y
   sudo service docker start
   sudo usermod -a -G docker ec2-user
   ```

3. **Deploy with Docker Compose**
   ```bash
   git clone https://github.com/smartclient360LLC/GROCERY-STORE-APP.git
   cd GROCERY-STORE-APP
   # Update docker-compose.yml with RDS endpoints
   docker-compose up -d
   ```

---

## 🗄️ Step 3: Set Up AWS RDS (PostgreSQL)

1. **Create RDS Instance**
   - Go to AWS RDS Console
   - Click "Create database"
   - Engine: PostgreSQL 15
   - Template: Free tier (for testing)
   - DB instance identifier: `grocery-store-db`
   - Master username: `postgres`
   - Master password: (create strong password)
   - Public access: Yes (for testing)

2. **Update Application Config**
   Update each service's `application.yml`:
   ```yaml
   spring:
     datasource:
       url: jdbc:postgresql://your-rds-endpoint:5432/grocerystore_auth
       username: postgres
       password: ${DB_PASSWORD}
   ```

---

## 🔗 Step 4: Update Frontend API URL

1. **Get Backend URL**
   - Note your API Gateway URL (e.g., `http://your-ec2-ip:8080`)

2. **Update Amplify Environment Variables**
   - Go to Amplify Console → App settings → Environment variables
   - Add: `VITE_API_URL=http://your-backend-url:8080`

3. **Redeploy Frontend**
   - Amplify will auto-redeploy on next commit
   - Or manually trigger: Amplify Console → App → Redeploy

---

## 🔐 Step 5: Configure Security

1. **Update CORS in API Gateway**
   Add your Amplify domain to allowed origins:
   ```java
   @CrossOrigin(origins = {
       "http://localhost:3000",
       "https://main.xxxxx.amplifyapp.com"
   })
   ```

2. **Set Environment Variables**
   - Use AWS Systems Manager Parameter Store
   - Store Stripe keys securely
   - Reference in application.yml

---

## 📊 Step 6: Set Up Monitoring

1. **CloudWatch Logs**
   - View logs in AWS CloudWatch
   - Set up alarms for errors

2. **Health Checks**
   - Use AWS Application Load Balancer
   - Configure health check endpoints

---

## 💰 Cost Estimation (Free Tier)

- **AWS Amplify**: Free for 12 months (1000 build minutes/month)
- **AWS RDS**: Free tier (750 hours/month, 20GB storage)
- **AWS EC2**: Free tier (750 hours/month, t2.micro)
- **Total**: ~$0-20/month for small scale

---

## ✅ Quick Checklist

- [ ] Frontend deployed to Amplify
- [ ] Backend services deployed (EB or EC2)
- [ ] RDS database created and connected
- [ ] Environment variables configured
- [ ] CORS updated for Amplify domain
- [ ] Stripe keys configured
- [ ] Domain name configured (optional)
- [ ] SSL certificate (automatic with Amplify)

---

## 🆘 Troubleshooting

### Frontend can't connect to backend
- Check CORS settings
- Verify API URL in environment variables
- Check security groups (ports open)

### Database connection errors
- Verify RDS endpoint
- Check security group allows connections
- Verify credentials

### Build failures
- Check build logs in Amplify
- Verify Node.js version
- Check for missing dependencies

---

## 🎉 Next Steps After Deployment

1. Test all features in production
2. Monitor performance
3. Add remaining features incrementally
4. Set up custom domain
5. Configure CDN for better performance

---

## 📚 Additional Resources

- [AWS Amplify Docs](https://docs.amplify.aws/)
- [AWS Elastic Beanstalk Docs](https://docs.aws.amazon.com/elasticbeanstalk/)
- [AWS RDS Docs](https://docs.aws.amazon.com/rds/)

