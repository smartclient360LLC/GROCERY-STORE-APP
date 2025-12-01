#!/bin/bash

# Set Java 17 environment
export JAVA_HOME=/opt/homebrew/opt/openjdk@17/libexec/openjdk.jdk/Contents/Home
export PATH="/opt/homebrew/opt/openjdk@17/bin:$PATH"

# Verify Java version
echo "Starting API Gateway on port 8080..."
echo "Using Java version:"
java -version
echo ""

# Run Maven
mvn spring-boot:run

