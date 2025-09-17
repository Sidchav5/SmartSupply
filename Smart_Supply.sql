-- Create the database
CREATE DATABASE IF NOT EXISTS smart_supply;
USE smart_supply;

-- Table: consumers
CREATE TABLE consumers (
    id INT NOT NULL AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password TEXT NOT NULL,
    PRIMARY KEY (id)
);

-- Table: marketplace_managers
CREATE TABLE marketplace_managers (
    id INT NOT NULL AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password TEXT NOT NULL,
    location VARCHAR(100) NOT NULL,
    manager_id VARCHAR(50) NOT NULL UNIQUE,
    PRIMARY KEY (id)
);

-- Table: marketplace_sales
CREATE TABLE marketplace_sales (
    id INT NOT NULL AUTO_INCREMENT,
    manager_id VARCHAR(50) NOT NULL,
    product_id INT NOT NULL,
    sold_quantity INT NOT NULL,
    sale_date DATE NOT NULL,
    PRIMARY KEY (id),
    FOREIGN KEY (manager_id) REFERENCES marketplace_managers(manager_id),
    FOREIGN KEY (product_id) REFERENCES products(id)
);

-- Table: offline_inventory
CREATE TABLE offline_inventory (
    product_id INT,
    manager_id VARCHAR(50),
    quantity INT,
    initial_quantity INT DEFAULT 0,
    FOREIGN KEY (product_id) REFERENCES products(id),
    FOREIGN KEY (manager_id) REFERENCES marketplace_managers(manager_id)
);

-- Table: online_inventory
CREATE TABLE online_inventory (
    product_id INT,
    quantity INT,
    FOREIGN KEY (product_id) REFERENCES products(id)
);

-- Table: orders
CREATE TABLE orders (
    id INT NOT NULL AUTO_INCREMENT,
    consumer_id INT NOT NULL,
    name VARCHAR(100),
    address TEXT,
    payment_mode VARCHAR(50),
    total_amount DECIMAL(10,2),
    order_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    FOREIGN KEY (consumer_id) REFERENCES consumers(id)
);

-- Table: order_items
CREATE TABLE order_items (
    id INT NOT NULL AUTO_INCREMENT,
    order_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT NOT NULL,
    price_at_order DECIMAL(10,2),
    PRIMARY KEY (id),
    FOREIGN KEY (order_id) REFERENCES orders(id),
    FOREIGN KEY (product_id) REFERENCES products(id)
);

-- Table: products
CREATE TABLE products (
    id INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    total_quantity INT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    image_base64 LONGTEXT,
    price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    PRIMARY KEY (id)
);

-- Table: users
CREATE TABLE users (
    id INT NOT NULL AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password TEXT NOT NULL,
    role ENUM('Consumer','Marketplace Manager','Warehouse Manager') NOT NULL,
    PRIMARY KEY (id)
);

-- Table: warehouse_managers
CREATE TABLE warehouse_managers (
    id INT NOT NULL AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password TEXT NOT NULL,
    PRIMARY KEY (id)
);
