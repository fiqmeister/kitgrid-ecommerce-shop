-- create database with charset, meaning names in any language are stored correctly
CREATE DATABASE IF NOT EXISTS kitgrid
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE kitgrid;

CREATE TABLE users (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('customer', 'admin') NOT NULL DEFAULT 'customer',
    created_at DATETIME NOT NULL DEFAULT NOW()
) engine = innodb;

CREATE TABLE team_profiles (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    team_name VARCHAR(100) NOT NULL,
    age_group ENUM('mini_junior', 'youth', 'senior'),
    squad_size INT NOT NULL,
    colours VARCHAR(50)
) engine = innodb;

CREATE TABLE orders (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    status ENUM('pending_payment', 'paid', 'processing', 'shipped', 'delivered', 'cancelled') NOT NULL DEFAULT 'pending_payment',
    subtotal DECIMAL(10,2) NOT NULL,
    discount_total DECIMAL(10,2) NOT NULL,
    delivery_fee DECIMAL(10,2) NOT NULL,
    total DECIMAL(10,2) NOT NULL,
    recipient_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    address_line1 VARCHAR(128) NOT NULL,
    unit_number VARCHAR(20),
    address_line2 VARCHAR(128),
    postal_code CHAR(6) NOT NULL,
    stripe_session_id VARCHAR(255),
    created_at DATETIME NOT NULL DEFAULT NOW()
) engine = innodb;

CREATE TABLE order_items (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    quantity INT NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    discount_percent DECIMAL(5,2) NOT NULL,
    line_total DECIMAL(10,2) NOT NULL,
    product_name VARCHAR(100) NOT NULL,
    size VARCHAR(20) NOT NULL,
    colour VARCHAR(30) NOT NULL
) engine = innodb;

CREATE TABLE order_status_history (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    status ENUM('pending_payment', 'paid', 'processing', 'shipped', 'delivered', 'cancelled') NOT NULL,
    changed_at DATETIME NOT NULL DEFAULT NOW()
) engine = innodb;

CREATE TABLE categories (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE
) engine = innodb;

CREATE TABLE products (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    base_price DECIMAL(10,2) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT 1,
    pitch_surface ENUM('FG', 'AG', 'indoor', 'all'),
    material VARCHAR(100),
    weight_grams INT,
    skill_level ENUM('youth', 'amateur', 'pro'),
    durability_rating INT,
    is_bulk_eligible BOOLEAN NOT NULL DEFAULT 1,
    created_at DATETIME NOT NULL DEFAULT NOW()
) engine = innodb;

CREATE TABLE product_variants (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    sku VARCHAR(50) NOT NULL UNIQUE,
    size VARCHAR(20) NOT NULL,
    colour VARCHAR(30) NOT NULL,
    age_group ENUM('mini_junior', 'youth', 'senior'),
    stock INT NOT NULL DEFAULT 0,
    low_stock_threshold INT NOT NULL DEFAULT 10
) engine = innodb;

CREATE TABLE cart_items (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    quantity INT NOT NULL,
    saved_for_later BOOLEAN NOT NULL DEFAULT 0,
    created_at DATETIME NOT NULL DEFAULT NOW()
) engine = innodb;

CREATE TABLE tags (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE
) engine = innodb;

CREATE TABLE product_tags (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY
) engine = innodb;

CREATE TABLE refresh_tokens (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    token_hash CHAR(64) NOT NULL,
    is_revoked BOOLEAN NOT NULL DEFAULT 0,
    expires_at DATETIME NOT NULL,
    created_at DATETIME NOT NULL DEFAULT NOW()
) engine = innodb;

CREATE TABLE bulk_discount_rules (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    min_quantity INT NOT NULL UNIQUE,
    discount_percent DECIMAL(5,2) NOT NULL
) engine = innodb;

ALTER TABLE team_profiles
    ADD COLUMN user_id INT UNSIGNED NOT NULL UNIQUE,
    ADD CONSTRAINT fk_team_profiles_user_id
        FOREIGN KEY (user_id) references users(id)
        ON DELETE CASCADE
        ON UPDATE RESTRICT;

ALTER TABLE orders
    ADD COLUMN user_id INT UNSIGNED NOT NULL,
    ADD CONSTRAINT fk_orders_user_id
        FOREIGN KEY (user_id) references users(id)
        ON DELETE RESTRICT
        ON UPDATE RESTRICT;

ALTER TABLE order_items
    ADD COLUMN order_id INT UNSIGNED NOT NULL,
    ADD COLUMN variant_id INT UNSIGNED NOT NULL,
    ADD CONSTRAINT fk_order_items_order_id
        FOREIGN KEY (order_id) references orders(id)
        ON DELETE RESTRICT
        ON UPDATE RESTRICT,
    ADD CONSTRAINT fk_order_items_variant_id
        FOREIGN KEY (variant_id) references product_variants(id)
        ON DELETE RESTRICT
        ON UPDATE RESTRICT;

ALTER TABLE order_status_history
    ADD COLUMN order_id INT UNSIGNED NOT NULL,
    ADD COLUMN changed_by INT UNSIGNED,
    ADD CONSTRAINT fk_order_status_history_order_id
        FOREIGN KEY (order_id) references orders(id)
        ON DELETE RESTRICT
        ON UPDATE RESTRICT,
    ADD CONSTRAINT fk_order_status_history_changed_by
        FOREIGN KEY (changed_by) references users(id)
        ON DELETE RESTRICT
        ON UPDATE RESTRICT;

ALTER TABLE products
    ADD COLUMN category_id INT UNSIGNED NOT NULL,
    ADD CONSTRAINT fk_products_category_id
        FOREIGN KEY (category_id) references categories(id)
        ON DELETE RESTRICT
        ON UPDATE RESTRICT;

ALTER TABLE product_variants
    ADD COLUMN product_id INT UNSIGNED NOT NULL,
    ADD CONSTRAINT fk_product_variants_product_id
        FOREIGN KEY (product_id) references products(id)
        ON DELETE RESTRICT
        ON UPDATE RESTRICT;

ALTER TABLE product_tags
    ADD COLUMN product_id INT UNSIGNED NOT NULL,
    ADD COLUMN tag_id INT UNSIGNED NOT NULL,
    ADD CONSTRAINT fk_product_tags_product_id
        FOREIGN KEY (product_id) references products(id)
        ON DELETE CASCADE
        ON UPDATE RESTRICT,
    ADD CONSTRAINT fk_product_tags_tag_id
        FOREIGN KEY (tag_id) references tags(id)
        ON DELETE CASCADE
        ON UPDATE RESTRICT,
    ADD CONSTRAINT uq_product_tags_product_tag
        UNIQUE (product_id, tag_id);
        -- a safety net to refuse duplicate entry

ALTER TABLE cart_items
    ADD COLUMN user_id INT UNSIGNED NOT NULL,
    ADD COLUMN variant_id INT UNSIGNED NOT NULL,
    ADD CONSTRAINT fk_cart_items_user_id
        FOREIGN KEY (user_id) references users(id)
        ON DELETE CASCADE
        ON UPDATE RESTRICT,
    ADD CONSTRAINT fk_cart_items_variant_id
        FOREIGN KEY (variant_id) references product_variants(id)
        ON DELETE CASCADE
        ON UPDATE RESTRICT,
    ADD CONSTRAINT uq_cart_items_user_variant
        UNIQUE (user_id, variant_id);
        -- a safety net to refuse duplicate entry

ALTER TABLE refresh_tokens
    ADD COLUMN user_id INT UNSIGNED NOT NULL,
    ADD CONSTRAINT fk_refresh_tokens_user_id
        FOREIGN KEY (user_id) references users(id)
        ON DELETE CASCADE
        ON UPDATE RESTRICT;