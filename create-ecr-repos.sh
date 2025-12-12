#!/bin/bash

# Script to create ECR repositories for Grocery Store App
# Region: us-east-2

set -e

# Set your region
export AWS_REGION=us-east-2

# Get your AWS account ID
export AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)

echo "🚀 Creating ECR repositories..."
echo "AWS Account ID: $AWS_ACCOUNT_ID"
echo "AWS Region: $AWS_REGION"
echo ""

# Create ECR repositories for each service
SERVICES=("auth-service" "catalog-service" "cart-service" "order-service" "payment-service" "api-gateway")

for SERVICE in "${SERVICES[@]}"; do
    echo "Creating repository: grocerystore-$SERVICE"
    aws ecr create-repository \
        --repository-name grocerystore-$SERVICE \
        --region $AWS_REGION \
        --image-scanning-configuration scanOnPush=true \
        --encryption-configuration encryptionType=AES256 \
        2>&1 | grep -q "already exists" && echo "  ✓ Repository already exists" || echo "  ✓ Repository created"
done

echo ""
echo "✅ All ECR repositories ready!"
echo ""
echo "Repository URIs:"
for SERVICE in "${SERVICES[@]}"; do
    echo "  $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/grocerystore-$SERVICE"
done
