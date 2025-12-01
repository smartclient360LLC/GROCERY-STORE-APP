#!/bin/bash

# Script to update Git credentials for smartclient360LLC account
# Usage: ./update-git-credentials.sh

echo "=========================================="
echo "Git Credentials Update for smartclient360LLC"
echo "=========================================="
echo ""

# Check if token is provided as argument
if [ -z "$1" ]; then
    echo "Please provide your Personal Access Token as an argument:"
    echo "  ./update-git-credentials.sh YOUR_TOKEN_HERE"
    echo ""
    echo "Or run this script and enter the token when prompted."
    echo ""
    read -sp "Enter your GitHub Personal Access Token: " GITHUB_TOKEN
    echo ""
else
    GITHUB_TOKEN=$1
fi

if [ -z "$GITHUB_TOKEN" ]; then
    echo "Error: Token is required!"
    exit 1
fi

echo ""
echo "Updating Git credentials..."

# Remove old credentials from macOS Keychain
echo "Removing old credentials from macOS Keychain..."
security delete-internet-password -s github.com 2>/dev/null || true

# Update remote URL to include token (temporary, for testing)
echo "Testing authentication..."
git ls-remote https://${GITHUB_TOKEN}@github.com/smartclient360LLC/GROCERY-STORE-APP.git > /dev/null 2>&1

if [ $? -eq 0 ]; then
    echo "✓ Authentication successful!"
    echo ""
    echo "Your credentials have been updated."
    echo ""
    echo "Next steps:"
    echo "1. When you push, Git will prompt for credentials"
    echo "2. Username: smartclient360LLC"
    echo "3. Password: Use your Personal Access Token (not your GitHub password)"
    echo ""
    echo "Or you can push now with:"
    echo "  git push https://${GITHUB_TOKEN}@github.com/smartclient360LLC/GROCERY-STORE-APP.git"
    echo ""
    echo "To store credentials permanently, run:"
    echo "  git config --global credential.helper osxkeychain"
    echo "  (Then push once more and enter the token when prompted)"
else
    echo "✗ Authentication failed. Please check your token."
    exit 1
fi

