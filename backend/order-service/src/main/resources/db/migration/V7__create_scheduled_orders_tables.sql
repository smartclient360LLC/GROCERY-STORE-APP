-- Create scheduled_orders table for bulk and recurring orders
CREATE TABLE scheduled_orders (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    order_name VARCHAR(255), -- e.g., "Weekly Groceries", "Party Order", "Monthly Stock"
    order_type VARCHAR(50) NOT NULL, -- 'ONE_TIME', 'RECURRING'
    recurrence_type VARCHAR(50), -- 'WEEKLY', 'MONTHLY', 'DAILY' (null for one-time)
    scheduled_date DATE NOT NULL, -- When to place/deliver the order
    scheduled_time TIME, -- Optional specific time
    delivery_date DATE, -- When to deliver (can be different from scheduled_date)
    delivery_time TIME, -- Optional delivery time window
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING', -- 'PENDING', 'ACTIVE', 'COMPLETED', 'CANCELLED', 'PAUSED'
    next_execution_date DATE, -- For recurring orders
    end_date DATE, -- Optional end date for recurring orders
    max_occurrences INTEGER, -- Optional max number of occurrences
    current_occurrence INTEGER DEFAULT 0, -- Track how many times executed
    cart_snapshot JSONB, -- Store cart items at time of scheduling
    shipping_address JSONB, -- Store shipping address
    delivery_point VARCHAR(255),
    notes TEXT, -- Optional notes for the order
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create scheduled_order_items table to store items for scheduled orders
CREATE TABLE scheduled_order_items (
    id BIGSERIAL PRIMARY KEY,
    scheduled_order_id BIGINT NOT NULL REFERENCES scheduled_orders(id) ON DELETE CASCADE,
    product_id BIGINT NOT NULL,
    product_name VARCHAR(255) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    quantity INTEGER NOT NULL,
    weight DECIMAL(10, 2), -- For weight-based items
    subtotal DECIMAL(10, 2) NOT NULL
);

-- Create order_execution_history table to track when scheduled orders were executed
CREATE TABLE order_execution_history (
    id BIGSERIAL PRIMARY KEY,
    scheduled_order_id BIGINT NOT NULL REFERENCES scheduled_orders(id) ON DELETE CASCADE,
    executed_order_id BIGINT REFERENCES orders(id), -- Link to actual order created
    execution_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(50) NOT NULL, -- 'SUCCESS', 'FAILED', 'SKIPPED'
    error_message TEXT -- If execution failed
);

-- Create indexes
CREATE INDEX idx_scheduled_orders_user ON scheduled_orders(user_id);
CREATE INDEX idx_scheduled_orders_status ON scheduled_orders(status);
CREATE INDEX idx_scheduled_orders_scheduled_date ON scheduled_orders(scheduled_date);
CREATE INDEX idx_scheduled_orders_next_execution ON scheduled_orders(next_execution_date);
CREATE INDEX idx_scheduled_order_items_scheduled ON scheduled_order_items(scheduled_order_id);
CREATE INDEX idx_execution_history_scheduled ON order_execution_history(scheduled_order_id);
CREATE INDEX idx_execution_history_execution_date ON order_execution_history(execution_date);

