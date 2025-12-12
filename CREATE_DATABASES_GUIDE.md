# How to Create Databases in RDS (Free Tier Compatible)

Since RDS Query Editor may have limitations on the free tier, here are alternative methods:

## ✅ Method 1: Update Security Group + Use psql (Recommended)

### Step 1: Update RDS Security Group

1. Go to [AWS RDS Console](https://console.aws.amazon.com/rds/)
2. Select your database: `database-1`
3. Click on **"Connectivity & security"** tab
4. Find **"VPC security groups"** and click on the security group (e.g., `sg-xxxxx`)
5. In the security group page, click **"Edit inbound rules"**
6. Click **"Add rule"**:
   - **Type:** PostgreSQL
   - **Port:** 5432
   - **Source:** Custom → Enter your IP: `107.3.120.70/32`
   - **Description:** "Allow from my IP"
7. Click **"Save rules"**
8. Wait 1-2 minutes for changes to propagate

### Step 2: Connect Using psql

```bash
# Make sure PostgreSQL is in your PATH
export PATH="/opt/homebrew/opt/postgresql@15/bin:$PATH"

# Connect to RDS (replace with your actual password when prompted)
psql -h database-1.cnuq0uuoq8b1.us-east-2.rds.amazonaws.com -U postgres -d postgres
```

### Step 3: Create Databases

Once connected, run these commands:

```sql
CREATE DATABASE grocerystore_auth;
CREATE DATABASE grocerystore_catalog;
CREATE DATABASE grocerystore_cart;
CREATE DATABASE grocerystore_order;
CREATE DATABASE grocerystore_payment;
```

### Step 4: Verify

```sql
\l
```

You should see all 5 databases listed.

### Step 5: Exit

```sql
\q
```

---

## ✅ Method 2: Use AWS CloudShell (No Local Setup)

AWS CloudShell is free and doesn't require security group changes if you're connecting from within AWS.

### Step 1: Open CloudShell

1. Go to [AWS CloudShell](https://console.aws.amazon.com/cloudshell/)
2. Click **"Open CloudShell"** (top right corner)
3. Wait for CloudShell to initialize

### Step 2: Install PostgreSQL Client

```bash
sudo yum install -y postgresql15
```

### Step 3: Connect to RDS

```bash
psql -h database-1.cnuq0uuoq8b1.us-east-2.rds.amazonaws.com -U postgres -d postgres
```

Enter your RDS password when prompted.

### Step 4: Create Databases

```sql
CREATE DATABASE grocerystore_auth;
CREATE DATABASE grocerystore_catalog;
CREATE DATABASE grocerystore_cart;
CREATE DATABASE grocerystore_order;
CREATE DATABASE grocerystore_payment;
```

### Step 5: Verify and Exit

```sql
\l
\q
```

---

## ✅ Method 3: Use EC2 Instance (If You Have One)

If you have an EC2 instance in the same VPC:

1. SSH into your EC2 instance
2. Install PostgreSQL client:
   ```bash
   sudo yum install -y postgresql15
   ```
3. Connect:
   ```bash
   psql -h database-1.cnuq0uuoq8b1.us-east-2.rds.amazonaws.com -U postgres -d postgres
   ```
4. Run the CREATE DATABASE commands

---

## ✅ Method 4: Use pgAdmin or DBeaver (GUI Tools)

### Using pgAdmin:

1. Download pgAdmin: https://www.pgadmin.org/download/
2. Install and open pgAdmin
3. Right-click "Servers" → "Create" → "Server"
4. **General tab:**
   - Name: `AWS RDS`
5. **Connection tab:**
   - Host: `database-1.cnuq0uuoq8b1.us-east-2.rds.amazonaws.com`
   - Port: `5432`
   - Database: `postgres`
   - Username: `postgres`
   - Password: Your RDS password
6. Click "Save"
7. Once connected, right-click "Databases" → "Create" → "Database"
8. Create each database one by one

### Using DBeaver:

1. Download DBeaver: https://dbeaver.io/download/
2. Install and open DBeaver
3. Click "New Database Connection" → Select "PostgreSQL"
4. Enter connection details:
   - Host: `database-1.cnuq0uuoq8b1.us-east-2.rds.amazonaws.com`
   - Port: `5432`
   - Database: `postgres`
   - Username: `postgres`
   - Password: Your RDS password
5. Click "Test Connection" → "Finish"
6. Right-click on your connection → "SQL Editor" → "New SQL Script"
7. Paste and run the CREATE DATABASE commands

---

## 🔧 Troubleshooting

### Connection Timeout
- **Solution:** Make sure the security group allows connections from your IP (Method 1, Step 1)
- **Alternative:** Use AWS CloudShell (Method 2) - no security group changes needed

### "psql: command not found"
- **Solution:** Make sure PostgreSQL client is installed and in your PATH
- On macOS: `export PATH="/opt/homebrew/opt/postgresql@15/bin:$PATH"`

### "Password authentication failed"
- **Solution:** Double-check your RDS master password
- You can reset it in RDS Console → Modify → Master password

### "Database already exists"
- **Solution:** This is fine! The database was already created. You can skip it or drop and recreate:
  ```sql
  DROP DATABASE IF EXISTS grocerystore_auth;
  CREATE DATABASE grocerystore_auth;
  ```

---

## 📝 Quick Reference: SQL Commands

```sql
-- Create all databases
CREATE DATABASE grocerystore_auth;
CREATE DATABASE grocerystore_catalog;
CREATE DATABASE grocerystore_cart;
CREATE DATABASE grocerystore_order;
CREATE DATABASE grocerystore_payment;

-- Verify databases
SELECT datname FROM pg_database WHERE datname LIKE 'grocerystore%';

-- List all databases
\l

-- Connect to a specific database (for testing)
\c grocerystore_auth

-- Exit psql
\q
```

---

## 🎯 Recommended Approach

**For Free Tier Users:**
1. **Best Option:** Method 2 (AWS CloudShell) - No security group changes needed, works immediately
2. **Second Best:** Method 1 (Update Security Group + psql) - More control, works from your local machine

Choose the method that works best for you!
