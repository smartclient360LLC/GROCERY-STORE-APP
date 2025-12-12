#!/bin/bash

# Deployment Script for Grocery Store App
# This script helps deploy backend services to AWS ECS

# Don't exit on error - we'll handle failures with retries
set +e

# Configuration
AWS_REGION=${AWS_REGION:-us-east-2}
AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)

echo "🚀 Starting deployment..."
echo "AWS Account ID: $AWS_ACCOUNT_ID"
echo "AWS Region: $AWS_REGION"

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Login to ECR
echo -e "${BLUE}Logging into ECR...${NC}"
aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com

# Function to push with retry
push_with_retry() {
    local service=$1
    local max_attempts=3
    local attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        echo -e "${BLUE}Attempt $attempt of $max_attempts: Pushing $service...${NC}"
        
        if docker push $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/grocerystore-$service:latest 2>&1; then
            echo -e "${GREEN}✓ $service pushed successfully!${NC}"
            return 0
        else
            echo -e "${YELLOW}⚠ Push failed for $service (attempt $attempt/$max_attempts)${NC}"
            if [ $attempt -lt $max_attempts ]; then
                echo -e "${YELLOW}Waiting 15 seconds before retry...${NC}"
                sleep 15
            fi
            attempt=$((attempt + 1))
        fi
    done
    
    echo -e "${RED}✗ Failed to push $service after $max_attempts attempts${NC}"
    return 1
}

# Services to deploy
SERVICES=("auth-service" "catalog-service" "cart-service" "order-service" "payment-service" "api-gateway")

FAILED_SERVICES=()

# Build and push each service
for SERVICE in "${SERVICES[@]}"; do
    echo ""
    echo -e "${BLUE}==========================================${NC}"
    echo -e "${BLUE}Processing $SERVICE...${NC}"
    echo -e "${BLUE}==========================================${NC}"
    cd backend/$SERVICE
    
    # Build Docker image for linux/amd64 platform (required for ECS Fargate)
    echo -e "${BLUE}Building $SERVICE for linux/amd64...${NC}"
    if ! docker build --platform linux/amd64 -t grocerystore-$SERVICE .; then
        echo -e "${RED}✗ Build failed for $SERVICE${NC}"
        FAILED_SERVICES+=("$SERVICE")
        cd ../..
        continue
    fi
    
    # Tag for ECR
    docker tag grocerystore-$SERVICE:latest $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/grocerystore-$SERVICE:latest
    
    # Push to ECR with retry
    if ! push_with_retry $SERVICE; then
        FAILED_SERVICES+=("$SERVICE")
    fi
    
    cd ../..
done

echo ""
echo -e "${BLUE}==========================================${NC}"
if [ ${#FAILED_SERVICES[@]} -eq 0 ]; then
    echo -e "${GREEN}✅ All services deployed to ECR!${NC}"
else
    echo -e "${YELLOW}⚠ Some services failed to push:${NC}"
    for service in "${FAILED_SERVICES[@]}"; do
        echo -e "${RED}  - $service${NC}"
    done
    echo ""
    echo -e "${YELLOW}You can retry failed services by running:${NC}"
    echo -e "${BLUE}  ./deploy.sh${NC}"
    echo -e "${YELLOW}Or push individual services manually.${NC}"
fi
echo -e "${BLUE}==========================================${NC}"
echo ""
echo "Next steps:"
echo "1. Update ECS task definitions with new image URIs"
echo "2. Update ECS services to use new task definitions"
echo "3. Verify services are running in ECS console"

