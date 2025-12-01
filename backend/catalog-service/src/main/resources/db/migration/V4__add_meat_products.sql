-- Add meat products to the catalog
-- First, ensure Meat category exists (in case migration V3 hasn't run)
INSERT INTO categories (name, description, created_at, updated_at)
VALUES ('Meat', 'Fresh meat and poultry products', NOW(), NOW())
ON CONFLICT (name) DO NOTHING;

-- Get the Meat category ID
DO $$
DECLARE
    meat_category_id BIGINT;
BEGIN
    SELECT id INTO meat_category_id FROM categories WHERE name = 'Meat';
    
    -- Insert meat products
    INSERT INTO products (name, description, price, stock_quantity, image_url, category_id, product_code, active, created_at, updated_at) VALUES
    ('Goat', 'Fresh whole goat meat, premium quality', 8.99, 50, 'https://images.unsplash.com/photo-1603048297172-c9254474737e?w=400&h=400&fit=crop', meat_category_id, 'MEAT-GOAT-001', true, NOW(), NOW()),
    ('Goat Leg', 'Fresh goat leg cuts, tender and flavorful', 9.99, 40, 'https://images.unsplash.com/photo-1603048297172-c9254474737e?w=400&h=400&fit=crop', meat_category_id, 'MEAT-GOAT-LEG-001', true, NOW(), NOW()),
    ('Goat Stew', 'Prepared goat stew meat, ready to cook', 10.99, 35, 'https://images.unsplash.com/photo-1603048297172-c9254474737e?w=400&h=400&fit=crop', meat_category_id, 'MEAT-GOAT-STEW-001', true, NOW(), NOW()),
    ('Lamb', 'Fresh lamb meat, premium cuts', 12.99, 45, 'https://images.unsplash.com/photo-1603048297172-c9254474737e?w=400&h=400&fit=crop', meat_category_id, 'MEAT-LAMB-001', true, NOW(), NOW()),
    ('Regular Chicken', 'Fresh regular chicken, whole bird', 5.99, 100, 'https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=400&h=400&fit=crop', meat_category_id, 'MEAT-CHICKEN-REG-001', true, NOW(), NOW()),
    ('Desi Chicken (Organic Chicken)', 'Organic free-range desi chicken, farm fresh', 8.99, 60, 'https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=400&h=400&fit=crop', meat_category_id, 'MEAT-CHICKEN-DESI-001', true, NOW(), NOW()),
    ('Paya', 'Fresh goat paya (trotters), traditional cut', 7.99, 30, 'https://images.unsplash.com/photo-1603048297172-c9254474737e?w=400&h=400&fit=crop', meat_category_id, 'MEAT-PAYA-001', true, NOW(), NOW()),
    ('Burnt Paya', 'Prepared burnt paya, ready to serve', 9.99, 25, 'https://images.unsplash.com/photo-1603048297172-c9254474737e?w=400&h=400&fit=crop', meat_category_id, 'MEAT-PAYA-BURNT-001', true, NOW(), NOW())
    ON CONFLICT (product_code) DO NOTHING;
END $$;

