-- SQL commands to create databases for Grocery Store App
-- Run these in RDS Query Editor or psql

CREATE DATABASE grocerystore_auth;
CREATE DATABASE grocerystore_catalog;
CREATE DATABASE grocerystore_cart;
CREATE DATABASE grocerystore_order;
CREATE DATABASE grocerystore_payment;

-- Verify databases were created
SELECT datname FROM pg_database WHERE datname LIKE 'grocerystore%';
