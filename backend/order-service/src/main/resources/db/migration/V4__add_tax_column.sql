-- Add tax column to orders table
ALTER TABLE orders ADD COLUMN tax_amount DECIMAL(10, 2) DEFAULT 0.00;
ALTER TABLE orders ADD COLUMN subtotal DECIMAL(10, 2);

-- Update existing orders to have tax_amount = 0 and subtotal = total_amount
UPDATE orders SET tax_amount = 0.00, subtotal = total_amount WHERE tax_amount IS NULL;

