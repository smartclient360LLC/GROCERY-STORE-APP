# RBAC Implementation Guide

## ✅ Full Role-Based Access Control (RBAC) Implemented

This application now has **complete RBAC** with both frontend and backend enforcement.

---

## 🔐 What's Implemented

### 1. **Auth Service** (Port 8081)
- ✅ JWT token generation with role claims
- ✅ JWT authentication filter
- ✅ Method security enabled (`@EnableMethodSecurity`)
- ✅ Role extraction from JWT tokens

### 2. **Catalog Service** (Port 8084)
- ✅ JWT authentication filter
- ✅ Role-based endpoint protection
- ✅ **Public endpoints** (no auth required):
  - `GET /api/catalog/products` - View all products
  - `GET /api/catalog/products/{id}` - View product details
  - `GET /api/catalog/products/category/{categoryId}` - View products by category
  - `GET /api/catalog/categories` - View all categories
- ✅ **Admin-only endpoints** (require ADMIN role):
  - `POST /api/catalog/products` - Create product
  - `PUT /api/catalog/products/{id}` - Update product
  - `POST /api/catalog/categories` - Create category

### 3. **Frontend**
- ✅ Role checking (`isAdmin()` function)
- ✅ Protected routes with `adminOnly` prop
- ✅ Admin dashboard route protection

---

## 🔑 How It Works

### JWT Token Structure
```json
{
  "sub": "user@example.com",
  "role": "ADMIN",
  "userId": 1,
  "iat": 1234567890,
  "exp": 1234654290
}
```

### Authentication Flow
1. User logs in → receives JWT token with role
2. Frontend stores token in localStorage
3. Frontend sends token in `Authorization: Bearer <token>` header
4. Backend JWT filter extracts and validates token
5. Spring Security sets authentication with role authorities
6. `@PreAuthorize` checks role before allowing access

### Role Enforcement
- **Backend**: `@PreAuthorize("hasRole('ADMIN')")` annotations
- **Frontend**: `ProtectedRoute` component with `adminOnly` prop
- **Security**: JWT tokens validated on every request

---

## 📋 User Roles

| Role | Description | Access |
|------|-------------|--------|
| **CUSTOMER** | Regular user | Can view products, manage cart, place orders |
| **ADMIN** | Administrator | Full access including product/category management |

---

## 🧪 Testing RBAC

### Test as Customer
```bash
# 1. Login as customer
curl -X POST http://localhost:8087/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"customer1@grocerystore.com","password":"customer123"}'

# 2. Use token to view products (should work)
curl http://localhost:8087/api/catalog/products \
  -H "Authorization: Bearer <token>"

# 3. Try to create product (should fail with 403)
curl -X POST http://localhost:8087/api/catalog/products \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Product","price":10.99}'
```

### Test as Admin
```bash
# 1. Login as admin
curl -X POST http://localhost:8087/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@grocerystore.com","password":"admin123"}'

# 2. Use token to create product (should work)
curl -X POST http://localhost:8087/api/catalog/products \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"name":"New Product","price":15.99,"stockQuantity":100}'
```

---

## 🔧 Configuration

### JWT Secret
All services use the same JWT secret (configured in `application.yml`):
```yaml
jwt:
  secret: ${JWT_SECRET:your-256-bit-secret-key-change-in-production-minimum-32-characters}
  expiration: ${JWT_EXPIRATION:86400000} # 24 hours
```

**⚠️ Important**: In production, use a strong, unique secret key!

### Security Configuration
Each service has:
- `JwtAuthenticationFilter` - Extracts and validates JWT tokens
- `SecurityConfig` - Configures Spring Security with role-based access
- `@EnableMethodSecurity` - Enables `@PreAuthorize` annotations

---

## 📝 Adding RBAC to Other Services

To add RBAC to other microservices (order, cart, payment):

1. **Add dependencies** to `pom.xml`:
```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-security</artifactId>
</dependency>
<dependency>
    <groupId>io.jsonwebtoken</groupId>
    <artifactId>jjwt-api</artifactId>
    <version>0.12.3</version>
</dependency>
```

2. **Copy JWT utilities**:
   - `JwtUtil.java`
   - `JwtAuthenticationFilter.java`
   - `SecurityConfig.java`

3. **Add JWT config** to `application.yml`:
```yaml
jwt:
  secret: ${JWT_SECRET:your-256-bit-secret-key-change-in-production-minimum-32-characters}
```

4. **Add `@PreAuthorize`** to admin endpoints:
```java
@PostMapping("/orders")
@PreAuthorize("hasRole('ADMIN')")
public ResponseEntity<Order> createOrder(...) {
    // ...
}
```

---

## 🚀 Next Steps

1. **Add RBAC to other services** (order, cart, payment)
2. **Add more granular permissions** (e.g., users can only view their own orders)
3. **Implement role hierarchy** (if needed)
4. **Add audit logging** for admin actions

---

## 🔒 Security Best Practices

✅ **Implemented:**
- JWT tokens with expiration
- Role-based access control
- Password hashing (BCrypt)
- CORS configuration
- Stateless authentication

⚠️ **For Production:**
- Use strong JWT secret (minimum 256 bits)
- Enable HTTPS
- Add rate limiting
- Implement token refresh mechanism
- Add audit logging
- Use environment variables for secrets

---

## 📚 Related Files

- `backend/auth-service/src/main/java/com/grocerystore/auth/filter/JwtAuthenticationFilter.java`
- `backend/auth-service/src/main/java/com/grocerystore/auth/config/SecurityConfig.java`
- `backend/catalog-service/src/main/java/com/grocerystore/catalog/filter/JwtAuthenticationFilter.java`
- `backend/catalog-service/src/main/java/com/grocerystore/catalog/config/SecurityConfig.java`
- `frontend/src/components/ProtectedRoute.jsx`

