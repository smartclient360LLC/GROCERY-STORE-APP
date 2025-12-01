# India Foods - Complete Project Documentation

## 📋 Table of Contents
1. [Project Overview](#project-overview)
2. [Architecture & Technologies](#architecture--technologies)
3. [Project Structure](#project-structure)
4. [Services Breakdown](#services-breakdown)
5. [Database Schema](#database-schema)
6. [Features Implemented](#features-implemented)
7. [How to Run the Project](#how-to-run-the-project)
8. [Accessing Features](#accessing-features)
9. [API Endpoints](#api-endpoints)
10. [Configuration](#configuration)
11. [User Roles & Permissions](#user-roles--permissions)
12. [Troubleshooting](#troubleshooting)

---

## 🎯 Project Overview

**India Foods** is a full-stack grocery store e-commerce application with:
- **Frontend**: React-based customer and admin interfaces
- **Backend**: Java Spring Boot microservices architecture
- **Database**: PostgreSQL (one database per service)
- **Payment**: Stripe integration for online payments
- **Messaging**: RabbitMQ for asynchronous communication
- **Authentication**: JWT-based with role-based access control (RBAC)

### Key Features
- ✅ Customer product browsing and shopping cart
- ✅ Online ordering with delivery point selection
- ✅ Minimum order requirements ($50 for meat, $100 for grocery)
- ✅ Stripe payment processing
- ✅ Admin dashboard for order management
- ✅ POS (Point of Sale) system for offline sales
- ✅ Sales reporting (daily/monthly, by payment method)
- ✅ Product and category management (CRUD)
- ✅ Customer name display for admin orders
- ✅ Order notifications and printable order details

---

## 🏗️ Architecture & Technologies

### Frontend Stack
- **Framework**: React 18+ (Vite)
- **Routing**: React Router v6
- **State Management**: React Context API (AuthContext, CartContext)
- **HTTP Client**: Axios
- **Payment**: Stripe React SDK
- **Styling**: CSS3 with CSS Variables
- **Build Tool**: Vite

### Backend Stack
- **Language**: Java 17
- **Framework**: Spring Boot 3.2.0
- **Build Tool**: Maven
- **Database**: PostgreSQL 15
- **ORM**: Spring Data JPA / Hibernate
- **Migrations**: Flyway
- **Security**: Spring Security + JWT
- **Messaging**: RabbitMQ
- **API Gateway**: Spring Cloud Gateway
- **Code Generation**: Lombok

### Infrastructure
- **Database**: PostgreSQL (local or Docker)
- **Message Broker**: RabbitMQ
- **Payment Gateway**: Stripe
- **Development**: Local development environment

---

## 📁 Project Structure

```
DemoProject/
├── frontend/                          # React Frontend Application
│   ├── public/
│   │   ├── favicon.svg                # G HD Logo Favicon
│   │   └── favicon.ico
│   ├── src/
│   │   ├── components/                 # Reusable Components
│   │   │   ├── Navbar.jsx            # Navigation Bar
│   │   │   ├── Footer.jsx             # Footer with Contact Info
│   │   │   ├── SuccessModal.jsx       # Success Message Modal
│   │   │   └── ProtectedRoute.jsx    # Route Protection
│   │   ├── context/                   # React Context Providers
│   │   │   ├── AuthContext.jsx       # Authentication State
│   │   │   └── CartContext.jsx       # Shopping Cart State
│   │   ├── pages/                     # Page Components
│   │   │   ├── Home.jsx               # Landing Page
│   │   │   ├── ProductList.jsx        # Product Catalog
│   │   │   ├── ProductDetails.jsx     # Product Detail View
│   │   │   ├── Cart.jsx               # Shopping Cart
│   │   │   ├── Checkout.jsx           # Checkout Process
│   │   │   ├── Login.jsx              # User Login
│   │   │   ├── Register.jsx           # User Registration
│   │   │   ├── OrderHistory.jsx       # Customer Order History
│   │   │   ├── AdminDashboard.jsx     # Admin Main Dashboard
│   │   │   ├── AdminOrderDetails.jsx  # Admin Order View/Print
│   │   │   ├── AdminProductManagement.jsx  # Product CRUD
│   │   │   ├── CategoryManagement.jsx # Category CRUD
│   │   │   ├── PosCounter.jsx         # POS/Cash Counter
│   │   │   └── SalesReports.jsx       # Sales Reports
│   │   ├── App.jsx                    # Main App Component
│   │   ├── main.jsx                   # Entry Point
│   │   └── index.css                  # Global Styles
│   ├── package.json
│   └── vite.config.js
│
├── backend/                           # Microservices Backend
│   ├── api-gateway/                   # API Gateway Service (Port 8087)
│   │   ├── src/main/java/com/grocerystore/gateway/
│   │   └── src/main/resources/application.yml
│   │
│   ├── auth-service/                   # Authentication Service (Port 8081)
│   │   ├── src/main/java/com/grocerystore/auth/
│   │   │   ├── controller/AuthController.java
│   │   │   ├── service/AuthService.java
│   │   │   ├── model/User.java
│   │   │   ├── util/JwtUtil.java
│   │   │   └── config/SecurityConfig.java
│   │   └── src/main/resources/
│   │       ├── application.yml
│   │       └── db/migration/          # Flyway Migrations
│   │
│   ├── catalog-service/                # Product Catalog Service (Port 8084)
│   │   ├── src/main/java/com/grocerystore/catalog/
│   │   │   ├── controller/CatalogController.java
│   │   │   ├── service/CatalogService.java
│   │   │   ├── model/Product.java, Category.java
│   │   │   └── repository/
│   │   └── src/main/resources/
│   │       ├── application.yml
│   │       └── db/migration/
│   │
│   ├── cart-service/                  # Shopping Cart Service (Port 8083)
│   │   ├── src/main/java/com/grocerystore/cart/
│   │   └── src/main/resources/
│   │
│   ├── order-service/                 # Order Management Service (Port 8085)
│   │   ├── src/main/java/com/grocerystore/order/
│   │   │   ├── controller/OrderController.java
│   │   │   ├── service/OrderService.java
│   │   │   ├── model/Order.java, ShippingAddress.java
│   │   │   └── config/RabbitMQConfig.java
│   │   └── src/main/resources/
│   │
│   └── payment-service/               # Payment Processing Service (Port 8086)
│       ├── src/main/java/com/grocerystore/payment/
│       │   ├── controller/PaymentController.java
│       │   └── service/PaymentService.java
│       └── src/main/resources/
│
└── Documentation Files
    ├── COMPLETE_PROJECT_DOCUMENTATION.md  # This file
    ├── HOW_TO_RUN.md
    ├── RBAC_IMPLEMENTATION.md
    ├── STRIPE_SETUP.md
    └── ... (other guides)
```

---

## 🔧 Services Breakdown

### 1. API Gateway (Port 8087)
**Purpose**: Single entry point for all frontend requests
- Routes requests to appropriate microservices
- Handles CORS
- No authentication (delegates to services)

**Routes**:
- `/api/auth/**` → auth-service (8081)
- `/api/catalog/**` → catalog-service (8084)
- `/api/cart/**` → cart-service (8083)
- `/api/orders/**` → order-service (8085)
- `/api/payments/**` → payment-service (8086)

### 2. Auth Service (Port 8081)
**Purpose**: User authentication and authorization
- User registration and login
- JWT token generation
- User profile management
- Role-based access (CUSTOMER, ADMIN)

**Database**: `grocerystore_auth`
**Tables**: `users`, `flyway_schema_history`

### 3. Catalog Service (Port 8084)
**Purpose**: Product and category management
- Product CRUD operations
- Category CRUD operations
- Product search and filtering
- Availability management

**Database**: `grocerystore_catalog`
**Tables**: `products`, `categories`, `flyway_schema_history`

**Features**:
- Product codes (unique identifiers)
- Active/inactive status
- Stock quantity management
- Category-based filtering

### 4. Cart Service (Port 8083)
**Purpose**: Shopping cart management
- Add/remove items
- Update quantities
- Calculate totals
- Per-user cart isolation

**Database**: `grocerystore_cart`
**Tables**: `carts`, `cart_items`, `flyway_schema_history`

### 5. Order Service (Port 8085)
**Purpose**: Order processing and management
- Create orders (online and POS)
- Order status management
- Sales reporting
- Delivery point tracking

**Database**: `grocerystore_order`
**Tables**: `orders`, `order_items`, `flyway_schema_history`

**Features**:
- Online vs POS order tracking
- Payment method tracking (CASH, CREDIT_CARD, DEBIT_CARD, QR_CODE, ONLINE)
- Delivery point selection
- Sales reports (daily/monthly, by payment method)

### 6. Payment Service (Port 8086)
**Purpose**: Payment processing
- Stripe payment intent creation
- Webhook handling for payment confirmation
- Payment status tracking

**Database**: `grocerystore_payment`
**Tables**: `payments`, `flyway_schema_history`

---

## 🗄️ Database Schema

### Auth Service Database (`grocerystore_auth`)
```sql
users
├── id (BIGSERIAL PRIMARY KEY)
├── email (VARCHAR UNIQUE NOT NULL)
├── password (VARCHAR NOT NULL) -- BCrypt hashed
├── first_name (VARCHAR NOT NULL)
├── last_name (VARCHAR NOT NULL)
├── role (ENUM: CUSTOMER, ADMIN)
├── enabled (BOOLEAN DEFAULT true)
├── created_at (TIMESTAMP)
└── updated_at (TIMESTAMP)
```

**Seed Data**:
- Admin: `admin@indiafoods.com` / `admin123` (Role: ADMIN)
- Customer: `customer@test.com` / `customer123` (Role: CUSTOMER)

### Catalog Service Database (`grocerystore_catalog`)
```sql
categories
├── id (BIGSERIAL PRIMARY KEY)
├── name (VARCHAR UNIQUE NOT NULL)
├── description (TEXT)
├── created_at (TIMESTAMP)
└── updated_at (TIMESTAMP)

products
├── id (BIGSERIAL PRIMARY KEY)
├── name (VARCHAR NOT NULL)
├── description (TEXT)
├── price (DECIMAL(10,2) NOT NULL)
├── stock_quantity (INTEGER DEFAULT 0)
├── image_url (VARCHAR(500))
├── product_code (VARCHAR UNIQUE) -- Optional unique identifier
├── category_id (BIGINT FOREIGN KEY → categories.id)
├── active (BOOLEAN DEFAULT true)
├── created_at (TIMESTAMP)
└── updated_at (TIMESTAMP)
```

**Categories**: Groceries, Meat, Dairy, etc.
**Products**: Pre-seeded with sample products including meat items

### Cart Service Database (`grocerystore_cart`)
```sql
carts
├── id (BIGSERIAL PRIMARY KEY)
├── user_id (BIGINT NOT NULL)
├── created_at (TIMESTAMP)
└── updated_at (TIMESTAMP)

cart_items
├── id (BIGSERIAL PRIMARY KEY)
├── cart_id (BIGINT FOREIGN KEY → carts.id)
├── product_id (BIGINT NOT NULL)
├── product_name (VARCHAR NOT NULL)
├── price (DECIMAL(10,2) NOT NULL)
├── quantity (INTEGER NOT NULL)
└── subtotal (DECIMAL(10,2) NOT NULL)
```

### Order Service Database (`grocerystore_order`)
```sql
orders
├── id (BIGSERIAL PRIMARY KEY)
├── order_number (VARCHAR UNIQUE NOT NULL) -- Auto-generated
├── user_id (BIGINT) -- NULL for POS orders
├── status (ENUM: PENDING, CONFIRMED, PROCESSING, SHIPPED, DELIVERED, CANCELLED)
├── payment_method (ENUM: CASH, CREDIT_CARD, DEBIT_CARD, QR_CODE, ONLINE)
├── is_pos_order (BOOLEAN DEFAULT false)
├── total_amount (DECIMAL(10,2) NOT NULL)
├── shipping_address (JSON/Embedded) -- street, city, state, zipCode, country, deliveryPoint
├── created_at (TIMESTAMP)
└── updated_at (TIMESTAMP)

order_items
├── id (BIGSERIAL PRIMARY KEY)
├── order_id (BIGINT FOREIGN KEY → orders.id)
├── product_id (BIGINT NOT NULL)
├── product_name (VARCHAR NOT NULL)
├── price (DECIMAL(10,2) NOT NULL)
├── quantity (INTEGER NOT NULL)
└── subtotal (DECIMAL(10,2) NOT NULL)
```

### Payment Service Database (`grocerystore_payment`)
```sql
payments
├── id (BIGSERIAL PRIMARY KEY)
├── order_number (VARCHAR NOT NULL)
├── user_id (BIGINT NOT NULL)
├── amount (DECIMAL(10,2) NOT NULL)
├── currency (VARCHAR DEFAULT 'usd')
├── payment_method (ENUM: CASH, CREDIT_CARD, DEBIT_CARD, QR_CODE, ONLINE)
├── status (ENUM: PENDING, COMPLETED, FAILED)
├── stripe_payment_intent_id (VARCHAR)
├── created_at (TIMESTAMP)
└── updated_at (TIMESTAMP)
```

---

## ✨ Features Implemented

### Customer Features
1. **Product Browsing**
   - View all available products
   - Filter by category
   - Search by product name or code
   - Product details with images

2. **Shopping Cart**
   - Add/remove items
   - Update quantities
   - Real-time cart count badge
   - Minimum order validation display

3. **Checkout Process**
   - Delivery point selection (Lehi, Herriman, Saratoga Springs)
   - Shipping address input
   - Minimum order validation:
     - $50 minimum for meat products
     - $100 minimum for grocery products
   - Stripe card payment integration
   - Order confirmation

4. **Order History**
   - View past orders
   - Order status tracking
   - Order details

### Admin Features
1. **Dashboard**
   - Overview of products, categories, and orders
   - New order notifications (badge count)
   - Filter orders (All, Online, POS)
   - Customer name display for online orders

2. **Product Management**
   - Create, Read, Update, Delete products
   - Product code management (unique codes)
   - Image URL management
   - Stock quantity management
   - Active/inactive status toggle
   - Category assignment

3. **Category Management**
   - Create, Read, Update, Delete categories
   - Category description management

4. **Order Management**
   - View all orders (online and POS)
   - Filter by order type
   - View customer details for online orders
   - Printable order details page
   - Order status updates

5. **POS System**
   - Offline sales processing
   - Multiple payment methods:
     - Cash
     - Credit Card
     - Debit Card
     - QR Code
   - Real-time order creation

6. **Sales Reports**
   - Daily sales reports
   - Monthly sales reports
   - Breakdown by payment method:
     - Online sales
     - POS Cash sales
     - POS Card sales
     - POS QR sales

### System Features
1. **Authentication & Authorization**
   - JWT-based authentication
   - Role-based access control (RBAC)
   - Protected routes
   - Admin-only endpoints

2. **Payment Integration**
   - Stripe Checkout integration
   - Payment webhook handling
   - Payment status tracking

3. **Messaging**
   - RabbitMQ for async communication
   - Order creation events
   - Payment confirmation events

---

## 🚀 How to Run the Project

### Prerequisites
1. **Java 17** (not Java 23)
   ```bash
   # Check version
   java -version
   
   # If Java 23, install Java 17:
   brew install openjdk@17
   export JAVA_HOME=/opt/homebrew/opt/openjdk@17/libexec/openjdk.jdk/Contents/Home
   ```

2. **PostgreSQL 15**
   ```bash
   # Check if running
   brew services list | grep postgresql
   
   # Start if not running
   brew services start postgresql@15
   ```

3. **RabbitMQ**
   ```bash
   # Install and start
   brew install rabbitmq
   brew services start rabbitmq
   ```

4. **Node.js & npm**
   ```bash
   node --version  # Should be 16+
   npm --version
   ```

### Step 1: Database Setup

Create databases for each service:
```bash
# Using your system username (sravankumarbodakonda)
createdb -U sravankumarbodakonda grocerystore_auth
createdb -U sravankumarbodakonda grocerystore_catalog
createdb -U sravankumarbodakonda grocerystore_cart
createdb -U sravankumarbodakonda grocerystore_order
createdb -U sravankumarbodakonda grocerystore_payment
```

**Note**: Flyway will automatically create tables and seed data on first run.

### Step 2: Configure Environment Variables

Create `.env` file in `frontend/`:
```env
VITE_STRIPE_PUBLIC_KEY=pk_test_your_stripe_public_key
```

Backend services use environment variables or defaults in `application.yml`:
- `DB_USER`: Defaults to `sravankumarbodakonda`
- `DB_PASSWORD`: Defaults to empty (set if needed)
- `JWT_SECRET`: Defaults to a test secret (change in production)
- `STRIPE_SECRET_KEY`: Set in `payment-service/application.yml`

### Step 3: Start Backend Services

**Option A: Using run.sh scripts (Recommended)**
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

**Option B: Using Maven directly**
```bash
# Each service in separate terminal
cd backend/[service-name]
mvn spring-boot:run
```

**Service Ports**:
- Auth Service: `http://localhost:8081`
- Catalog Service: `http://localhost:8084`
- Cart Service: `http://localhost:8083`
- Order Service: `http://localhost:8085`
- Payment Service: `http://localhost:8086`
- API Gateway: `http://localhost:8087`

### Step 4: Start Frontend

```bash
cd frontend
npm install  # First time only
npm run dev
```

Frontend runs on: `http://localhost:3000` or `http://localhost:5173`

---

## 🎯 Accessing Features

### Customer Access

1. **Home Page**: `http://localhost:3000/`
   - Landing page with hero section
   - Features overview
   - "Shop Now" button

2. **Products**: `http://localhost:3000/products`
   - Browse all products
   - Filter by category
   - Search by name or code
   - Click product to view details

3. **Product Details**: `http://localhost:3000/products/:id`
   - View full product information
   - Add to cart
   - Back button to products

4. **Shopping Cart**: `http://localhost:3000/cart`
   - View cart items
   - Update quantities
   - Remove items
   - Proceed to checkout
   - Minimum order validation display

5. **Checkout**: `http://localhost:3000/checkout`
   - Select delivery point
   - Enter shipping address
   - Enter card details (Stripe)
   - Place order

6. **Order History**: `http://localhost:3000/orders`
   - View past orders
   - Order status

7. **Login/Register**: `http://localhost:3000/login` or `/register`
   - Create account or login
   - Default admin: `admin@indiafoods.com` / `admin123`
   - Default customer: `customer@test.com` / `customer123`

### Admin Access

1. **Admin Dashboard**: `http://localhost:3000/admin`
   - Main admin interface
   - Tabs: Products, Categories, Orders
   - Quick links to POS, Sales Reports, Product Management
   - New order notifications

2. **Product Management**: 
   - From dashboard: Click "Add New Menu Item" or "Edit" on product
   - Direct: `http://localhost:3000/admin/products/new`
   - Edit: `http://localhost:3000/admin/products/:id/edit`

3. **Category Management**:
   - From dashboard: Categories tab → "Add New Category" or "Edit"
   - Direct: `http://localhost:3000/admin/categories/new`
   - Edit: `http://localhost:3000/admin/categories/:id/edit`

4. **Order Details**: `http://localhost:3000/admin/orders/:id`
   - View full order information
   - Customer details (for online orders)
   - Print order details
   - Update order status

5. **POS Counter**: `http://localhost:3000/admin/pos`
   - Process offline sales
   - Select payment method (Cash, Card, QR)
   - Create POS orders

6. **Sales Reports**: `http://localhost:3000/admin/sales`
   - Daily sales reports
   - Monthly sales reports
   - Breakdown by payment method

---

## 🔌 API Endpoints

### Auth Service (`http://localhost:8081`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/register` | Register new user | No |
| POST | `/api/auth/login` | Login user | No |
| GET | `/api/auth/users/{userId}` | Get user by ID | Admin |

### Catalog Service (`http://localhost:8084`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/catalog/products` | Get all available products | No |
| GET | `/api/catalog/products/admin/all` | Get all products (admin) | Admin |
| GET | `/api/catalog/products/{id}` | Get product by ID | No |
| GET | `/api/catalog/products/{id}/admin` | Get product (admin, any status) | Admin |
| GET | `/api/catalog/products/category/{categoryId}` | Get products by category | No |
| POST | `/api/catalog/products` | Create product | Admin |
| PUT | `/api/catalog/products/{id}` | Update product | Admin |
| DELETE | `/api/catalog/products/{id}` | Delete product | Admin |
| GET | `/api/catalog/categories` | Get all categories | No |
| GET | `/api/catalog/categories/{id}` | Get category by ID | No |
| POST | `/api/catalog/categories` | Create category | Admin |
| PUT | `/api/catalog/categories/{id}` | Update category | Admin |
| DELETE | `/api/catalog/categories/{id}` | Delete category | Admin |

### Cart Service (`http://localhost:8083`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/cart/{userId}` | Get user's cart | User |
| POST | `/api/cart/{userId}/items` | Add item to cart | User |
| PUT | `/api/cart/{userId}/items/{itemId}` | Update cart item quantity | User |
| DELETE | `/api/cart/{userId}/items/{itemId}` | Remove item from cart | User |
| DELETE | `/api/cart/{userId}` | Clear cart | User |

### Order Service (`http://localhost:8085`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/orders` | Create order | User/Admin |
| GET | `/api/orders/{id}` | Get order by ID | User/Admin |
| GET | `/api/orders/user/{userId}` | Get user's orders | User |
| GET | `/api/orders/admin/all` | Get all orders (admin) | Admin |
| PUT | `/api/orders/{id}/status` | Update order status | Admin |
| POST | `/api/orders/pos` | Create POS order | Admin |
| GET | `/api/orders/reports/daily` | Get daily sales report | Admin |
| GET | `/api/orders/reports/monthly` | Get monthly sales report | Admin |

### Payment Service (`http://localhost:8086`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/payments/create-intent` | Create Stripe payment intent | User |
| POST | `/api/payments/webhook` | Stripe webhook handler | No (Stripe signature) |

**Note**: All requests go through API Gateway at `http://localhost:8087`

---

## ⚙️ Configuration

### Frontend Configuration

**File**: `frontend/vite.config.js`
```javascript
export default {
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:8087',  // API Gateway
        changeOrigin: true
      }
    }
  }
}
```

**File**: `frontend/.env`
```env
VITE_STRIPE_PUBLIC_KEY=pk_test_51QxX4UK840hddnWYszVWwwBF7D3AAk8NC0hi6qcqrH2Keioq9QY8FEhzAnXWELeRBUfO7Pspe1pkLR0KJMg3Eo8u00MZKCYO1i
```

### Backend Configuration

Each service has `application.yml` with:
- Database connection (PostgreSQL)
- Server port
- JWT secret and expiration
- RabbitMQ connection
- Service-specific settings

**Key Configuration Points**:
- Database username: `sravankumarbodakonda` (your system username)
- Database password: Empty by default (set if needed)
- JWT secret: Shared across all services (must match)
- RabbitMQ: `localhost:5672` (default)

---

## 👥 User Roles & Permissions

### CUSTOMER Role
- ✅ Browse products
- ✅ Add to cart
- ✅ Place orders
- ✅ View own order history
- ❌ Access admin features
- ❌ Create/edit products
- ❌ View all orders

### ADMIN Role
- ✅ All customer permissions
- ✅ View all orders
- ✅ Manage products (CRUD)
- ✅ Manage categories (CRUD)
- ✅ Process POS orders
- ✅ View sales reports
- ✅ Update order status
- ✅ View customer details

**Default Admin Account**:
- Email: `admin@indiafoods.com`
- Password: `admin123`
- Role: `ADMIN`

**Default Customer Account**:
- Email: `customer@test.com`
- Password: `customer123`
- Role: `CUSTOMER`

---

## 🔍 Where to Find Things

### Viewing Database

**Option 1: Using psql**
```bash
psql -U sravankumarbodakonda -d grocerystore_catalog
# Then: \dt (list tables), SELECT * FROM products;
```

**Option 2: Using TablePlus**
1. Download TablePlus
2. Create new PostgreSQL connection
3. Host: `localhost`
4. Port: `5432`
5. User: `sravankumarbodakonda`
6. Database: Select one (e.g., `grocerystore_catalog`)
7. Connect

**Option 3: Using view-db.sh script**
```bash
./view-db.sh grocerystore_catalog
```

### Viewing Logs

**Backend Services**: Logs appear in terminal where service is running
- Look for "Started [ServiceName]Application" message
- Errors will be displayed in red
- Debug logs enabled for `com.grocerystore` package

**Frontend**: Open browser DevTools (F12)
- Console tab for JavaScript errors
- Network tab for API requests/responses

### Checking Service Status

**Check if services are running**:
```bash
# Check ports
lsof -i :8081  # Auth Service
lsof -i :8084  # Catalog Service
lsof -i :8083  # Cart Service
lsof -i :8085  # Order Service
lsof -i :8086  # Payment Service
lsof -i :8087  # API Gateway
lsof -i :3000  # Frontend
```

**Kill a service if needed**:
```bash
kill -9 $(lsof -t -i:8081)  # Replace 8081 with port number
```

---

## 🐛 Troubleshooting

### Common Issues

1. **"Port already in use"**
   - Solution: Kill the process using that port or change port in `application.yml`

2. **"Database connection refused"**
   - Solution: Ensure PostgreSQL is running: `brew services start postgresql@15`

3. **"JWT authentication failed"**
   - Solution: Ensure JWT secret matches across all services
   - Check token in localStorage: `localStorage.getItem('token')`

4. **"Product code already exists"**
   - Solution: Use a unique product code or leave it empty

5. **"403 Forbidden" on admin endpoints**
   - Solution: Ensure you're logged in as admin
   - Check JWT token has ADMIN role
   - Restart catalog-service after security config changes

6. **Images not loading**
   - Solution: Check image URLs in database
   - Use Unsplash URLs or upload to image hosting service

7. **Stripe payment fails**
   - Solution: Use Stripe test cards (see STRIPE_SETUP.md)
   - Ensure Stripe keys are set correctly

### Debugging Steps

1. **Check service logs** for errors
2. **Check browser console** (F12) for frontend errors
3. **Check Network tab** for API request/response details
4. **Verify database** has correct data
5. **Verify environment variables** are set
6. **Restart services** if configuration changed

---

## 📚 Additional Documentation

- **HOW_TO_RUN.md**: Detailed run instructions
- **RBAC_IMPLEMENTATION.md**: Role-based access control details
- **STRIPE_SETUP.md**: Stripe configuration guide
- **VIEW_DATABASE.md**: Database viewing instructions
- **TABLEPLUS_CONNECTION_GUIDE.md**: TablePlus setup guide

---

## 🎨 UI/UX Features

- **Color Scheme**: Orange/Amber gradient theme
- **Brand Name**: "India Foods"
- **Favicon**: G HD logo
- **Success Modals**: Animated success messages
- **Cart Badge**: Red notification badge with item count
- **Back Buttons**: Left-aligned navigation buttons
- **Footer**: Contact information and quick links
- **Responsive Design**: Works on desktop and mobile

---

## 🔐 Security Features

- JWT-based authentication
- Role-based access control (RBAC)
- Protected API endpoints
- CORS configuration
- Password hashing (BCrypt)
- SQL injection prevention (JPA)
- XSS protection (React)

---

## 📊 Business Logic

### Minimum Order Requirements
- **Meat Products**: $50 minimum
- **Grocery Products**: $100 minimum
- Validated at checkout
- Displayed in cart

### Delivery Points
- Lehi, Utah
- Herriman, Utah
- Saratoga Springs, Utah

### Payment Methods
- **Online Orders**: Card payment only (Stripe)
- **POS Orders**: Cash, Credit Card, Debit Card, QR Code

### Order Types
- **Online Orders**: Created through web app, require customer account
- **POS Orders**: Created at physical store, no customer account required

---

## 🚀 Next Steps / Future Enhancements

Potential improvements:
- Email notifications for order status
- Inventory management alerts
- Customer reviews and ratings
- Product image upload (instead of URLs)
- Order tracking with delivery updates
- Customer loyalty program
- Discount codes and promotions
- Multi-language support
- Mobile app (React Native)

---

## 📞 Support & Contact

For issues or questions:
- Check logs in service terminals
- Review browser console
- Check database for data integrity
- Refer to specific documentation files

---

**Last Updated**: November 26, 2025
**Project Status**: ✅ Fully Functional
**Version**: 1.0.0

