# Fix Product Images Not Showing

## 🔍 Problem Identified

The images are not showing because:
1. **`via.placeholder.com` is not accessible** - DNS/network issue
2. Images are stored correctly in database
3. API is returning image URLs correctly
4. Frontend code is correct

## ✅ Solution Applied

### 1. Updated All Product Images
Ran the script to update all products with Unsplash images:
```bash
./update-product-images.sh
```

### 2. Added Error Handling
Added `onError` handlers to image tags so if an image fails to load, it shows a fallback image.

## 🚀 Quick Fix

**Update images in database:**
```bash
./update-product-images.sh
```

**Or manually update one product:**
```bash
/opt/homebrew/opt/postgresql@15/bin/psql -U sravankumarbodakonda -d grocerystore_catalog

UPDATE products 
SET image_url = 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=400' 
WHERE id = 1;
```

## 🔍 Verify Images Are Working

1. **Check database:**
   ```bash
   ./view-db.sh products
   ```

2. **Check API:**
   ```bash
   curl http://localhost:8087/api/catalog/products/1 | jq '.imageUrl'
   ```

3. **Test image URL directly:**
   ```bash
   curl -I "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=400"
   ```

4. **Refresh frontend:**
   - Open: http://localhost:3000/products
   - Hard refresh: `Cmd + Shift + R` (Mac) or `Ctrl + Shift + R` (Windows)

## 🖼️ Alternative Image Sources

If Unsplash doesn't work, try these:

### Option 1: Pexels
```sql
UPDATE products SET image_url = 'https://images.pexels.com/photos/1300975/pexels-photo-1300975.jpeg?w=400' WHERE id = 1;
```

### Option 2: Lorem Picsum
```sql
UPDATE products SET image_url = 'https://picsum.photos/400/400?random=1' WHERE id = 1;
```

### Option 3: Local Images
1. Download images to `frontend/public/images/products/`
2. Update database:
   ```sql
   UPDATE products SET image_url = '/images/products/apple.jpg' WHERE id = 1;
   ```

## 🐛 Troubleshooting

### Images still not showing?

1. **Check browser console:**
   - Open DevTools (F12)
   - Check Console tab for errors
   - Check Network tab - are images loading?

2. **Check CORS:**
   - Some image services block cross-origin requests
   - Use images from services that allow CORS

3. **Check image URLs:**
   ```bash
   curl -I "YOUR_IMAGE_URL"
   ```
   Should return `200 OK`

4. **Clear browser cache:**
   - Hard refresh: `Cmd + Shift + R`
   - Or clear cache in browser settings

5. **Check if frontend is running:**
   ```bash
   curl http://localhost:3000
   ```

## ✅ Expected Result

After running `./update-product-images.sh`:
- All products should have Unsplash image URLs
- Images should load in the frontend
- If an image fails, fallback image will show

## 📝 Next Steps

1. Run: `./update-product-images.sh`
2. Refresh browser: http://localhost:3000/products
3. Images should now display!

If still not working, check browser console for specific errors.

