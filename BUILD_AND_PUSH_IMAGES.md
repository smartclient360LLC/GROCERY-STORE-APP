# Build and Push Docker Images to ECR

## ✅ Prerequisites Completed
- ✅ ECR repositories created
- ✅ Docker installed and running

## 🚀 Step 1: Update Deployment Script (Already Done)

The `deploy.sh` script has been updated to use `us-east-2` region.

## 🐳 Step 2: Build and Push Images

### Option A: Use the Deployment Script (Recommended)

```bash
cd /Users/sravankumarbodakonda/Documents/SmartClient360/GROCERYSTOREAPP

# Make sure script is executable
chmod +x deploy.sh

# Run the deployment script
./deploy.sh
```

This will:
1. Login to ECR
2. Build Docker images for all 6 services
3. Tag them for ECR
4. Push them to ECR

**Time:** 10-15 minutes (depending on your internet speed)

### Option B: Manual Build and Push

If you prefer to build services one at a time:

```bash
# Set variables
export AWS_REGION=us-east-2
export AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)

# Login to ECR
aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com

# Build and push each service
cd backend/auth-service
docker build -t grocerystore-auth-service .
docker tag grocerystore-auth-service:latest $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/grocerystore-auth-service:latest
docker push $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/grocerystore-auth-service:latest
cd ../..

# Repeat for other services...
```

## 📋 Services Being Built

The script will build and push these 6 services:
1. **auth-service** (Port 8081)
2. **catalog-service** (Port 8084)
3. **cart-service** (Port 8083)
4. **order-service** (Port 8085)
5. **payment-service** (Port 8086)
6. **api-gateway** (Port 8087)

## ⏱️ Expected Time

- **First build:** 10-15 minutes (downloads Maven dependencies, builds Java apps)
- **Subsequent builds:** 5-10 minutes (with Docker layer caching)

## 🔍 Verify Images Were Pushed

After the script completes, verify in AWS Console:

1. Go to [ECR Console](https://console.aws.amazon.com/ecr/)
2. Make sure you're in **us-east-2** region
3. You should see all 6 repositories
4. Click on each repository to see the pushed images

Or use AWS CLI:

```bash
aws ecr describe-images --repository-name grocerystore-auth-service --region us-east-2
```

## 🐛 Troubleshooting

### "docker: command not found"
- Make sure Docker Desktop is running
- Verify Docker is installed: `docker --version`

### "unauthorized: authentication required"
- Make sure you're logged into ECR
- Run the login command again:
  ```bash
  aws ecr get-login-password --region us-east-2 | docker login --username AWS --password-stdin $AWS_ACCOUNT_ID.dkr.ecr.us-east-2.amazonaws.com
  ```

### Build fails with "mvn: command not found"
- This shouldn't happen as the Dockerfile uses a Maven image
- Check the Dockerfile is correct

### Out of disk space
- Clean up old Docker images: `docker system prune -a`
- Make sure you have at least 10GB free space

### Build is slow
- This is normal for the first build
- Subsequent builds will be faster due to Docker layer caching

## ✅ Next Steps After Images Are Pushed

1. **Create ECS Cluster** (if not already created)
2. **Create Task Definitions** with environment variables
3. **Create ECS Services** for each task definition
4. **Set up Application Load Balancer**
5. **Update frontend API URL** in Amplify

## 📝 Quick Command Reference

```bash
# Login to ECR
aws ecr get-login-password --region us-east-2 | docker login --username AWS --password-stdin $AWS_ACCOUNT_ID.dkr.ecr.us-east-2.amazonaws.com

# List ECR repositories
aws ecr describe-repositories --region us-east-2

# List images in a repository
aws ecr describe-images --repository-name grocerystore-auth-service --region us-east-2

# Run deployment script
cd /Users/sravankumarbodakonda/Documents/SmartClient360/GROCERYSTOREAPP
./deploy.sh
```

---

**Ready to build?** Run `./deploy.sh` from the project root directory!
