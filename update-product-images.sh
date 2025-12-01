#!/bin/bash

# Script to update product images with better URLs
# Uses Unsplash free images

PSQL="/opt/homebrew/opt/postgresql@15/bin/psql"
DB="grocerystore_catalog"
USER="sravankumarbodakonda"

echo "Updating product images..."

$PSQL -U $USER -d $DB <<EOF
-- Fruits & Vegetables
UPDATE products SET image_url = 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=400' WHERE name = 'Organic Apples';
UPDATE products SET image_url = 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=400' WHERE name = 'Bananas';
UPDATE products SET image_url = 'https://images.unsplash.com/photo-1445282768818-728615cc910a?w=400' WHERE name = 'Carrots';
UPDATE products SET image_url = 'https://images.unsplash.com/photo-1546470427-e26264be0b28?w=400' WHERE name = 'Tomatoes';

-- Dairy & Eggs
UPDATE products SET image_url = 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=400' WHERE name = 'Whole Milk';
UPDATE products SET image_url = 'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=400' WHERE name = 'Free Range Eggs';
UPDATE products SET image_url = 'https://images.unsplash.com/photo-1618164436269-66e6e0e57e7e?w=400' WHERE name = 'Cheddar Cheese';
UPDATE products SET image_url = 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400' WHERE name = 'Greek Yogurt';

-- Meat & Seafood
UPDATE products SET image_url = 'https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=400' WHERE name = 'Chicken Breast';
UPDATE products SET image_url = 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=400' WHERE name = 'Salmon Fillet';
UPDATE products SET image_url = 'https://images.unsplash.com/photo-1528607929212-9516a5b816d9?w=400' WHERE name = 'Ground Beef';

-- Bakery
UPDATE products SET image_url = 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400' WHERE name = 'Whole Wheat Bread';
UPDATE products SET image_url = 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=400' WHERE name = 'Croissants';

-- Beverages
UPDATE products SET image_url = 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=400' WHERE name = 'Orange Juice';
UPDATE products SET image_url = 'https://images.unsplash.com/photo-1523362628745-0c100150b504?w=400' WHERE name = 'Sparkling Water';
UPDATE products SET image_url = 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=400' WHERE name = 'Coffee Beans';

-- Snacks
UPDATE products SET image_url = 'https://images.unsplash.com/photo-1573080496219-bb08002ae2e1?w=400' WHERE name = 'Potato Chips';
UPDATE products SET image_url = 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=400' WHERE name = 'Chocolate Cookies';

-- Frozen Foods
UPDATE products SET image_url = 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400' WHERE name = 'Frozen Pizza';
UPDATE products SET image_url = 'https://images.unsplash.com/photo-1563805042-7684c019e1b5?w=400' WHERE name = 'Ice Cream';

-- Pantry Staples
UPDATE products SET image_url = 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400' WHERE name = 'White Rice';
UPDATE products SET image_url = 'https://images.unsplash.com/photo-1551462147-6e953d6c0ae7?w=400' WHERE name = 'Pasta';
UPDATE products SET image_url = 'https://images.unsplash.com/photo-1584270354949-c26b0d5b4a0c?w=400' WHERE name = 'Canned Tomatoes';
EOF

echo "✅ Product images updated successfully!"
echo ""
echo "View updated products:"
echo "  ./view-db.sh products"
echo ""
echo "Or check in browser: http://localhost:3000/products"

