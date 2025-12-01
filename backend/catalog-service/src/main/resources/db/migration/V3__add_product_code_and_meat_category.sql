-- Add product_code column to products table
ALTER TABLE products ADD COLUMN product_code VARCHAR(50) UNIQUE;

-- Create index for product code searches
CREATE INDEX idx_products_code ON products(product_code);

-- Insert Meat category
INSERT INTO categories (name, description, created_at, updated_at)
VALUES ('Meat', 'Fresh meat and poultry products', NOW(), NOW())
ON CONFLICT (name) DO NOTHING;

-- Update existing products with product codes (optional, for existing data)
-- This is just an example - you can update manually or via admin panel
-- UPDATE products SET product_code = 'PROD-' || id WHERE product_code IS NULL;

