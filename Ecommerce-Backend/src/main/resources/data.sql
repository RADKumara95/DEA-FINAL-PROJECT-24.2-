-- Note: Tables are auto-created by Hibernate

-- Insert roles first (DataInitializer will skip if they exist)
INSERT INTO role (name) VALUES ('ROLE_USER');
INSERT INTO role (name) VALUES ('ROLE_ADMIN');
INSERT INTO role (name) VALUES ('ROLE_SELLER');

-- Insert sample users (passwords are BCrypt encoded - all passwords are "password123")
-- BCrypt hash for "password123": $2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi
INSERT INTO users (username, email, password, first_name, last_name, phone_number, created_at, updated_at, deleted, enabled) VALUES
('admin', 'admin@ecommerce.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Admin', 'User', '1234567890', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, false, true),
('john_doe', 'john@example.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'John', 'Doe', '9876543210', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, false, true),
('jane_smith', 'jane@example.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Jane', 'Smith', '5551234567', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, false, true),
('seller1', 'seller@ecommerce.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Seller', 'One', '5559876543', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, false, true);

-- Assign roles to users
-- Admin user gets ADMIN and USER roles
INSERT INTO user_roles (user_id, role_id) VALUES
(1, 2), -- admin gets ROLE_ADMIN
(1, 1), -- admin gets ROLE_USER
(2, 1), -- john_doe gets ROLE_USER
(3, 1), -- jane_smith gets ROLE_USER
(4, 3), -- seller1 gets ROLE_SELLER
(4, 1); -- seller1 gets ROLE_USER

-- Insert sample products
INSERT INTO products (name, description, brand, price, category, release_date, product_available, stock_quantity, created_at, updated_at, deleted) VALUES
('iPhone 14 Pro', 'Latest Apple smartphone with A16 Bionic chip and Dynamic Island', 'Apple', 999.99, 'Smartphones', '2023-09-16', true, 50, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, false),
('Samsung Galaxy S23', 'Flagship Android phone with 200MP camera and Snapdragon 8 Gen 2', 'Samsung', 899.99, 'Smartphones', '2023-02-17', true, 45, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, false),
('MacBook Pro 14"', 'Professional laptop with M2 Pro chip and stunning Liquid Retina XDR display', 'Apple', 1999.99, 'Laptops', '2023-01-24', true, 30, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, false),
('Dell XPS 13', 'Ultra-portable Windows laptop with InfinityEdge display', 'Dell', 1299.99, 'Laptops', '2023-03-10', true, 25, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, false),
('Sony WH-1000XM5', 'Industry-leading noise canceling wireless headphones', 'Sony', 399.99, 'Audio', '2022-05-12', true, 100, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, false),
('AirPods Pro 2', 'Active noise cancellation with Adaptive Audio', 'Apple', 249.99, 'Audio', '2023-09-23', true, 120, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, false),
('iPad Air 5', 'Powerful tablet with M1 chip and 10.9-inch Liquid Retina display', 'Apple', 599.99, 'Tablets', '2022-03-18', true, 60, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, false),
('Samsung Galaxy Tab S9', 'Premium Android tablet with AMOLED display and S Pen', 'Samsung', 799.99, 'Tablets', '2023-08-11', true, 40, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, false),
('Logitech MX Master 3S', 'Advanced wireless mouse with ultra-fast scrolling', 'Logitech', 99.99, 'Accessories', '2022-06-21', true, 200, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, false),
('Apple Watch Series 9', 'Advanced health and fitness smartwatch', 'Apple', 429.99, 'Wearables', '2023-09-22', true, 75, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, false),
('Google Pixel 8 Pro', 'AI-powered smartphone with amazing camera capabilities', 'Google', 999.99, 'Smartphones', '2023-10-12', true, 35, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, false),
('Microsoft Surface Pro 9', '2-in-1 tablet and laptop with Intel Core processor', 'Microsoft', 1299.99, 'Laptops', '2022-10-25', true, 20, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, false),
('Bose QuietComfort 45', 'Premium noise cancelling headphones with legendary comfort', 'Bose', 329.99, 'Audio', '2021-09-23', true, 80, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, false),
('Samsung Galaxy Buds2 Pro', 'Intelligent active noise canceling earbuds', 'Samsung', 229.99, 'Audio', '2022-08-26', true, 150, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, false),
('LG UltraFine 4K Monitor', '27-inch 4K display with USB-C connectivity', 'LG', 699.99, 'Monitors', '2023-01-15', true, 35, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, false);

-- Note: Orders and order items would typically be created through the application
-- when users make purchases. The DataInitializer handles role creation.
-- You can now register new users and they will automatically get the ROLE_USER role.