# Troubleshooting: Products Not Showing Before Login

## 🔍 Issue
Products are not displaying on the `/products` page when user is not logged in.

## ✅ Expected Behavior
Products should be visible to everyone (logged in or not) because:
- The `/products` route is **public** (not wrapped in `ProtectedRoute`)
- The API endpoint `/api/catalog/products` is configured as `permitAll()` in security config
- No authentication token is required for viewing products

## 🛠️ Troubleshooting Steps

### Step 1: Check if Services are Running

**Check API Gateway (Port 8087):**
```bash
lsof -i :8087
# Should show: java process listening on port 8087
```

**Check Catalog Service (Port 8084):**
```bash
lsof -i :8084
# Should show: java process listening on port 8084
```

**If services are not running:**
```bash
# Start API Gateway
cd backend/api-gateway
./run.sh

# Start Catalog Service (in another terminal)
cd backend/catalog-service
./run.sh
```

### Step 2: Test API Endpoints Directly

**Test API Gateway routing:**
```bash
curl http://localhost:8087/api/catalog/products
# Should return JSON array of products
```

**Test Catalog Service directly:**
```bash
curl http://localhost:8084/api/catalog/products
# Should return JSON array of products
```

**Expected Response:**
```json
[
  {
    "id": 1,
    "name": "Product Name",
    "price": 10.99,
    ...
  }
]
```

### Step 3: Check Browser Console

1. Open browser DevTools (F12)
2. Go to **Console** tab
3. Navigate to `/products` page
4. Look for:
   - `Fetching products from: /api/catalog/products`
   - `Products response: [...]`
   - Any error messages (red text)

**Common Errors:**

**Error: "Network Error" or "ERR_CONNECTION_REFUSED"**
- **Cause**: API Gateway or Catalog Service not running
- **Fix**: Start the services (see Step 1)

**Error: "404 Not Found"**
- **Cause**: API Gateway routing issue
- **Fix**: Check `backend/api-gateway/src/main/resources/application.yml` routing config

**Error: "403 Forbidden"**
- **Cause**: Security config issue
- **Fix**: Verify `SecurityConfig.java` has `permitAll()` for GET products endpoint

**Error: "CORS error"**
- **Cause**: CORS configuration issue
- **Fix**: Check CORS config in `SecurityConfig.java`

### Step 4: Check Network Tab

1. Open browser DevTools (F12)
2. Go to **Network** tab
3. Navigate to `/products` page
4. Look for request to `/api/catalog/products`
5. Check:
   - **Status**: Should be `200 OK`
   - **Response**: Should contain product data
   - **Headers**: Check if CORS headers are present

### Step 5: Verify Database Has Products

**Check if products exist in database:**
```bash
# Connect to catalog database
psql -U sravankumarbodakonda -d grocerystore_catalog

# Check products
SELECT COUNT(*) FROM products;
SELECT id, name, active, stock_quantity FROM products LIMIT 5;

# Check if any products are available (active AND in stock)
SELECT COUNT(*) FROM products WHERE active = true AND stock_quantity > 0;
```

**If no products:**
- Products might not be seeded
- Check Flyway migrations ran successfully
- Look for migration files in `backend/catalog-service/src/main/resources/db/migration/`

### Step 6: Check Security Configuration

**Verify `SecurityConfig.java` in catalog-service:**
```java
.authorizeHttpRequests(auth -> auth
    // Public endpoints - anyone can view products
    .requestMatchers("GET", "/api/catalog/products", 
                     "/api/catalog/products/{id}", 
                     "/api/catalog/products/category/{categoryId}").permitAll()
    // ... rest of config
)
```

**Important**: Admin endpoints must come BEFORE `permitAll()` rules!

### Step 7: Check API Gateway Configuration

**Verify `application.yml` in api-gateway:**
```yaml
spring:
  cloud:
    gateway:
      routes:
        - id: catalog-service
          uri: http://localhost:8084
          predicates:
            - Path=/api/catalog/**
```

### Step 8: Check Frontend Proxy Configuration

**Verify `vite.config.js`:**
```javascript
export default {
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8087',  // API Gateway
        changeOrigin: true
      }
    }
  }
}
```

## 🔧 Quick Fixes

### Fix 1: Restart Services
```bash
# Kill existing services
pkill -f "catalog-service"
pkill -f "api-gateway"

# Restart them
cd backend/catalog-service && ./run.sh
cd backend/api-gateway && ./run.sh
```

### Fix 2: Clear Browser Cache
- Hard refresh: `Ctrl+Shift+R` (Windows/Linux) or `Cmd+Shift+R` (Mac)
- Or clear browser cache and reload

### Fix 3: Check Database Connection
```bash
# Test PostgreSQL connection
psql -U sravankumarbodakonda -d grocerystore_catalog -c "SELECT 1;"
```

### Fix 4: Verify Products Are Active and In Stock

The backend filters products to show only:
- `active = true`
- `stock_quantity > 0`

**Check:**
```sql
SELECT * FROM products WHERE active = true AND stock_quantity > 0;
```

If no results, either:
- Update products to be active: `UPDATE products SET active = true;`
- Add stock: `UPDATE products SET stock_quantity = 10;`

## 📋 Diagnostic Checklist

- [ ] API Gateway is running on port 8087
- [ ] Catalog Service is running on port 8084
- [ ] PostgreSQL is running
- [ ] Database `grocerystore_catalog` exists
- [ ] Products exist in database
- [ ] Products have `active = true` and `stock_quantity > 0`
- [ ] Security config has `permitAll()` for GET products
- [ ] API Gateway routes `/api/catalog/**` to catalog-service
- [ ] Frontend proxy points to API Gateway (8087)
- [ ] Browser console shows no errors
- [ ] Network tab shows 200 OK response
- [ ] CORS headers are present in response

## 🐛 Common Issues & Solutions

### Issue: "Loading..." forever
**Cause**: API request hanging or failing silently
**Solution**: 
- Check browser console for errors
- Verify services are running
- Check network tab for failed requests

### Issue: "No products available"
**Cause**: Database has no products OR all products are inactive/out of stock
**Solution**:
- Check database: `SELECT * FROM products;`
- Update products: `UPDATE products SET active = true, stock_quantity = 10;`

### Issue: CORS Error
**Cause**: CORS not configured correctly
**Solution**:
- Verify `SecurityConfig.java` has CORS configuration
- Check allowed origins include `http://localhost:3000` or `http://localhost:5173`

### Issue: 403 Forbidden
**Cause**: Security config blocking request
**Solution**:
- Verify `permitAll()` is set for GET products endpoint
- Check admin rules come BEFORE `permitAll()` rules
- Restart catalog-service after config changes

### Issue: 404 Not Found
**Cause**: API Gateway routing issue
**Solution**:
- Check API Gateway routes in `application.yml`
- Verify catalog-service is running
- Check API Gateway logs

## 🔍 Debug Mode

**Enable detailed logging:**

1. **Backend**: Already enabled in `application.yml`:
   ```yaml
   logging:
     level:
       com.grocerystore: DEBUG
   ```

2. **Frontend**: Check browser console (already added logging)

3. **Check logs** in service terminals for:
   - Request received
   - Database queries
   - Security filter processing
   - Errors

## ✅ Verification

After fixing, verify:

1. **Open browser**: `http://localhost:3000/products`
2. **Check console**: Should see "Fetching products from..." and "Products response: [...]"
3. **Check page**: Products should display in grid
4. **Check network**: Request to `/api/catalog/products` should return 200 OK

## 📞 Still Not Working?

If products still don't show:

1. **Share browser console output** (F12 → Console tab)
2. **Share network tab** (F12 → Network tab → click on `/api/catalog/products` request)
3. **Share service logs** (from catalog-service and api-gateway terminals)
4. **Check database**: Run `SELECT * FROM products LIMIT 5;` and share results

---

**Last Updated**: November 26, 2025

