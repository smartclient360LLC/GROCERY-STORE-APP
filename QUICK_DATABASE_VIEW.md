# Quick Database Viewing Guide

## 🚀 Fastest Way to View Database

### Option 1: Use Helper Script (Easiest)
```bash
./view-db.sh products    # View all products
./view-db.sh users       # View all users
./view-db.sh orders      # View all orders
./view-db.sh all         # View all databases
```

### Option 2: Direct psql Commands

**View Products:**
```bash
/opt/homebrew/opt/postgresql@15/bin/psql -U sravankumarbodakonda -d grocerystore_catalog -c "SELECT id, name, price, image_url FROM products;"
```

**View Users:**
```bash
/opt/homebrew/opt/postgresql@15/bin/psql -U sravankumarbodakonda -d grocerystore_auth -c "SELECT id, email, first_name, last_name, role FROM users;"
```

**View Orders:**
```bash
/opt/homebrew/opt/postgresql@15/bin/psql -U sravankumarbodakonda -d grocerystore_order -c "SELECT id, order_number, user_id, total_amount, status FROM orders;"
```

### Option 3: Interactive psql Session
```bash
# Connect to catalog database
/opt/homebrew/opt/postgresql@15/bin/psql -U sravankumarbodakonda -d grocerystore_catalog

# Then run SQL commands:
SELECT * FROM products;
SELECT * FROM categories;
\q  # Exit
```

### Option 4: GUI Tool (Best for Visual Browsing)

**Install TablePlus:**
```bash
brew install --cask tableplus
```

**Connect:**
- Host: `localhost`
- Port: `5432`
- User: `sravankumarbodakonda`
- Database: `grocerystore_catalog` (or any other)

---

## 📋 Common Queries

**View products with images:**
```sql
SELECT id, name, price, image_url FROM products ORDER BY id;
```

**View products by category:**
```sql
SELECT p.id, p.name, p.price, c.name as category 
FROM products p 
JOIN categories c ON p.category_id = c.id;
```

**Count products per category:**
```sql
SELECT c.name, COUNT(p.id) as product_count
FROM categories c
LEFT JOIN products p ON c.id = p.category_id
GROUP BY c.name;
```

**View low stock products:**
```sql
SELECT id, name, stock_quantity 
FROM products 
WHERE stock_quantity < 50 
ORDER BY stock_quantity;
```

---

## 🖼️ View Product Images

**Check image URLs:**
```bash
/opt/homebrew/opt/postgresql@15/bin/psql -U sravankumarbodakonda -d grocerystore_catalog \
  -c "SELECT id, name, image_url FROM products LIMIT 10;"
```

**Update images:**
```bash
./update-product-images.sh
```

Then view in browser: http://localhost:3000/products

