#!/bin/bash

echo "🚀 Starting Grocery Store Application..."
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

echo "🐳 Starting all services with Docker Compose..."
docker-compose up -d

echo ""
echo "⏳ Waiting for services to start (this may take 1-2 minutes)..."
sleep 10

echo ""
echo "📊 Checking service status..."
docker-compose ps

echo ""
echo "✅ Services are starting!"
echo ""
echo "🌐 Access the application at:"
echo "   Frontend:  http://localhost:3000"
echo "   API Gateway: http://localhost:8080"
echo "   RabbitMQ:  http://localhost:15672 (guest/guest)"
echo ""
echo "👤 Test Credentials:"
echo "   Admin:    admin@grocerystore.com / admin123"
echo "   Customer: customer1@grocerystore.com / customer123"
echo ""
echo "📝 View logs with: docker-compose logs -f"
echo "🛑 Stop services with: docker-compose down"
