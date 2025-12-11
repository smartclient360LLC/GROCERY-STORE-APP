#!/bin/bash

# Deployment Script for Grocery Store App
# This script helps deploy backend services to AWS ECS

set -e

# Configuration
AWS_REGION=${AWS_REGION:-us-east-1}
AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)

echo "🚀 Starting deployment..."
echo "AWS Account ID: $AWS_ACCOUNT_ID"
echo "AWS Region: $AWS_REGION"

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Login to ECR
echo -e "${BLUE}Logging into ECR...${NC}"
aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com

# Services to deploy
SERVICES=("auth-service" "catalog-service" "cart-service" "order-service" "payment-service" "api-gateway")

# Build and push each service
for SERVICE in "${SERVICES[@]}"; do
    echo -e "${BLUE}Building and pushing $SERVICE...${NC}"
    cd backend/$SERVICE
    
    # Build Docker image
    docker build -t grocerystore-$SERVICE .
    
    # Tag for ECR
    docker tag grocerystore-$SERVICE:latest $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/grocerystore-$SERVICE:latest
    
    # Push to ECR
    docker push $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/grocerystore-$SERVICE:latest
    
    echo -e "${GREEN}✓ $SERVICE pushed successfully${NC}"
    cd ../..
done

echo -e "${GREEN}✅ All services deployed to ECR!${NC}"
echo ""
echo "Next steps:"
echo "1. Update ECS task definitions with new image URIs"
echo "2. Update ECS services to use new task definitions"
echo "3. Verify services are running in ECS console"

