-- Create recipes table
CREATE TABLE recipes (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    cuisine_type VARCHAR(100), -- e.g., "Indian", "American", "Italian"
    cooking_time INTEGER, -- in minutes
    servings INTEGER, -- number of servings
    difficulty VARCHAR(50), -- "Easy", "Medium", "Hard"
    image_url VARCHAR(500),
    instructions TEXT, -- cooking instructions
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create recipe_ingredients table (many-to-many relationship)
CREATE TABLE recipe_ingredients (
    id BIGSERIAL PRIMARY KEY,
    recipe_id BIGINT NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
    product_id BIGINT NOT NULL, -- References products, but no foreign key to allow flexibility
    product_name VARCHAR(255) NOT NULL, -- Store name for flexibility
    quantity DECIMAL(10, 2), -- Quantity needed (e.g., 2, 1.5)
    unit VARCHAR(50), -- Unit of measurement (e.g., "cups", "tbsp", "lbs", "pieces")
    notes VARCHAR(255), -- Optional notes (e.g., "chopped", "optional")
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX idx_recipes_cuisine ON recipes(cuisine_type);
CREATE INDEX idx_recipe_ingredients_recipe ON recipe_ingredients(recipe_id);
CREATE INDEX idx_recipe_ingredients_product ON recipe_ingredients(product_id);

