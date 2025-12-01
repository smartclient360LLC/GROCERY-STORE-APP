-- Insert sample recipes
-- Note: product_id values should match actual product IDs in your database
-- Adjust these based on your actual product IDs

-- Recipe 1: Butter Chicken
INSERT INTO recipes (name, description, cuisine_type, cooking_time, servings, difficulty, image_url, instructions, created_at, updated_at)
VALUES (
    'Butter Chicken',
    'Creamy and flavorful Indian curry with tender chicken pieces in a rich tomato-based sauce.',
    'Indian',
    45,
    4,
    'Medium',
    'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=500',
    '1. Marinate chicken with yogurt and spices for 30 minutes
2. Cook chicken until golden brown
3. Prepare tomato-based gravy with butter and cream
4. Add chicken to gravy and simmer for 15 minutes
5. Garnish with fresh cilantro and serve hot with rice or naan',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
);

-- Recipe 2: Biryani
INSERT INTO recipes (name, description, cuisine_type, cooking_time, servings, difficulty, image_url, instructions, created_at, updated_at)
VALUES (
    'Chicken Biryani',
    'Fragrant basmati rice cooked with marinated chicken and aromatic spices, layered and slow-cooked to perfection.',
    'Indian',
    60,
    6,
    'Hard',
    'https://images.unsplash.com/photo-1563379091339-03246963d29c?w=500',
    '1. Marinate chicken with spices and yogurt
2. Parboil basmati rice with whole spices
3. Layer rice and chicken in a heavy-bottomed pot
4. Add saffron and fried onions
5. Cook on dum (steam) for 20-25 minutes
6. Serve hot with raita and salad',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
);

-- Recipe 3: Dal Makhani
INSERT INTO recipes (name, description, cuisine_type, cooking_time, servings, difficulty, image_url, instructions, created_at, updated_at)
VALUES (
    'Dal Makhani',
    'Creamy black lentils cooked with butter and cream, a rich and comforting North Indian dish.',
    'Indian',
    90,
    4,
    'Medium',
    'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=500',
    '1. Soak black lentils and kidney beans overnight
2. Pressure cook until soft
3. Prepare onion-tomato masala
4. Add lentils and simmer with butter and cream
5. Garnish with fresh cream and serve hot',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
);

-- Get recipe IDs (these will be used for ingredients)
-- Note: In a real scenario, you'd use the actual IDs returned from the INSERT statements
-- For now, we'll use a workaround with a subquery

-- Ingredients for Butter Chicken (Recipe ID = 1)
-- Note: Replace product_id values with actual product IDs from your products table
INSERT INTO recipe_ingredients (recipe_id, product_id, product_name, quantity, unit, notes, created_at)
SELECT 1, id, name, 1.0, 'lbs', 'cut into pieces', CURRENT_TIMESTAMP FROM products WHERE name ILIKE '%chicken%' OR name ILIKE '%meat%' LIMIT 1;

INSERT INTO recipe_ingredients (recipe_id, product_id, product_name, quantity, unit, notes, created_at)
SELECT 1, id, name, 2.0, 'tbsp', 'for marination', CURRENT_TIMESTAMP FROM products WHERE name ILIKE '%yogurt%' OR name ILIKE '%curd%' LIMIT 1;

INSERT INTO recipe_ingredients (recipe_id, product_id, product_name, quantity, unit, notes, created_at)
SELECT 1, id, name, 3.0, 'tbsp', 'for gravy', CURRENT_TIMESTAMP FROM products WHERE name ILIKE '%butter%' LIMIT 1;

INSERT INTO recipe_ingredients (recipe_id, product_id, product_name, quantity, unit, notes, created_at)
SELECT 1, id, name, 4.0, 'pieces', 'medium size', CURRENT_TIMESTAMP FROM products WHERE name ILIKE '%tomato%' LIMIT 1;

INSERT INTO recipe_ingredients (recipe_id, product_id, product_name, quantity, unit, notes, created_at)
SELECT 1, id, name, 0.5, 'cup', 'heavy cream', CURRENT_TIMESTAMP FROM products WHERE name ILIKE '%cream%' LIMIT 1;

-- Ingredients for Biryani (Recipe ID = 2)
INSERT INTO recipe_ingredients (recipe_id, product_id, product_name, quantity, unit, notes, created_at)
SELECT 2, id, name, 2.0, 'cups', 'basmati rice', CURRENT_TIMESTAMP FROM products WHERE name ILIKE '%rice%' OR name ILIKE '%basmati%' LIMIT 1;

INSERT INTO recipe_ingredients (recipe_id, product_id, product_name, quantity, unit, notes, created_at)
SELECT 2, id, name, 1.5, 'lbs', 'cut into pieces', CURRENT_TIMESTAMP FROM products WHERE name ILIKE '%chicken%' OR name ILIKE '%meat%' LIMIT 1;

INSERT INTO recipe_ingredients (recipe_id, product_id, product_name, quantity, unit, notes, created_at)
SELECT 2, id, name, 2.0, 'pieces', 'large', CURRENT_TIMESTAMP FROM products WHERE name ILIKE '%onion%' LIMIT 1;

INSERT INTO recipe_ingredients (recipe_id, product_id, product_name, quantity, unit, notes, created_at)
SELECT 2, id, name, 1.0, 'tsp', 'for color', CURRENT_TIMESTAMP FROM products WHERE name ILIKE '%saffron%' LIMIT 1;

-- Ingredients for Dal Makhani (Recipe ID = 3)
INSERT INTO recipe_ingredients (recipe_id, product_id, product_name, quantity, unit, notes, created_at)
SELECT 3, id, name, 1.0, 'cup', 'black lentils', CURRENT_TIMESTAMP FROM products WHERE name ILIKE '%lentil%' OR name ILIKE '%dal%' LIMIT 1;

INSERT INTO recipe_ingredients (recipe_id, product_id, product_name, quantity, unit, notes, created_at)
SELECT 3, id, name, 0.25, 'cup', 'kidney beans', CURRENT_TIMESTAMP FROM products WHERE name ILIKE '%bean%' LIMIT 1;

INSERT INTO recipe_ingredients (recipe_id, product_id, product_name, quantity, unit, notes, created_at)
SELECT 3, id, name, 3.0, 'tbsp', 'for richness', CURRENT_TIMESTAMP FROM products WHERE name ILIKE '%butter%' LIMIT 1;

INSERT INTO recipe_ingredients (recipe_id, product_id, product_name, quantity, unit, notes, created_at)
SELECT 3, id, name, 0.5, 'cup', 'heavy cream', CURRENT_TIMESTAMP FROM products WHERE name ILIKE '%cream%' LIMIT 1;

INSERT INTO recipe_ingredients (recipe_id, product_id, product_name, quantity, unit, notes, created_at)
SELECT 3, id, name, 2.0, 'pieces', 'medium', CURRENT_TIMESTAMP FROM products WHERE name ILIKE '%onion%' LIMIT 1;

INSERT INTO recipe_ingredients (recipe_id, product_id, product_name, quantity, unit, notes, created_at)
SELECT 3, id, name, 2.0, 'pieces', 'medium', CURRENT_TIMESTAMP FROM products WHERE name ILIKE '%tomato%' LIMIT 1;

