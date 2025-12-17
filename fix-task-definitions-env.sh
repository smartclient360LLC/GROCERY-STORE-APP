#!/bin/bash

# Script to fix environment variables in all task definitions
# Main issue: RABBITMQ_HOST has protocol and port, should be just hostname

set -e

AWS_REGION=us-east-2
AWS_ACCOUNT_ID=101859807516

# Correct values
RABBITMQ_HOST="b-bede77dc-0652-44cb-b9ff-580e384de00b.mq.us-east-2.on.aws"
RABBITMQ_PORT="5671"  # SSL port
RABBITMQ_USER="admin"
RABBITMQ_PASSWORD="Smartclient360LLC"

echo "🔧 Fixing task definitions with correct environment variables..."
echo ""

SERVICES=("auth-service" "catalog-service" "cart-service" "order-service" "payment-service")

for SERVICE in "${SERVICES[@]}"; do
    TASK_DEF_NAME="grocerystore-$SERVICE"
    
    echo "Processing $TASK_DEF_NAME..."
    
    # Get current task definition
    TASK_DEF=$(aws ecs describe-task-definition \
        --task-definition $TASK_DEF_NAME \
        --region $AWS_REGION \
        --query 'taskDefinition' \
        --output json)
    
    # Update environment variables
    UPDATED_TASK_DEF=$(echo "$TASK_DEF" | jq --arg host "$RABBITMQ_HOST" --arg port "$RABBITMQ_PORT" --arg user "$RABBITMQ_USER" --arg pass "$RABBITMQ_PASSWORD" '
        .containerDefinitions[0].environment = [
            .containerDefinitions[0].environment[] | 
            if .name == "RABBITMQ_HOST" then .value = $host
            elif .name == "RABBITMQ_PORT" then .value = $port
            elif .name == "RABBITMQ_USER" then .value = $user
            elif .name == "RABBITMQ_PASSWORD" then .value = $pass
            else .
            end
        ] |
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
    RABBITMQ_HOST_VALUE=$(echo "$NEW_TASK_DEF" | jq -r '.taskDefinition.containerDefinitions[0].environment[] | select(.name=="RABBITMQ_HOST") | .value')
    
    echo "  ✅ Revision $NEW_REVISION registered"
    echo "  ✅ RABBITMQ_HOST: $RABBITMQ_HOST_VALUE"
    echo ""
done

echo "✅ All task definitions updated!"
echo ""
echo "Next: Update services to use new task definitions..."
