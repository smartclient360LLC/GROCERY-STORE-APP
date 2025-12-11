# Update CORS for Production

After deploying, update CORS in all backend services to allow your production domain.

## Files to Update

### 1. API Gateway
**File:** `backend/api-gateway/src/main/resources/application.yml`

```yaml
globalcors:
  corsConfigurations:
    '[/**]':
      allowedOrigins:
        - "https://yourdomain.com"
        - "https://www.yourdomain.com"
        - "https://main.xxxxx.amplifyapp.com"  # Amplify default domain
        - "http://localhost:3000"  # Keep for local dev
        - "http://localhost:5173"  # Keep for local dev
```

### 2. Auth Service
**File:** `backend/auth-service/src/main/java/com/grocerystore/auth/config/SecurityConfig.java`

```java
@Bean
public CorsConfigurationSource corsConfigurationSource() {
    CorsConfiguration configuration = new CorsConfiguration();
    configuration.setAllowedOrigins(List.of(
        "https://yourdomain.com",
        "https://www.yourdomain.com",
        "https://main.xxxxx.amplifyapp.com",
        "http://localhost:3000",
        "http://localhost:5173"
    ));
    // ... rest of config
}
```

### 3. Catalog Service
**File:** `backend/catalog-service/src/main/java/com/grocerystore/catalog/config/SecurityConfig.java`
- Same update as auth-service

### 4. Cart Service
**File:** `backend/cart-service/src/main/java/com/grocerystore/cart/controller/CartController.java`
- Update `@CrossOrigin` annotation

### 5. Order Service
**File:** `backend/order-service/src/main/java/com/grocerystore/order/config/SecurityConfig.java`
- Same update as auth-service

### 6. Payment Service
**File:** `backend/payment-service/src/main/java/com/grocerystore/payment/controller/PaymentController.java`
- Update `@CrossOrigin` annotation

## After Updating

1. Rebuild Docker images
2. Push to ECR
3. Update ECS task definitions
4. Redeploy services

