-- Add payment method to payments table
ALTER TABLE payments ADD COLUMN payment_method VARCHAR(50);

-- Create index for payment method
CREATE INDEX idx_payments_payment_method ON payments(payment_method);

