#!/bin/bash

# Script to create a backup zip of the project for local development
# Excludes build artifacts, dependencies, and git files

set -e

PROJECT_DIR="/Users/sravankumarbodakonda/Documents/SmartClient360/GROCERYSTOREAPP"
BACKUP_NAME="GROCERYSTOREAPP-backup-$(date +%Y%m%d-%H%M%S)"
TEMP_DIR="/tmp/$BACKUP_NAME"
ZIP_FILE="$PROJECT_DIR/$BACKUP_NAME.zip"

echo "📦 Creating project backup..."
echo ""

# Create temporary directory
mkdir -p "$TEMP_DIR"

# Copy project files, excluding unnecessary directories
echo "Copying project files..."
rsync -av \
    --exclude='node_modules' \
    --exclude='target' \
    --exclude='.git' \
    --exclude='.idea' \
    --exclude='.vscode' \
    --exclude='*.class' \
    --exclude='*.jar' \
    --exclude='*.war' \
    --exclude='*.log' \
    --exclude='dist' \
    --exclude='build' \
    --exclude='.DS_Store' \
    --exclude='*.iml' \
    --exclude='.gradle' \
    --exclude='.mvn' \
    --exclude='*.zip' \
    --exclude='*.tar.gz' \
    --exclude='docker-compose.override.yml' \
    --exclude='.env' \
    --exclude='*.swp' \
    --exclude='*.swo' \
    --exclude='*~' \
    "$PROJECT_DIR/" "$TEMP_DIR/"

# Create a README for the backup
cat > "$TEMP_DIR/BACKUP_README.md" << 'EOF'
# Grocery Store App - Backup Package

This is a backup of the Grocery Store Application project.

## 📋 Contents

- **backend/**: All backend microservices (auth, catalog, cart, order, payment, api-gateway)
- **frontend/**: React frontend application
- **docker-compose.yml**: Docker configuration for local development
- **Documentation files**: Setup guides and deployment documentation

## 🚀 Quick Start

### Prerequisites
- Java 17
- Node.js 18+ and npm
- Docker and Docker Compose (optional)
- PostgreSQL 15 (or use Docker)
- RabbitMQ (or use Docker)

### Option 1: Run with Docker (Easiest)

```bash
# Start all services with Docker
docker-compose up -d

# Services will be available at:
# - Frontend: http://localhost:3000
# - API Gateway: http://localhost:8080
# - Auth Service: http://localhost:8081
# - Catalog Service: http://localhost:8082
# - Cart Service: http://localhost:8083
# - Order Service: http://localhost:8084
# - Payment Service: http://localhost:8085
```

### Option 2: Run Services Locally

#### 1. Set up Databases

Using Docker:
```bash
docker-compose up -d postgres-auth postgres-catalog postgres-cart postgres-order postgres-payment rabbitmq
```

Or install PostgreSQL and RabbitMQ locally.

#### 2. Install Frontend Dependencies

```bash
cd frontend
npm install
```

#### 3. Start Backend Services

In separate terminals:

```bash
# Terminal 1 - Auth Service
cd backend/auth-service
./run.sh

# Terminal 2 - Catalog Service
cd backend/catalog-service
./run.sh

# Terminal 3 - Cart Service
cd backend/cart-service
./run.sh

# Terminal 4 - Order Service
cd backend/order-service
./run.sh

# Terminal 5 - Payment Service
cd backend/payment-service
./run.sh

# Terminal 6 - API Gateway
cd backend/api-gateway
./run.sh
```

#### 4. Start Frontend

```bash
cd frontend
npm run dev
```

## 📝 Configuration

### Environment Variables

Backend services use environment variables or defaults in `application.yml`:
- `DB_HOST`: Database host (default: localhost)
- `DB_PORT`: Database port (default: 5432)
- `DB_NAME`: Database name (service-specific)
- `DB_USER`: Database user
- `DB_PASSWORD`: Database password
- `RABBITMQ_HOST`: RabbitMQ host (default: localhost)
- `RABBITMQ_PORT`: RabbitMQ port (default: 5672)
- `JWT_SECRET`: JWT secret key (same for all services)

### Frontend Environment Variables

Create `.env` file in `frontend/`:
```
VITE_API_BASE_URL=http://localhost:8080
VITE_STRIPE_PUBLIC_KEY=your_stripe_public_key
```

## 📚 Documentation

See the following files for detailed setup:
- `README.md`: Main project documentation
- `HOW_TO_RUN.md`: Detailed run instructions
- `QUICK_START.md`: Quick start guide
- `DATABASE_SETUP.md`: Database setup guide

## 🔧 Troubleshooting

### Port Already in Use
If you get "port already in use" errors:
1. Stop Docker containers: `docker-compose down`
2. Or change ports in `application.yml` files

### Database Connection Errors
1. Verify PostgreSQL is running
2. Check database credentials in `application.yml`
3. Ensure databases are created

### Frontend Build Errors
1. Delete `node_modules` and `package-lock.json`
2. Run `npm install` again
3. Check Node.js version (should be 18+)

## 📦 Backup Information

- **Created**: $(date)
- **Project Version**: Latest
- **Excluded**: node_modules, target, .git, build artifacts

---

For more help, check the documentation files in the project root.
EOF

# Replace date placeholder
sed -i '' "s/\$(date)/$(date)/" "$TEMP_DIR/BACKUP_README.md"

# Create zip file
echo ""
echo "Creating zip file..."
cd /tmp
zip -r "$ZIP_FILE" "$BACKUP_NAME" -q

# Clean up temp directory
rm -rf "$TEMP_DIR"

# Get file size
FILE_SIZE=$(du -h "$ZIP_FILE" | cut -f1)

echo ""
echo "✅ Backup created successfully!"
echo ""
echo "📦 File: $ZIP_FILE"
echo "📊 Size: $FILE_SIZE"
echo ""
echo "💡 You can now transfer this zip file to another machine and extract it."
echo "   After extraction, follow the instructions in BACKUP_README.md"
