#!/bin/bash

# Script to stop Docker containers so you can run services locally

echo "🛑 Stopping Docker containers..."
echo ""

# Stop all services (but keep databases and RabbitMQ if you want)
docker stop payment-service order-service auth-service catalog-service cart-service api-gateway frontend 2>/dev/null || echo "Some containers already stopped"

echo ""
echo "✅ Docker service containers stopped!"
echo ""
echo "📋 Remaining containers (databases and RabbitMQ):"
docker ps --format "table {{.Names}}\t{{.Ports}}\t{{.Status}}"
echo ""
echo "💡 To stop everything (including databases):"
echo "   docker-compose down"
echo ""
echo "💡 To start services locally, use run.sh scripts in each service directory:"
echo "   cd backend/auth-service && ./run.sh"
echo "   cd backend/catalog-service && ./run.sh"
echo "   etc."
