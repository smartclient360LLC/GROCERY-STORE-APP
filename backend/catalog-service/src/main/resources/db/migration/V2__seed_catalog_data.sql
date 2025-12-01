-- Insert Categories
INSERT INTO categories (name, description, created_at, updated_at) VALUES
('Fruits & Vegetables', 'Fresh fruits and vegetables', NOW(), NOW()),
('Dairy & Eggs', 'Milk, cheese, eggs, and dairy products', NOW(), NOW()),
('Meat & Seafood', 'Fresh meat and seafood', NOW(), NOW()),
('Bakery', 'Bread, pastries, and baked goods', NOW(), NOW()),
('Beverages', 'Drinks, juices, and beverages', NOW(), NOW()),
('Snacks', 'Chips, cookies, and snacks', NOW(), NOW()),
('Frozen Foods', 'Frozen meals and ingredients', NOW(), NOW()),
('Pantry Staples', 'Rice, pasta, canned goods', NOW(), NOW());

-- Insert Products
INSERT INTO products (name, description, price, stock_quantity, image_url, category_id, active, created_at, updated_at) VALUES
-- Fruits & Vegetables
('Organic Apples', 'Fresh organic red apples, 1kg', 4.99, 50, 'https://via.placeholder.com/300?text=Apples', 1, true, NOW(), NOW()),
('Bananas', 'Fresh yellow bananas, 1kg', 2.49, 75, 'https://via.placeholder.com/300?text=Bananas', 1, true, NOW(), NOW()),
('Carrots', 'Fresh carrots, 500g', 1.99, 60, 'https://via.placeholder.com/300?text=Carrots', 1, true, NOW(), NOW()),
('Tomatoes', 'Fresh red tomatoes, 500g', 3.49, 40, 'https://via.placeholder.com/300?text=Tomatoes', 1, true, NOW(), NOW()),

-- Dairy & Eggs
('Whole Milk', 'Fresh whole milk, 1L', 2.99, 100, 'https://via.placeholder.com/300?text=Milk', 2, true, NOW(), NOW()),
('Free Range Eggs', '12 large free range eggs', 4.99, 80, 'https://via.placeholder.com/300?text=Eggs', 2, true, NOW(), NOW()),
('Cheddar Cheese', 'Aged cheddar cheese, 250g', 5.99, 45, 'https://via.placeholder.com/300?text=Cheese', 2, true, NOW(), NOW()),
('Greek Yogurt', 'Plain Greek yogurt, 500g', 3.99, 55, 'https://via.placeholder.com/300?text=Yogurt', 2, true, NOW(), NOW()),

-- Meat & Seafood
('Chicken Breast', 'Fresh chicken breast, 500g', 8.99, 30, 'https://via.placeholder.com/300?text=Chicken', 3, true, NOW(), NOW()),
('Salmon Fillet', 'Fresh salmon fillet, 300g', 12.99, 25, 'https://via.placeholder.com/300?text=Salmon', 3, true, NOW(), NOW()),
('Ground Beef', 'Fresh ground beef, 500g', 7.99, 35, 'https://via.placeholder.com/300?text=Beef', 3, true, NOW(), NOW()),

-- Bakery
('Whole Wheat Bread', 'Fresh whole wheat bread loaf', 3.49, 40, 'https://via.placeholder.com/300?text=Bread', 4, true, NOW(), NOW()),
('Croissants', 'Buttery croissants, pack of 4', 4.99, 30, 'https://via.placeholder.com/300?text=Croissants', 4, true, NOW(), NOW()),

-- Beverages
('Orange Juice', 'Fresh squeezed orange juice, 1L', 3.99, 50, 'https://via.placeholder.com/300?text=Juice', 5, true, NOW(), NOW()),
('Sparkling Water', 'Sparkling mineral water, 1L', 1.99, 100, 'https://via.placeholder.com/300?text=Water', 5, true, NOW(), NOW()),
('Coffee Beans', 'Premium arabica coffee beans, 500g', 12.99, 40, 'https://via.placeholder.com/300?text=Coffee', 5, true, NOW(), NOW()),

-- Snacks
('Potato Chips', 'Classic potato chips, 200g', 2.99, 80, 'https://via.placeholder.com/300?text=Chips', 6, true, NOW(), NOW()),
('Chocolate Cookies', 'Chocolate chip cookies, 300g', 4.49, 60, 'https://via.placeholder.com/300?text=Cookies', 6, true, NOW(), NOW()),

-- Frozen Foods
('Frozen Pizza', 'Margherita frozen pizza', 6.99, 35, 'https://via.placeholder.com/300?text=Pizza', 7, true, NOW(), NOW()),
('Ice Cream', 'Vanilla ice cream, 500ml', 5.99, 45, 'https://via.placeholder.com/300?text=Ice+Cream', 7, true, NOW(), NOW()),

-- Pantry Staples
('White Rice', 'Long grain white rice, 1kg', 3.99, 70, 'https://via.placeholder.com/300?text=Rice', 8, true, NOW(), NOW()),
('Pasta', 'Spaghetti pasta, 500g', 2.49, 90, 'https://via.placeholder.com/300?text=Pasta', 8, true, NOW(), NOW()),
('Canned Tomatoes', 'Whole canned tomatoes, 400g', 1.99, 100, 'https://via.placeholder.com/300?text=Canned+Tomatoes', 8, true, NOW(), NOW());

