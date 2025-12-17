#!/bin/bash

# Script to start everything locally - Backend + Frontend

set -e

echo "🚀 Starting Grocery Store Application Locally..."
echo ""

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker Desktop first."
    exit 1
fi

echo "✅ Docker is running"
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo "⚠️  No .env file found. Creating one with default values..."
    cat > .env << ENVEOF
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_PUBLIC_KEY=pk_test_your_stripe_public_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
ENVEOF
    echo "📝 Created .env file. Update it with your Stripe keys for payment functionality."
    echo ""
fi

# Start backend services (databases, RabbitMQ, and all backend services)
echo "🐳 Starting backend services with Docker Compose..."
docker-compose up -d postgres-auth postgres-catalog postgres-cart postgres-order postgres-payment rabbitmq auth-service catalog-service cart-service order-service payment-service api-gateway

echo ""
echo "⏳ Waiting for backend services to start (30 seconds)..."
sleep 30

echo ""
echo "📊 Checking backend service status..."
docker-compose ps | grep -E "auth-service|catalog-service|cart-service|order-service|payment-service|api-gateway|postgres|rabbitmq"

echo ""
echo "✅ Backend services are starting!"
echo ""
echo "🌐 Backend endpoints:"
echo "   API Gateway: http://localhost:8080"
echo "   Auth Service: http://localhost:8081"
echo "   Catalog Service: http://localhost:8082"
echo "   Cart Service: http://localhost:8083"
echo "   Order Service: http://localhost:8084"
echo "   Payment Service: http://localhost:8085"
echo "   RabbitMQ Management: http://localhost:15672 (guest/guest)"
echo ""

# Check if frontend node_modules exists
if [ ! -d "frontend/node_modules" ]; then
    echo "📦 Installing frontend dependencies..."
    cd frontend
    npm install
    cd ..
fi

# Start frontend
echo "🎨 Starting frontend development server..."
echo ""
cd frontend

# Set API URL for local development
export VITE_API_BASE_URL=http://localhost:8080

echo "Starting Vite dev server..."
echo "Frontend will be available at: http://localhost:5173"
echo ""
echo "Press Ctrl+C to stop all services"
echo ""

# Start frontend dev server
npm run dev

