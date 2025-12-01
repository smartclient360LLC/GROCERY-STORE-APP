# ⚠️ IMPORTANT: How to Run Services

## ❌ DO NOT DO THIS:
```bash
mvn spring-boot:run
```
This will fail because it uses Java 23 (your system default).

## ✅ DO THIS INSTEAD:

### Option 1: Use the Run Script (EASIEST)
```bash
cd backend/payment-service
./run.sh
```

### Option 2: Set Environment Variables First
```bash
export JAVA_HOME=/opt/homebrew/opt/openjdk@17/libexec/openjdk.jdk/Contents/Home
export PATH="/opt/homebrew/opt/openjdk@17/bin:$PATH"

# Verify
java -version  # Should show 17.0.17

# Now you can run Maven
cd backend/payment-service
mvn spring-boot:run
```

## Why?

Your system uses Java 23 by default, but this project requires Java 17. The `./run.sh` scripts automatically set Java 17 for you.

## For All Services

**Always use `./run.sh` in each service directory:**

- `backend/auth-service/run.sh`
- `backend/catalog-service/run.sh`
- `backend/cart-service/run.sh`
- `backend/order-service/run.sh`
- `backend/payment-service/run.sh`
- `backend/api-gateway/run.sh`

## Make It Permanent (Optional)

Add to `~/.zshrc` so Java 17 is always used:

```bash
echo 'export JAVA_HOME=/opt/homebrew/opt/openjdk@17/libexec/openjdk.jdk/Contents/Home' >> ~/.zshrc
echo 'export PATH="/opt/homebrew/opt/openjdk@17/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc
```

After this, you can run `mvn spring-boot:run` directly.

