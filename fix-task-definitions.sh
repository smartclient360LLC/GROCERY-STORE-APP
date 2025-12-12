#!/bin/bash

# Script to fix task definitions with correct ECR image URIs

set -e

AWS_REGION=us-east-2
AWS_ACCOUNT_ID=101859807516

echo "🔧 Fixing task definitions with correct ECR image URIs..."
echo ""

SERVICES=("auth-service" "catalog-service" "cart-service" "order-service" "payment-service" "api-gateway")

for SERVICE in "${SERVICES[@]}"; do
    TASK_DEF_NAME="grocerystore-$SERVICE"
    CORRECT_IMAGE="$AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/grocerystore-$SERVICE:latest"
    
    echo "Processing $TASK_DEF_NAME..."
    
    # Get current task definition
    TASK_DEF=$(aws ecs describe-task-definition \
        --task-definition $TASK_DEF_NAME \
        --region $AWS_REGION \
        --query 'taskDefinition' \
        --output json)
    
    # Update image URI
    UPDATED_TASK_DEF=$(echo $TASK_DEF | jq --arg img "$CORRECT_IMAGE" '.containerDefinitions[0].image = $img | del(.taskDefinitionArn) | del(.revision) | del(.status) | del(.requiresAttributes) | del(.compatibilities) | del(.registeredAt) | del(.registeredBy)')
    
    # Register new task definition revision
    echo "  Registering new revision with correct image: $CORRECT_IMAGE"
    NEW_TASK_DEF_ARN=$(echo $UPDATED_TASK_DEF | aws ecs register-task-definition \
        --cli-input-json file:///dev/stdin \
        --region $AWS_REGION \
        --query 'taskDefinition.taskDefinitionArn' \
        --output text)
    
    echo "  ✅ New revision registered: $NEW_TASK_DEF_ARN"
    echo ""
done

echo "✅ All task definitions updated!"
echo ""
echo "Next step: Update services to use new task definitions:"
echo "  aws ecs update-service --cluster grocerystore-cluster --service <service-name> --task-definition <new-task-def-arn> --region $AWS_REGION"
