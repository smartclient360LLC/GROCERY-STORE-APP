# Quick Fix: Always Use Java 17

## The Problem
Your terminal is using Java 23 by default, but the project needs Java 17.

## Solution: Use the Run Scripts

**Always use the `./run.sh` script in each service directory:**

```bash
cd backend/order-service
./run.sh
```

This automatically sets Java 17 for you.

## Or Set Environment Variables Manually

Before running `mvn spring-boot:run`, always run these commands first:

```bash
export JAVA_HOME=/opt/homebrew/opt/openjdk@17/libexec/openjdk.jdk/Contents/Home
export PATH="/opt/homebrew/opt/openjdk@17/bin:$PATH"

# Verify
java -version  # Should show 17.0.17

# Now you can run Maven
mvn spring-boot:run
```

## Make It Permanent (Recommended)

Add to your `~/.zshrc` so Java 17 is always used:

```bash
echo 'export JAVA_HOME=/opt/homebrew/opt/openjdk@17/libexec/openjdk.jdk/Contents/Home' >> ~/.zshrc
echo 'export PATH="/opt/homebrew/opt/openjdk@17/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc
```

After this, you can run `mvn spring-boot:run` directly without setting environment variables.

## Quick Checklist

- ✅ Use `./run.sh` scripts (easiest)
- ✅ Or set JAVA_HOME before running Maven
- ✅ Or add to ~/.zshrc for permanent fix

