-- Add delivery fee column to orders table
ALTER TABLE orders ADD COLUMN delivery_fee DECIMAL(10, 2) DEFAULT 0.00;

-- Update existing orders to have delivery_fee = 0
UPDATE orders SET delivery_fee = 0.00 WHERE delivery_fee IS NULL;

