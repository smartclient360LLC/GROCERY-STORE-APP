-- Add weight column to cart_items table (for weight-based products like meat, fruits, vegetables)
ALTER TABLE cart_items ADD COLUMN weight DECIMAL(10, 2);

-- Update existing records: if quantity exists, set weight = quantity (for backward compatibility)
UPDATE cart_items SET weight = quantity WHERE weight IS NULL;

