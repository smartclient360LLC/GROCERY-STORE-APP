-- Add carbon footprint columns to orders table
ALTER TABLE orders 
ADD COLUMN carbon_footprint_kg DECIMAL(10, 4) DEFAULT 0,
ADD COLUMN delivery_distance_km DECIMAL(10, 2),
ADD COLUMN packaging_type VARCHAR(50) DEFAULT 'STANDARD';

-- Create carbon footprint history table for tracking over time
CREATE TABLE carbon_footprint_history (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    order_id BIGINT REFERENCES orders(id) ON DELETE SET NULL,
    carbon_footprint_kg DECIMAL(10, 4) NOT NULL,
    order_date DATE NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create index for faster queries
CREATE INDEX idx_carbon_footprint_user ON carbon_footprint_history(user_id);
CREATE INDEX idx_carbon_footprint_date ON carbon_footprint_history(order_date);
CREATE INDEX idx_orders_carbon ON orders(carbon_footprint_kg);

-- Create user carbon footprint summary view (optional, can be calculated on the fly)
CREATE OR REPLACE VIEW user_carbon_summary AS
SELECT 
    user_id,
    COUNT(*) as total_orders,
    SUM(carbon_footprint_kg) as total_carbon_kg,
    AVG(carbon_footprint_kg) as avg_carbon_per_order_kg,
    MIN(carbon_footprint_kg) as min_carbon_kg,
    MAX(carbon_footprint_kg) as max_carbon_kg,
    MIN(order_date) as first_order_date,
    MAX(order_date) as last_order_date
FROM carbon_footprint_history
GROUP BY user_id;

