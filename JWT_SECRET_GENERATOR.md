# JWT Secret Generator

## ✅ Generated JWT Secret

Use this secret for **ALL** services (auth, catalog, cart, order, payment, api-gateway):

```
JWT_SECRET=YOUR_GENERATED_SECRET_HERE
```

## 🔐 Important Notes

1. **Use the SAME secret for ALL services** - This is critical for JWT validation to work across services
2. **Keep it secure** - Never commit this to git
3. **Minimum 32 characters** - JWT secrets should be at least 32 characters long
4. **Save it securely** - Store in a password manager or secure location

## 🔄 Generate a New Secret

If you need to generate a new secret, use one of these methods:

### Method 1: OpenSSL (Recommended)
```bash
openssl rand -base64 64 | tr -d "=+/" | cut -c1-64
```

### Method 2: Python
```bash
python3 -c "import secrets; print(secrets.token_urlsafe(64))"
```

### Method 3: Node.js
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('base64'))"
```

## 📝 Usage in ECS Task Definitions

When creating your ECS task definitions, add this environment variable:

```
JWT_SECRET=your-generated-secret-here
JWT_EXPIRATION=86400000
```

**Important:** Use the **exact same value** for `JWT_SECRET` in all 6 services:
- auth-service
- catalog-service
- cart-service
- order-service
- payment-service
- api-gateway

## 🔒 Security Best Practices

1. ✅ Use a strong, random secret (64+ characters recommended)
2. ✅ Never commit secrets to version control
3. ✅ Use AWS Secrets Manager or Parameter Store for production
4. ✅ Rotate secrets periodically
5. ✅ Use different secrets for different environments (dev/staging/prod)

## 🎯 Quick Reference

**For your deployment, you'll need:**
- `JWT_SECRET` - Same for all services (generated above)
- `JWT_EXPIRATION` - Usually `86400000` (24 hours in milliseconds)
