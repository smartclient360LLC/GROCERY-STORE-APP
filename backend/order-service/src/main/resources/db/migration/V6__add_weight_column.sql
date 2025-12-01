-- Add weight column to order_items table (for weight-based products like meat, fruits, vegetables)
ALTER TABLE order_items ADD COLUMN weight DECIMAL(10, 2);

-- Update existing records: if quantity exists, set weight = quantity (for backward compatibility)
UPDATE order_items SET weight = quantity WHERE weight IS NULL;

