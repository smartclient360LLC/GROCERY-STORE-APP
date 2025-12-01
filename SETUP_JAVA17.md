# Java 17 Setup Complete! ✅

Java 17 has been installed and configured. Here's how to use it:

## Quick Start

### Option 1: Use the Helper Script (Easiest)

For the auth-service, use the provided script:

```bash
cd backend/auth-service
./run-with-java17.sh
```

### Option 2: Set Environment Variables Manually

For your current terminal session:

```bash
export JAVA_HOME=/opt/homebrew/opt/openjdk@17/libexec/openjdk.jdk/Contents/Home
export PATH="/opt/homebrew/opt/openjdk@17/bin:$PATH"

# Verify
java -version  # Should show version 17

# Now run Maven
cd backend/auth-service
mvn spring-boot:run
```

### Option 3: Make Java 17 Default (Permanent)

Add to your `~/.zshrc` file:

```bash
# Java 17 for Grocery Store Project
export JAVA_HOME=/opt/homebrew/opt/openjdk@17/libexec/openjdk.jdk/Contents/Home
export PATH="/opt/homebrew/opt/openjdk@17/bin:$PATH"
```

Then reload:
```bash
source ~/.zshrc
```

## Verify Setup

```bash
java -version
# Should show: openjdk version "17.0.17"
```

## Run the Application

Now you can run any service:

```bash
# Auth Service
cd backend/auth-service
mvn spring-boot:run

# Or use Docker Compose (recommended for full stack)
cd ../..
docker-compose up -d
```

## What Was Fixed

1. ✅ Installed Java 17 via Homebrew
2. ✅ Configured Lombok annotation processing
3. ✅ Fixed compilation errors
4. ✅ Created helper script for easy running

The project should now compile and run successfully!

