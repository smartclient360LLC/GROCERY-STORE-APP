#!/bin/bash

# Script to update all task definitions with correct ECR image URIs

set -e

AWS_REGION=us-east-2
AWS_ACCOUNT_ID=101859807516

echo "🔧 Updating all task definitions with correct ECR image URIs..."
echo ""

SERVICES=("auth-service" "catalog-service" "cart-service" "order-service" "payment-service" "api-gateway")

for SERVICE in "${SERVICES[@]}"; do
    TASK_DEF_NAME="grocerystore-$SERVICE"
    CORRECT_IMAGE="$AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/grocerystore-$SERVICE:latest"
    
    echo "Processing $TASK_DEF_NAME..."
    echo "  Correct image: $CORRECT_IMAGE"
    
    # Get current task definition
    TASK_DEF=$(aws ecs describe-task-definition \
        --task-definition $TASK_DEF_NAME \
        --region $AWS_REGION \
        --query 'taskDefinition' \
        --output json)
    
    # Update image URI and remove fields that can't be in new registration
    UPDATED_TASK_DEF=$(echo "$TASK_DEF" | jq --arg img "$CORRECT_IMAGE" '
        .containerDefinitions[0].image = $img |
        del(.taskDefinitionArn) |
        del(.revision) |
        del(.status) |
        del(.requiresAttributes) |
        del(.compatibilities) |
        del(.registeredAt) |
        del(.registeredBy)
    ')
    
    # Save to temp file
    echo "$UPDATED_TASK_DEF" > /tmp/task-def-$SERVICE.json
    
    # Register new task definition revision
    NEW_TASK_DEF=$(aws ecs register-task-definition \
        --cli-input-json file:///tmp/task-def-$SERVICE.json \
        --region $AWS_REGION)
    
    NEW_REVISION=$(echo "$NEW_TASK_DEF" | jq -r '.taskDefinition.revision')
    NEW_IMAGE=$(echo "$NEW_TASK_DEF" | jq -r '.taskDefinition.containerDefinitions[0].image')
    
    echo "  ✅ Revision $NEW_REVISION registered with image: $NEW_IMAGE"
    echo ""
done

echo "✅ All task definitions updated!"
echo ""
echo "Next: Update services to use new task definitions..."
