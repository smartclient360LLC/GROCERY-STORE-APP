# Database Setup Guide

## The Problem
The application needs PostgreSQL to run. You have two options:

## Option 1: Use Docker (Recommended)

### Install Docker Desktop
1. Download from: https://www.docker.com/products/docker-desktop/
2. Install and start Docker Desktop
3. Wait for Docker to start (whale icon in menu bar)

### Start Database
```bash
cd /Users/sravankumarbodakonda/Documents/SmartClient360/DemoProject
docker compose up -d postgres-auth rabbitmq
```

### Verify
```bash
docker compose ps
```

## Option 2: Install PostgreSQL Locally

### macOS (Homebrew)
```bash
brew install postgresql@15
brew services start postgresql@15

# Create database
createdb grocerystore_auth

# Or using psql
psql postgres
CREATE DATABASE grocerystore_auth;
\q
```

### Update application.yml
The default configuration should work if PostgreSQL is on localhost:5432 with user `postgres` and password `postgres`.

## Option 3: Use H2 In-Memory Database (Quick Testing)

For quick testing without installing anything, you can temporarily use H2:

### Update `backend/auth-service/pom.xml`
Add H2 dependency (it's already there for tests):
```xml
<dependency>
    <groupId>com.h2database</groupId>
    <artifactId>h2</artifactId>
    <scope>runtime</scope>
</dependency>
```

### Update `backend/auth-service/src/main/resources/application.yml`
Change datasource to:
```yaml
spring:
  datasource:
    url: jdbc:h2:mem:testdb
    driver-class-name: org.h2.Driver
    username: sa
    password:
  jpa:
    hibernate:
      ddl-auto: create-drop
  flyway:
    enabled: false
  h2:
    console:
      enabled: true
```

**Note:** H2 is for testing only. Use PostgreSQL for production.

## Quick Start (After Docker is installed)

```bash
# Start all services
docker compose up -d

# Or just database and RabbitMQ
docker compose up -d postgres-auth rabbitmq

# Check status
docker compose ps

# View logs
docker compose logs postgres-auth
```

## Troubleshooting

### Connection Refused
- Make sure PostgreSQL is running
- Check port 5432 is not in use: `lsof -i :5432`
- Verify connection: `psql -h localhost -U postgres -d grocerystore_auth`

### Docker Issues
- Make sure Docker Desktop is running
- Check Docker status: `docker ps`
- Restart Docker Desktop if needed

