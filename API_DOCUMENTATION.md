# API Documentation

## Base URL
- Local: `http://localhost:8080`
- Production: `https://api.grocerystore.com`

## Authentication

Most endpoints require JWT authentication. Include the token in the Authorization header:
```
Authorization: Bearer <token>
```

## Endpoints

### Authentication Service

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "role": "CUSTOMER",
  "userId": 1
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:** Same as register response

### Catalog Service

#### Get All Products
```http
GET /api/catalog/products
```

**Response:**
```json
[
  {
    "id": 1,
    "name": "Organic Apples",
    "description": "Fresh organic red apples",
    "price": 4.99,
    "stockQuantity": 50,
    "imageUrl": "https://...",
    "categoryId": 1,
    "categoryName": "Fruits & Vegetables",
    "active": true
  }
]
```

#### Get Product by ID
```http
GET /api/catalog/products/1
```

#### Get Products by Category
```http
GET /api/catalog/products/category/1
```

#### Create Product (Admin)
```http
POST /api/catalog/products
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "name": "New Product",
  "description": "Product description",
  "price": 9.99,
  "stockQuantity": 100,
  "imageUrl": "https://...",
  "categoryId": 1
}
```

### Cart Service

#### Get Cart
```http
GET /api/cart/1
Authorization: Bearer <token>
```

**Response:**
```json
{
  "userId": 1,
  "items": [
    {
      "id": 1,
      "productId": 1,
      "productName": "Organic Apples",
      "price": 4.99,
      "quantity": 2,
      "subtotal": 9.98
    }
  ],
  "total": 9.98,
  "itemCount": 1
}
```

#### Add Item to Cart
```http
POST /api/cart/1/items?productId=1&productName=Organic%20Apples&price=4.99&quantity=2
Authorization: Bearer <token>
```

#### Update Item Quantity
```http
PUT /api/cart/1/items/1?quantity=3
Authorization: Bearer <token>
```

#### Remove Item
```http
DELETE /api/cart/1/items/1
Authorization: Bearer <token>
```

### Order Service

#### Create Order
```http
POST /api/orders
Authorization: Bearer <token>
Content-Type: application/json

{
  "userId": 1,
  "items": [
    {
      "productId": 1,
      "productName": "Organic Apples",
      "price": 4.99,
      "quantity": 2
    }
  ],
  "shippingAddress": {
    "street": "123 Main St",
    "city": "New York",
    "state": "NY",
    "zipCode": "10001",
    "country": "USA"
  }
}
```

**Response:**
```json
{
  "id": 1,
  "orderNumber": "ORD-ABC12345",
  "userId": 1,
  "items": [...],
  "totalAmount": 9.98,
  "status": "PENDING",
  "shippingAddress": {...},
  "createdAt": "2024-01-01T12:00:00",
  "updatedAt": "2024-01-01T12:00:00"
}
```

#### Get User Orders
```http
GET /api/orders/user/1
Authorization: Bearer <token>
```

### Payment Service

#### Create Payment Intent
```http
POST /api/payments/create-intent
Authorization: Bearer <token>
Content-Type: application/json

{
  "orderNumber": "ORD-ABC12345",
  "userId": 1,
  "amount": 9.98,
  "currency": "usd"
}
```

**Response:**
```json
{
  "clientSecret": "pi_xxx_secret_xxx",
  "paymentIntentId": "pi_xxx",
  "orderNumber": "ORD-ABC12345"
}
```

#### Stripe Webhook
```http
POST /api/payments/webhook
Stripe-Signature: <signature>
Content-Type: application/json

<Stripe event payload>
```

## Error Responses

### 400 Bad Request
```json
{
  "error": "Validation failed",
  "message": "Email is required"
}
```

### 401 Unauthorized
```json
{
  "error": "Unauthorized",
  "message": "Invalid token"
}
```

### 404 Not Found
```json
{
  "error": "Not Found",
  "message": "Resource not found"
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal Server Error",
  "message": "An unexpected error occurred"
}
```

## Order Status Values

- `PENDING` - Order created, awaiting payment
- `CONFIRMED` - Payment confirmed, order confirmed
- `PROCESSING` - Order being prepared
- `SHIPPED` - Order shipped
- `DELIVERED` - Order delivered
- `CANCELLED` - Order cancelled

## Payment Status Values

- `PENDING` - Payment initiated
- `PROCESSING` - Payment being processed
- `SUCCEEDED` - Payment successful
- `FAILED` - Payment failed
- `REFUNDED` - Payment refunded

