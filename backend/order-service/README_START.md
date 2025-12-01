# How to Start Order Service

## ⚠️ IMPORTANT: Use Java 17

**DO NOT run `mvn spring-boot:run` directly!**

## ✅ Correct Way (Use the Script)

```bash
./run.sh
```

## ✅ Or Set Environment Variables First

```bash
export JAVA_HOME=/opt/homebrew/opt/openjdk@17/libexec/openjdk.jdk/Contents/Home
export PATH="/opt/homebrew/opt/openjdk@17/bin:$PATH"

# Verify Java version
java -version  # Should show 17.0.17

# Now run Maven
mvn spring-boot:run
```

## Why?

Your system uses Java 23 by default, but this project requires Java 17. The `./run.sh` script automatically sets Java 17 for you.

