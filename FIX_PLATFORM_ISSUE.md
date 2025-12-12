# Fix Platform Mismatch Issue

## 🔍 Problem

**Error:** `image Manifest does not contain descriptor matching platform 'linux/amd64'`

**Cause:** Docker images were built for ARM64 (Apple Silicon Mac) but ECS Fargate requires linux/amd64.

## ✅ Solution: Rebuild Images for linux/amd64

### Option 1: Use Updated Deployment Script (Recommended)

The `deploy.sh` script has been updated to build for the correct platform. Rebuild and push all images:

```bash
cd /Users/sravankumarbodakonda/Documents/SmartClient360/GROCERYSTOREAPP
./deploy.sh
```

This will rebuild all images for `linux/amd64` platform.

### Option 2: Rebuild Manually

```bash
export AWS_REGION=us-east-2
export AWS_ACCOUNT_ID=101859807516

# Login to ECR
aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com

# Rebuild and push each service with --platform linux/amd64
SERVICES=("auth-service" "catalog-service" "cart-service" "order-service" "payment-service" "api-gateway")

for SERVICE in "${SERVICES[@]}"; do
    echo "Rebuilding $SERVICE for linux/amd64..."
    cd backend/$SERVICE
    docker build --platform linux/amd64 -t grocerystore-$SERVICE .
    docker tag grocerystore-$SERVICE:latest $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/grocerystore-$SERVICE:latest
    docker push $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/grocerystore-$SERVICE:latest
    cd ../..
    echo "✅ $SERVICE rebuilt and pushed"
done
```

## 🔄 After Rebuilding

1. **Wait for images to be pushed** (5-10 minutes)
2. **Force new deployment** for all services:
   ```bash
   aws ecs update-service --cluster grocerystore-cluster --service grocerystore-auth-service-service-ltzuczey --force-new-deployment --region us-east-2
   # Repeat for all services
   ```

## ⚠️ Important

- **Build time:** Rebuilding for linux/amd64 may take longer (10-15 minutes total)
- **Image size:** Images will be slightly larger
- **All services:** Need to rebuild all 6 services

## 🎯 Quick Fix Command

```bash
cd /Users/sravankumarbodakonda/Documents/SmartClient360/GROCERYSTOREAPP
./deploy.sh
```

This will rebuild all images with the correct platform.

---

**After rebuilding, tasks should start successfully on ECS Fargate!**
