#!/bin/bash

# Script to update ECS services to use the latest task definition revisions

set -e

AWS_REGION=us-east-2
CLUSTER_NAME=grocerystore-cluster

echo "🔄 Updating services to use latest task definitions..."
echo ""

# Service names and their task definition families
SERVICES=(
    "grocerystore-auth-service-service-ltzuczey:grocerystore-auth-service"
    "grocerystore-catalog-service-service-5pxbfyf4:grocerystore-catalog-service"
    "grocerystore-cart-service-service-gb2h5uyc:grocerystore-cart-service"
    "grocerystore-order-service-service-44c7c4on:grocerystore-order-service"
    "grocerystore-payment-service-service-d7nhw2go:grocerystore-payment-service"
)

for SERVICE_PAIR in "${SERVICES[@]}"; do
    SERVICE_NAME=$(echo $SERVICE_PAIR | cut -d: -f1)
    TASK_DEF_FAMILY=$(echo $SERVICE_PAIR | cut -d: -f2)
    
    echo "Processing $SERVICE_NAME..."
    
    # Get latest task definition revision
    LATEST_REVISION=$(aws ecs describe-task-definition \
        --task-definition $TASK_DEF_FAMILY \
        --region $AWS_REGION \
        --query 'taskDefinition.revision' \
        --output text)
    
    LATEST_TASK_DEF="$TASK_DEF_FAMILY:$LATEST_REVISION"
    
    echo "  Latest task definition: $LATEST_TASK_DEF"
    
    # Update service to use latest task definition
    aws ecs update-service \
        --cluster $CLUSTER_NAME \
        --service $SERVICE_NAME \
        --task-definition $LATEST_TASK_DEF \
        --force-new-deployment \
        --region $AWS_REGION \
        --query 'service.{ServiceName:serviceName,TaskDefinition:taskDefinition,DesiredCount:desiredCount}' \
        --output json > /tmp/service-update-$SERVICE_NAME.json
    
    echo "  ✅ Service updated"
    cat /tmp/service-update-$SERVICE_NAME.json | jq -r '.'
    echo ""
done

echo "✅ All services updated to use latest task definitions!"
echo ""
echo "⏱️  New tasks will start in 1-2 minutes. Monitor in ECS console:"
echo "   https://console.aws.amazon.com/ecs/v2/clusters/$CLUSTER_NAME/services?region=$AWS_REGION"
