# TablePlus Connection Guide

## 📥 Step 1: Install TablePlus

**macOS (Homebrew):**
```bash
brew install --cask tableplus
```

**Or download directly:**
- Visit: https://tableplus.com/
- Download for macOS
- Install the .dmg file

---

## 🔌 Step 2: Open TablePlus

1. Open TablePlus from Applications
2. Click **"Create a new connection"** or press `Cmd + N`

---

## ⚙️ Step 3: Configure Connection

### Select Database Type
- Choose **PostgreSQL** from the list

### Connection Settings

Fill in the following details:

| Field | Value | Description |
|-------|-------|-------------|
| **Name** | `Local Grocery Store` | Any name you want |
| **Host** | `localhost` | Your local machine |
| **Port** | `5432` | Default PostgreSQL port |
| **User** | `sravankumarbodakonda` | Your system username |
| **Password** | *(leave empty or your password)* | Usually empty for local |
| **Database** | `grocerystore_catalog` | Start with catalog DB |

### Quick Fill Template:
```
Name: Local Grocery Store
Host: localhost
Port: 5432
User: sravankumarbodakonda
Password: (leave empty)
Database: grocerystore_catalog
```

---

## 🎯 Step 4: Connect to Different Databases

You can create multiple connections for each database:

### Connection 1: Catalog Database
```
Name: Grocery Store - Catalog
Host: localhost
Port: 5432
User: sravankumarbodakonda
Database: grocerystore_catalog
```

### Connection 2: Auth Database
```
Name: Grocery Store - Auth
Host: localhost
Port: 5432
User: sravankumarbodakonda
Database: grocerystore_auth
```

### Connection 3: Cart Database
```
Name: Grocery Store - Cart
Host: localhost
Port: 5432
User: sravankumarbodakonda
Database: grocerystore_cart
```

### Connection 4: Order Database
```
Name: Grocery Store - Order
Host: localhost
Port: 5432
User: sravankumarbodakonda
Database: grocerystore_order
```

### Connection 5: Payment Database
```
Name: Grocery Store - Payment
Host: localhost
Port: 5432
User: sravankumarbodakonda
Database: grocerystore_payment
```

---

## ✅ Step 5: Test Connection

1. Click **"Test"** button to verify connection
2. If successful, click **"Connect"**
3. You should see your database tables!

---

## 🖼️ Step 6: View Your Data

Once connected:

1. **Expand the database** in the left sidebar
2. **Click on "public" schema**
3. **View tables:**
   - `products` - All products with images
   - `categories` - Product categories
   - `users` - User accounts (in auth DB)
   - `orders` - Customer orders (in order DB)
   - etc.

4. **Click on a table** to view data
5. **Double-click a cell** to edit (be careful!)

---

## 🔍 Quick Tips

### View Product Images
1. Connect to `grocerystore_catalog` database
2. Open `products` table
3. Click on `image_url` column
4. Copy URL and paste in browser to view

### Run SQL Queries
1. Click **"New Query"** button (or `Cmd + T`)
2. Type your SQL:
   ```sql
   SELECT id, name, price, image_url FROM products;
   ```
3. Press `Cmd + Enter` to execute

### Export Data
1. Right-click on table
2. Select **"Export"**
3. Choose format (CSV, JSON, etc.)

### Import Data
1. Right-click on table
2. Select **"Import"**
3. Choose your file

---

## 🐛 Troubleshooting

### Connection Failed?

**Error: "Connection refused"**
- Make sure PostgreSQL is running:
  ```bash
  brew services list | grep postgresql
  ```
- Start PostgreSQL if needed:
  ```bash
  brew services start postgresql@15
  ```

**Error: "Password authentication failed"**
- Try leaving password empty
- Or check your PostgreSQL password:
  ```bash
  psql -U sravankumarbodakonda -d grocerystore_catalog
  ```

**Error: "Database does not exist"**
- List all databases:
  ```bash
  /opt/homebrew/opt/postgresql@15/bin/psql -U sravankumarbodakonda -l
  ```
- Create database if missing:
  ```bash
  createdb -U sravankumarbodakonda grocerystore_catalog
  ```

**Error: "Role does not exist"**
- Make sure you're using your system username: `sravankumarbodakonda`
- Not `postgres` or `root`

---

## 📸 Visual Guide

### Connection Window:
```
┌─────────────────────────────────────┐
│ Create a new connection             │
├─────────────────────────────────────┤
│ Database: [PostgreSQL ▼]            │
│                                     │
│ Name: Local Grocery Store           │
│ Host: localhost                     │
│ Port: 5432                          │
│ User: sravankumarbodakonda          │
│ Password: [••••••••]                │
│ Database: grocerystore_catalog      │
│                                     │
│         [Test]  [Connect]           │
└─────────────────────────────────────┘
```

### After Connection:
```
┌─────────────────────────────────────┐
│ Local Grocery Store                 │
│   └─ grocerystore_catalog           │
│      └─ public                      │
│         ├─ categories               │
│         ├─ products                 │
│         └─ flyway_schema_history    │
└─────────────────────────────────────┘
```

---

## 🚀 Quick Start Commands

**Install TablePlus:**
```bash
brew install --cask tableplus
```

**Verify PostgreSQL is running:**
```bash
brew services list | grep postgresql
```

**List all databases:**
```bash
/opt/homebrew/opt/postgresql@15/bin/psql -U sravankumarbodakonda -l
```

---

## 💡 Pro Tips

1. **Save connections as favorites** - Click the star icon
2. **Use keyboard shortcuts:**
   - `Cmd + T` - New query
   - `Cmd + Enter` - Execute query
   - `Cmd + R` - Refresh
   - `Cmd + K` - Clear query

3. **Color code connections** - Right-click connection → Change color

4. **Use tabs** - Open multiple tables/queries in tabs

5. **Auto-complete** - TablePlus has great SQL autocomplete!

---

## 📚 Next Steps

Once connected:
1. Browse your `products` table
2. Check `image_url` values
3. Update images using the SQL editor
4. View `users` in the auth database
5. Check `orders` in the order database

Enjoy exploring your database! 🎉

