# Quick Start: Create Databases Using AWS CloudShell

AWS CloudShell runs from within AWS, so it can connect to RDS without security group changes!

## 🚀 Step-by-Step (Takes 2 minutes)

### Step 1: Open AWS CloudShell

1. Go to: **https://console.aws.amazon.com/cloudshell/**
2. Click **"Open CloudShell"** button (top right corner)
3. Wait for CloudShell to initialize (30-60 seconds)

### Step 2: Install PostgreSQL Client

Once CloudShell opens, run:

```bash
sudo yum install -y postgresql15
```

This will install the PostgreSQL client tools.

### Step 3: Connect to Your RDS Database

```bash
psql -h database-1.cnuq0uuoq8b1.us-east-2.rds.amazonaws.com -U postgres -d postgres
```

**Enter your RDS master password when prompted.**

### Step 4: Create the Databases

Once connected, you'll see a `postgres=#` prompt. Run these commands:

```sql
CREATE DATABASE grocerystore_auth;
CREATE DATABASE grocerystore_catalog;
CREATE DATABASE grocerystore_cart;
CREATE DATABASE grocerystore_order;
CREATE DATABASE grocerystore_payment;
```

### Step 5: Verify Databases Were Created

```sql
\l
```

You should see all 5 databases listed:
- grocerystore_auth
- grocerystore_catalog
- grocerystore_cart
- grocerystore_order
- grocerystore_payment

### Step 6: Exit

```sql
\q
```

---

## ✅ That's It!

Your databases are now created and ready to use!

---

## 🐛 Troubleshooting

### "psql: command not found"
- Make sure you ran: `sudo yum install -y postgresql15`
- Wait for installation to complete

### "Password authentication failed"
- Double-check your RDS master password
- Make sure you're using the correct username: `postgres`

### "Connection refused" or "Operation timed out"
- Verify your RDS instance is running (check RDS Console)
- Make sure the RDS security group allows connections from CloudShell's security group
- CloudShell should work by default, but if not, add the CloudShell security group to RDS

### Can't find CloudShell?
- Make sure you're logged into the AWS Console
- CloudShell is available in all AWS regions
- Try refreshing the page

---

## 💡 Why CloudShell Works

- CloudShell runs from within AWS's network
- It can connect to RDS instances in the same VPC without security group changes
- No need to configure your local IP address
- Works immediately, no waiting for security group propagation

---

## 📝 Copy-Paste Ready Commands

Here's everything in one block you can copy:

```bash
# Install PostgreSQL client
sudo yum install -y postgresql15

# Connect to RDS
psql -h database-1.cnuq0uuoq8b1.us-east-2.rds.amazonaws.com -U postgres -d postgres

# Then in psql, run:
CREATE DATABASE grocerystore_auth;
CREATE DATABASE grocerystore_catalog;
CREATE DATABASE grocerystore_cart;
CREATE DATABASE grocerystore_order;
CREATE DATABASE grocerystore_payment;

# Verify
\l

# Exit
\q
```
