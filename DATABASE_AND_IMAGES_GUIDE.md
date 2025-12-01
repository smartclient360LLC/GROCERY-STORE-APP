# Database Viewing & Product Images Guide

## 📊 Viewing the Database

### Quick Commands

**View all products with images:**
```bash
./view-db.sh products
```

**Or directly with psql:**
```bash
/opt/homebrew/opt/postgresql@15/bin/psql -U sravankumarbodakonda -d grocerystore_catalog -c "SELECT id, name, price, image_url FROM products;"
```

**View specific product:**
```bash
/opt/homebrew/opt/postgresql@15/bin/psql -U sravankumarbodakonda -d grocerystore_catalog -c "SELECT * FROM products WHERE id = 1;"
```

### Using GUI Tools

**Recommended: TablePlus**
```bash
brew install --cask tableplus
```

Then connect:
- **Host**: `localhost`
- **Port**: `5432`
- **User**: `sravankumarbodakonda`
- **Database**: `grocerystore_catalog`

Browse: `products` table → View `image_url` column

---

## 🖼️ Adding Images to Products

### Current Setup

Products have an `imageUrl` field that stores image URLs. Currently using placeholder images:
- Format: `https://via.placeholder.com/300?text=ProductName`
- Stored in: `products.image_url` column

### Option 1: Use External Image URLs (Easiest)

**Update via SQL:**
```sql
-- Update a product with a real image URL
UPDATE products 
SET image_url = 'https://example.com/images/apples.jpg' 
WHERE id = 1;
```

**Update via API (as Admin):**
```bash
# 1. Login as admin to get token
TOKEN=$(curl -s -X POST http://localhost:8087/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@grocerystore.com","password":"admin123"}' \
  | jq -r '.token')

# 2. Update product with new image URL
curl -X PUT http://localhost:8087/api/catalog/products/1 \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Organic Apples",
    "price": 4.99,
    "stockQuantity": 50,
    "imageUrl": "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=400",
    "categoryId": 1
  }'
```

### Option 2: Use Free Image Services

**Unsplash (Free, High Quality):**
```sql
UPDATE products SET image_url = 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=400' WHERE name = 'Organic Apples';
UPDATE products SET image_url = 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=400' WHERE name = 'Bananas';
UPDATE products SET image_url = 'https://images.unsplash.com/photo-1445282768818-728615cc910a?w=400' WHERE name = 'Carrots';
UPDATE products SET image_url = 'https://images.unsplash.com/photo-1546470427-e26264be0b28?w=400' WHERE name = 'Tomatoes';
UPDATE products SET image_url = 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=400' WHERE name = 'Whole Milk';
```

**Pexels (Free):**
```sql
UPDATE products SET image_url = 'https://images.pexels.com/photos/1300975/pexels-photo-1300975.jpeg?w=400' WHERE name = 'Organic Apples';
```

**Food Images API:**
```sql
UPDATE products SET image_url = 'https://www.themealdb.com/images/ingredients/Apple.png' WHERE name = 'Organic Apples';
```

### Option 3: Local Image Storage (Advanced)

For production, you'd want to:
1. Store images in a folder (e.g., `frontend/public/images/products/`)
2. Serve them via static file server
3. Store relative paths in database

**Example structure:**
```
frontend/
  public/
    images/
      products/
        apple.jpg
        banana.jpg
        carrot.jpg
```

**Update database:**
```sql
UPDATE products SET image_url = '/images/products/apple.jpg' WHERE name = 'Organic Apples';
```

---

## 🔧 Quick Script to Update All Product Images

Create a script to update all products with better images:

```bash
#!/bin/bash
# update-product-images.sh

PSQL="/opt/homebrew/opt/postgresql@15/bin/psql"
DB="grocerystore_catalog"
USER="sravankumarbodakonda"

# Update products with Unsplash images
$PSQL -U $USER -d $DB <<EOF
UPDATE products SET image_url = 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=400' WHERE name = 'Organic Apples';
UPDATE products SET image_url = 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=400' WHERE name = 'Bananas';
UPDATE products SET image_url = 'https://images.unsplash.com/photo-1445282768818-728615cc910a?w=400' WHERE name = 'Carrots';
UPDATE products SET image_url = 'https://images.unsplash.com/photo-1546470427-e26264be0b28?w=400' WHERE name = 'Tomatoes';
UPDATE products SET image_url = 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=400' WHERE name = 'Whole Milk';
UPDATE products SET image_url = 'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=400' WHERE name = 'Free Range Eggs';
UPDATE products SET image_url = 'https://images.unsplash.com/photo-1618164436269-66e6e0e57e7e?w=400' WHERE name = 'Cheddar Cheese';
UPDATE products SET image_url = 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400' WHERE name = 'Greek Yogurt';
UPDATE products SET image_url = 'https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=400' WHERE name = 'Chicken Breast';
UPDATE products SET image_url = 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=400' WHERE name = 'Salmon Fillet';
EOF

echo "Product images updated!"
```

---

## 📝 Viewing Images in Database

### Using TablePlus
1. Open TablePlus
2. Connect to `grocerystore_catalog` database
3. Open `products` table
4. Click on `image_url` cell
5. Copy URL and paste in browser to view

### Using psql
```bash
# View all image URLs
/opt/homebrew/opt/postgresql@15/bin/psql -U sravankumarbodakonda -d grocerystore_catalog \
  -c "SELECT id, name, image_url FROM products;"

# View specific product image URL
/opt/homebrew/opt/postgresql@15/bin/psql -U sravankumarbodakonda -d grocerystore_catalog \
  -c "SELECT image_url FROM products WHERE id = 1;"
```

### Using Helper Script
```bash
# View products with images
./view-db.sh products
```

---

## 🎨 Frontend Image Display

The frontend automatically displays images from the `imageUrl` field:

**ProductList.jsx:**
```jsx
<img
  src={product.imageUrl || 'https://via.placeholder.com/300'}
  alt={product.name}
/>
```

**ProductDetails.jsx:**
```jsx
<img
  src={product.imageUrl || 'https://via.placeholder.com/400'}
  alt={product.name}
/>
```

If `imageUrl` is null or empty, it shows a placeholder.

---

## 🔍 Verify Images Are Working

1. **Check database:**
   ```bash
   ./view-db.sh products
   ```

2. **Check API response:**
   ```bash
   curl http://localhost:8087/api/catalog/products/1 | jq '.imageUrl'
   ```

3. **View in browser:**
   - Open: http://localhost:3000/products
   - Images should display automatically

---

## 💡 Best Practices

1. **Image URLs should be:**
   - HTTPS (secure)
   - High resolution (at least 400x400px)
   - Optimized file size
   - Accessible (no authentication required)

2. **For production:**
   - Use CDN (CloudFront, Cloudflare)
   - Store images in S3/cloud storage
   - Use image optimization service
   - Implement lazy loading

3. **Image formats:**
   - JPEG for photos
   - PNG for graphics with transparency
   - WebP for modern browsers (best compression)

---

## 🚀 Quick Start

**Update a product image right now:**
```bash
# Connect to database
/opt/homebrew/opt/postgresql@15/bin/psql -U sravankumarbodakonda -d grocerystore_catalog

# Update image
UPDATE products 
SET image_url = 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=400' 
WHERE id = 1;

# Verify
SELECT id, name, image_url FROM products WHERE id = 1;

# Exit
\q
```

Then refresh your frontend to see the new image!

