-- Add delivery_point column to orders table (shipping address)
ALTER TABLE orders ADD COLUMN delivery_point VARCHAR(255);

