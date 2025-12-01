# RabbitMQ Setup Guide

## 🔧 Issue Fixed

The error `NOT_FOUND - no exchange 'order-exchange'` has been resolved by:
1. Creating `RabbitMQConfig` class that auto-creates the exchange
2. Adding error handling so order creation doesn't fail if RabbitMQ is unavailable

## 🚀 Quick Setup

### Option 1: Use Docker (Recommended)
```bash
docker run -d --name rabbitmq \
  -p 5672:5672 \
  -p 15672:15672 \
  rabbitmq:3-management-alpine
```

### Option 2: Install Locally (macOS)
```bash
brew install rabbitmq
brew services start rabbitmq
```

### Option 3: Skip RabbitMQ (For Development)
The order service will work even if RabbitMQ is not running - it will just log a warning when trying to publish events.

## ✅ Verify RabbitMQ is Running

**Check if running:**
```bash
# Check process
ps aux | grep rabbitmq

# Or check management UI
curl http://localhost:15672
```

**Access Management UI:**
- URL: http://localhost:15672
- Username: `guest`
- Password: `guest`

## 📊 What Was Created

### RabbitMQ Exchange & Queue
- **Exchange**: `order-exchange` (Topic exchange)
- **Queue**: `order-created-queue`
- **Routing Key**: `order.created`

These are automatically created when the order-service starts.

## 🔍 Verify Exchange Exists

**Via Management UI:**
1. Go to http://localhost:15672
2. Login with `guest`/`guest`
3. Click "Exchanges" tab
4. Look for `order-exchange`

**Via Command Line:**
```bash
# If you have rabbitmqadmin installed
rabbitmqadmin list exchanges
```

## 🐛 Troubleshooting

### Error: "Connection refused"
- RabbitMQ is not running
- Start it: `brew services start rabbitmq` or use Docker

### Error: "Exchange not found"
- The `RabbitMQConfig` should auto-create it
- Restart the order-service
- Check logs for any errors

### Order Service Works Without RabbitMQ
- Orders will still be created successfully
- You'll see a warning in logs about RabbitMQ
- This is fine for development/testing

## 📝 Current Status

✅ **Fixed:**
- RabbitMQ exchange auto-creation
- Error handling for RabbitMQ failures
- Order service works even if RabbitMQ is down

The order-service should now start successfully!

