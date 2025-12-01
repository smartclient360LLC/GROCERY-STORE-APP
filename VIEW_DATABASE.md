# How to View Your Databases

## 📊 Database Overview

You have **5 PostgreSQL databases** (one per microservice):

| Service | Database Name | Port |
|---------|--------------|------|
| Auth | `grocerystore_auth` | 5432 |
| Catalog | `grocerystore_catalog` | 5432 |
| Cart | `grocerystore_cart` | 5432 |
| Order | `grocerystore_order` | 5432 |
| Payment | `grocerystore_payment` | 5432 |

**Connection Details:**
- **Host**: `localhost`
- **Port**: `5432`
- **Username**: `sravankumarbodakonda` (your system username)
- **Password**: (empty or your PostgreSQL password)

---

## 🔧 Method 1: Command Line (psql)

### Find psql Location
```bash
# Try these paths (Homebrew PostgreSQL)
/opt/homebrew/opt/postgresql@15/bin/psql
# or
/usr/local/opt/postgresql@15/bin/psql
```

### Connect to a Database
```bash
# Connect to auth database
psql -U sravankumarbodakonda -d grocerystore_auth

# Or if psql is in PATH:
psql -U sravankumarbodakonda -d grocerystore_auth
```

### Useful psql Commands
```sql
-- List all databases
\l

-- Connect to a database
\c grocerystore_auth

-- List all tables
\dt

-- Describe a table structure
\d users

-- View table data
SELECT * FROM users;

-- Exit
\q
```

### Quick Commands
```bash
# List all databases
psql -U sravankumarbodakonda -l

# View users table
psql -U sravankumarbodakonda -d grocerystore_auth -c "SELECT * FROM users;"

# View products table
psql -U sravankumarbodakonda -d grocerystore_catalog -c "SELECT * FROM products;"
```

---

## 🖥️ Method 2: GUI Tools (Recommended)

### Option A: pgAdmin (Free, Official)
1. **Install**: `brew install --cask pgadmin4`
2. **Open**: pgAdmin from Applications
3. **Add Server**:
   - Name: `Local PostgreSQL`
   - Host: `localhost`
   - Port: `5432`
   - Username: `sravankumarbodakonda`
   - Password: (your password or leave empty)
4. **Browse**: Expand server → Databases → Select database → Schemas → Tables

### Option B: DBeaver (Free, Cross-platform)
1. **Download**: https://dbeaver.io/download/
2. **Install**: Open DMG and drag to Applications
3. **Create Connection**:
   - Database: PostgreSQL
   - Host: `localhost`
   - Port: `5432`
   - Database: `grocerystore_auth` (or any database)
   - Username: `sravankumarbodakonda`
   - Password: (your password)
4. **Connect** and browse tables

### Option C: TablePlus (macOS, Beautiful UI)
1. **Install**: `brew install --cask tableplus`
2. **Create Connection**:
   - Type: PostgreSQL
   - Name: `Local PostgreSQL`
   - Host: `localhost`
   - Port: `5432`
   - User: `sravankumarbodakonda`
   - Password: (your password)
   - Database: `grocerystore_auth`
3. **Connect** and explore

### Option D: Postico (macOS, Simple)
1. **Download**: https://eggerapps.at/postico/
2. **Create Favorite**:
   - Host: `localhost`
   - Port: `5432`
   - User: `sravankumarbodakonda`
   - Database: `grocerystore_auth`
3. **Connect**

---

## 📋 Quick Database Queries

### View All Users
```bash
psql -U sravankumarbodakonda -d grocerystore_auth -c "SELECT id, email, first_name, last_name, role, enabled FROM users;"
```

### View All Products
```bash
psql -U sravankumarbodakonda -d grocerystore_catalog -c "SELECT id, name, price, stock_quantity, category_id FROM products LIMIT 10;"
```

### View All Orders
```bash
psql -U sravankumarbodakonda -d grocerystore_order -c "SELECT id, order_number, user_id, total_amount, status, created_at FROM orders ORDER BY created_at DESC LIMIT 10;"
```

### View Cart Items
```bash
psql -U sravankumarbodakonda -d grocerystore_cart -c "SELECT * FROM cart_items;"
```

### View Payments
```bash
psql -U sravankumarbodakonda -d grocerystore_payment -c "SELECT id, order_number, amount, status, stripe_payment_intent_id FROM payments;"
```

---

## 🔍 Find PostgreSQL Installation

If `psql` command is not found, add it to your PATH:

```bash
# For Homebrew PostgreSQL 15
export PATH="/opt/homebrew/opt/postgresql@15/bin:$PATH"

# Or for older Homebrew installations
export PATH="/usr/local/opt/postgresql@15/bin:$PATH"

# Add to ~/.zshrc to make permanent
echo 'export PATH="/opt/homebrew/opt/postgresql@15/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc
```

---

## 🎯 Recommended: Use TablePlus or DBeaver

For the best experience viewing and managing your databases, I recommend:
- **TablePlus** (macOS) - Beautiful, fast, simple
- **DBeaver** (Cross-platform) - Free, powerful, feature-rich

Both make it easy to:
- Browse all databases
- View table structures
- Run queries
- Edit data
- Export/import data

---

## 🚀 Quick Start

**Easiest way to get started:**

1. Install TablePlus:
   ```bash
   brew install --cask tableplus
   ```

2. Open TablePlus and create a new PostgreSQL connection:
   - Host: `localhost`
   - Port: `5432`
   - User: `sravankumarbodakonda`
   - Database: `grocerystore_auth` (start with this one)

3. Explore your data! 🎉

