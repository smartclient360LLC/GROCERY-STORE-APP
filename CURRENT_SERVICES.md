# Current Running Services

## ✅ Active Services

| Service | Port | Status | URL |
|---------|------|--------|-----|
| **Auth Service** | 8081 | ✅ Running | http://localhost:8081 |
| **Cart Service** | 8083 | ✅ Running | http://localhost:8083 |
| **Catalog Service** | 8084 | ✅ Running | http://localhost:8084 |
| **Order Service** | 8085 | ✅ Running | http://localhost:8085 |
| **Payment Service** | 8086 | ✅ Running | http://localhost:8086 |
| **API Gateway** | 8087 | ✅ Running | http://localhost:8087 |

## 🧪 Test Through API Gateway

```bash
# Test Catalog
curl http://localhost:8087/api/catalog/products

# Test Auth
curl -X POST http://localhost:8087/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"customer1@grocerystore.com","password":"customer123"}'

# Test Cart
curl http://localhost:8087/api/cart/1

# Test Orders
curl http://localhost:8087/api/orders/user/1
```

## 📝 Important Notes

- **API Gateway**: All requests should go through http://localhost:8087
- **Frontend**: Configured to proxy `/api` to http://localhost:8087
- **Direct Access**: You can also access services directly on their ports

## 🚀 Next Steps

1. Start the React frontend: `cd frontend && npm install && npm run dev`
2. Access the app at: http://localhost:3000
3. Test the complete shopping flow!

