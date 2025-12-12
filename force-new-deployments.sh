#!/bin/bash

# Script to force new deployments for all ECS services
# This will make ECS pull the latest images from ECR

set -e

AWS_REGION=us-east-2
CLUSTER_NAME=grocerystore-cluster

echo "🔄 Forcing new deployments for all ECS services..."
echo ""

# Get all service names from the cluster
SERVICE_ARNS=$(aws ecs list-services \
    --cluster $CLUSTER_NAME \
    --region $AWS_REGION \
    --query 'serviceArns' \
    --output text)

if [ -z "$SERVICE_ARNS" ]; then
    echo "❌ No services found in cluster $CLUSTER_NAME"
    exit 1
fi

# Process each service
for SERVICE_ARN in $SERVICE_ARNS; do
    # Extract service name from ARN
    SERVICE_NAME=$(echo $SERVICE_ARN | awk -F'/' '{print $NF}')
    
    echo "Processing $SERVICE_NAME..."
    
    # Force new deployment
    if aws ecs update-service \
        --cluster $CLUSTER_NAME \
        --service $SERVICE_NAME \
        --force-new-deployment \
        --region $AWS_REGION \
        --query 'service.{ServiceName:serviceName,Status:status,DesiredCount:desiredCount,TaskDefinition:taskDefinition,RunningCount:runningCount}' \
        --output json > /tmp/service-update-$SERVICE_NAME.json 2>&1; then
        
        echo "  ✅ Forced new deployment for $SERVICE_NAME"
        cat /tmp/service-update-$SERVICE_NAME.json | jq -r '.'
    else
        echo "  ⚠️  Service $SERVICE_NAME update failed"
        cat /tmp/service-update-$SERVICE_NAME.json
    fi
    echo ""
done

echo "✅ All services updated!"
echo ""
echo "⏱️  New tasks will start in 1-2 minutes. Monitor in ECS console:"
echo "   https://console.aws.amazon.com/ecs/v2/clusters/$CLUSTER_NAME/services?region=$AWS_REGION"
