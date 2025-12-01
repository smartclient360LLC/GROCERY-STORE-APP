# Fix Database Credentials

## The Problem
PostgreSQL is running, but authentication is failing because the user "root" with password "Sravan123@" doesn't exist or has wrong credentials.

## Solution Options

### Option 1: Use Default PostgreSQL User (Easiest)

I've updated `application.yml` to use the default `postgres` user. Now you need to:

1. **Create the database:**
   ```bash
   # Connect to PostgreSQL (you may need to adjust based on your setup)
   psql -U postgres
   
   # Or if you have a different superuser:
   psql -U your_username
   ```

2. **Create the database:**
   ```sql
   CREATE DATABASE grocerystore_auth;
   \q
   ```

3. **If the default password is different, set environment variables:**
   ```bash
   export DB_USER=postgres
   export DB_PASSWORD=your_actual_password
   ```

### Option 2: Create the "root" User in PostgreSQL

If you want to keep using "root" as the username:

```bash
# Connect to PostgreSQL
psql -U postgres

# Create user and database
CREATE USER root WITH PASSWORD 'Sravan123@';
CREATE DATABASE grocerystore_auth OWNER root;
GRANT ALL PRIVILEGES ON DATABASE grocerystore_auth TO root;
\q
```

### Option 3: Update application.yml with Your Credentials

If you have different PostgreSQL credentials, update `application.yml`:

```yaml
spring:
  datasource:
    username: your_username
    password: your_password
```

Or use environment variables:
```bash
export DB_USER=your_username
export DB_PASSWORD=your_password
```

## Quick Test

After fixing credentials, test the connection:

```bash
psql -h localhost -U postgres -d grocerystore_auth
# Or with your credentials:
psql -h localhost -U root -d grocerystore_auth
```

## Then Run the Service

```bash
cd backend/auth-service
./run.sh
```

