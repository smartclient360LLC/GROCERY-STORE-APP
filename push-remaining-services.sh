#!/bin/bash

# Script to push remaining services with retry logic
set -e

AWS_REGION=us-east-2
AWS_ACCOUNT_ID=101859807516

# Login to ECR
echo "Logging into ECR..."
aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com

# Services that need to be pushed
SERVICES=("order-service" "payment-service" "api-gateway")

# Function to push with retry
push_with_retry() {
    local service=$1
    local max_attempts=3
    local attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        echo ""
        echo "Attempt $attempt of $max_attempts: Pushing $service..."
        
        if docker push $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/grocerystore-$service:latest; then
            echo "✅ $service pushed successfully!"
            return 0
        else
            echo "❌ Push failed for $service (attempt $attempt/$max_attempts)"
            if [ $attempt -lt $max_attempts ]; then
                echo "Waiting 5 seconds before retry..."
                sleep 5
            fi
            attempt=$((attempt + 1))
        fi
    done
    
    echo "❌ Failed to push $service after $max_attempts attempts"
    return 1
}

# Build and push each service
for SERVICE in "${SERVICES[@]}"; do
    echo ""
    echo "=========================================="
    echo "Processing $SERVICE..."
    echo "=========================================="
    
    cd backend/$SERVICE
    
    # Build if image doesn't exist locally
    if ! docker images | grep -q "grocerystore-$SERVICE.*latest"; then
        echo "Building $SERVICE..."
        docker build -t grocerystore-$SERVICE .
    else
        echo "Image already built, skipping build..."
    fi
    
    # Tag for ECR
    docker tag grocerystore-$SERVICE:latest $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/grocerystore-$SERVICE:latest
    
    # Push with retry
    push_with_retry $SERVICE
    
    cd ../..
done

echo ""
echo "✅ All remaining services processed!"
