-- Default admin user (password: admin123)
INSERT INTO users (email, password, first_name, last_name, role, enabled, created_at, updated_at)
VALUES ('admin@grocerystore.com', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iwK8p6/Pa', 'Admin', 'User', 'ADMIN', true, NOW(), NOW());

-- Sample customer users (password: customer123)
INSERT INTO users (email, password, first_name, last_name, role, enabled, created_at, updated_at)
VALUES 
    ('customer1@grocerystore.com', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iwK8p6/Pa', 'John', 'Doe', 'CUSTOMER', true, NOW(), NOW()),
    ('customer2@grocerystore.com', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iwK8p6/Pa', 'Jane', 'Smith', 'CUSTOMER', true, NOW(), NOW());

