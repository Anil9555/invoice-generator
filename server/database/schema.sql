-- ============================================
-- INVOICE & QUOTATION GENERATOR
-- DATABASE SCHEMA
-- ============================================

-- 1. USERS
CREATE TABLE users (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(20),

    role ENUM('user', 'admin') DEFAULT 'user',
    status ENUM('active', 'inactive') DEFAULT 'active',

    email_verified BOOLEAN DEFAULT FALSE,
    last_login_at TIMESTAMP NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP
);


-- 2. BUSINESS PROFILES
CREATE TABLE business_profiles (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id INT UNSIGNED NOT NULL,

    business_name VARCHAR(150) NOT NULL,
    legal_name VARCHAR(150),
    logo_url VARCHAR(500),

    email VARCHAR(150),
    phone VARCHAR(20),
    website VARCHAR(255),

    address_line1 VARCHAR(255),
    address_line2 VARCHAR(255),
    city VARCHAR(100),
    state VARCHAR(100),
    country VARCHAR(100) DEFAULT 'India',
    postal_code VARCHAR(20),

    tax_number VARCHAR(50),
    currency VARCHAR(10) DEFAULT 'INR',

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_business_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    CONSTRAINT uq_business_user
        UNIQUE (user_id)
);


-- 3. CUSTOMERS
CREATE TABLE customers (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id INT UNSIGNED NOT NULL,

    customer_type ENUM('individual', 'business') DEFAULT 'individual',

    name VARCHAR(150) NOT NULL,
    company_name VARCHAR(150),

    email VARCHAR(150),
    phone VARCHAR(20),

    tax_number VARCHAR(50),

    billing_address_line1 VARCHAR(255),
    billing_address_line2 VARCHAR(255),
    billing_city VARCHAR(100),
    billing_state VARCHAR(100),
    billing_country VARCHAR(100) DEFAULT 'India',
    billing_postal_code VARCHAR(20),

    shipping_address_line1 VARCHAR(255),
    shipping_address_line2 VARCHAR(255),
    shipping_city VARCHAR(100),
    shipping_state VARCHAR(100),
    shipping_country VARCHAR(100) DEFAULT 'India',
    shipping_postal_code VARCHAR(20),

    notes TEXT,

    status ENUM('active', 'inactive') DEFAULT 'active',

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_customer_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    INDEX idx_customer_user (user_id),
    INDEX idx_customer_name (name),
    INDEX idx_customer_email (email)
);


-- 4. PRODUCTS / SERVICES
CREATE TABLE products (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id INT UNSIGNED NOT NULL,

    item_type ENUM('product', 'service') DEFAULT 'product',

    name VARCHAR(150) NOT NULL,
    description TEXT,

    sku VARCHAR(100),
    unit VARCHAR(30) DEFAULT 'pcs',

    price DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    tax_rate DECIMAL(5,2) DEFAULT 0.00,

    status ENUM('active', 'inactive') DEFAULT 'active',

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_product_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    INDEX idx_product_user (user_id),
    INDEX idx_product_name (name),
    INDEX idx_product_sku (sku)
);


-- 5. INVOICES
CREATE TABLE invoices (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,

    user_id INT UNSIGNED NOT NULL,
    customer_id INT UNSIGNED NOT NULL,

    invoice_number VARCHAR(50) NOT NULL,

    issue_date DATE NOT NULL,
    due_date DATE,

    status ENUM(
        'draft',
        'sent',
        'pending',
        'partially_paid',
        'paid',
        'overdue',
        'cancelled'
    ) DEFAULT 'draft',

    subtotal DECIMAL(12,2) NOT NULL DEFAULT 0.00,

    discount_type ENUM('fixed', 'percentage') DEFAULT 'fixed',
    discount_value DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    discount_amount DECIMAL(12,2) NOT NULL DEFAULT 0.00,

    tax_amount DECIMAL(12,2) NOT NULL DEFAULT 0.00,

    total_amount DECIMAL(12,2) NOT NULL DEFAULT 0.00,

    paid_amount DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    remaining_amount DECIMAL(12,2) NOT NULL DEFAULT 0.00,

    currency VARCHAR(10) DEFAULT 'INR',

    notes TEXT,
    terms_and_conditions TEXT,
    payment_instructions TEXT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_invoice_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_invoice_customer
        FOREIGN KEY (customer_id)
        REFERENCES customers(id)
        ON DELETE RESTRICT,

    UNIQUE KEY uq_invoice_user_number (user_id, invoice_number),

    INDEX idx_invoice_user (user_id),
    INDEX idx_invoice_customer (customer_id),
    INDEX idx_invoice_status (status),
    INDEX idx_invoice_issue_date (issue_date),
    INDEX idx_invoice_due_date (due_date)
);


-- 6. INVOICE ITEMS
CREATE TABLE invoice_items (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,

    invoice_id INT UNSIGNED NOT NULL,
    product_id INT UNSIGNED NULL,

    item_type ENUM('product', 'service') DEFAULT 'product',

    name VARCHAR(150) NOT NULL,
    description TEXT,
    sku VARCHAR(100),
    unit VARCHAR(30) DEFAULT 'pcs',

    quantity DECIMAL(12,3) NOT NULL DEFAULT 1.000,
    unit_price DECIMAL(12,2) NOT NULL DEFAULT 0.00,

    discount_type ENUM('fixed', 'percentage') DEFAULT 'fixed',
    discount_value DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    discount_amount DECIMAL(12,2) NOT NULL DEFAULT 0.00,

    tax_rate DECIMAL(5,2) NOT NULL DEFAULT 0.00,
    tax_amount DECIMAL(12,2) NOT NULL DEFAULT 0.00,

    line_total DECIMAL(12,2) NOT NULL DEFAULT 0.00,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_invoice_item_invoice
        FOREIGN KEY (invoice_id)
        REFERENCES invoices(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_invoice_item_product
        FOREIGN KEY (product_id)
        REFERENCES products(id)
        ON DELETE SET NULL,

    INDEX idx_invoice_item_invoice (invoice_id),
    INDEX idx_invoice_item_product (product_id)
);


-- 7. QUOTATIONS
CREATE TABLE quotations (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,

    user_id INT UNSIGNED NOT NULL,
    customer_id INT UNSIGNED NOT NULL,

    quotation_number VARCHAR(50) NOT NULL,

    issue_date DATE NOT NULL,
    valid_until DATE,

    status ENUM(
        'draft',
        'sent',
        'accepted',
        'rejected',
        'expired',
        'cancelled'
    ) DEFAULT 'draft',

    subtotal DECIMAL(12,2) NOT NULL DEFAULT 0.00,

    discount_type ENUM('fixed', 'percentage') DEFAULT 'fixed',
    discount_value DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    discount_amount DECIMAL(12,2) NOT NULL DEFAULT 0.00,

    tax_amount DECIMAL(12,2) NOT NULL DEFAULT 0.00,

    total_amount DECIMAL(12,2) NOT NULL DEFAULT 0.00,

    currency VARCHAR(10) DEFAULT 'INR',

    notes TEXT,
    terms_and_conditions TEXT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_quotation_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_quotation_customer
        FOREIGN KEY (customer_id)
        REFERENCES customers(id)
        ON DELETE RESTRICT,

    UNIQUE KEY uq_quotation_user_number (user_id, quotation_number),

    INDEX idx_quotation_user (user_id),
    INDEX idx_quotation_customer (customer_id),
    INDEX idx_quotation_status (status),
    INDEX idx_quotation_issue_date (issue_date),
    INDEX idx_quotation_valid_until (valid_until)
);


-- 8. QUOTATION ITEMS

CREATE TABLE quotation_items (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,

    quotation_id INT UNSIGNED NOT NULL,
    product_id INT UNSIGNED NULL,

    item_type ENUM('product', 'service') DEFAULT 'product',

    name VARCHAR(150) NOT NULL,
    description TEXT,
    sku VARCHAR(100),
    unit VARCHAR(30) DEFAULT 'pcs',

    quantity DECIMAL(12,3) NOT NULL DEFAULT 1.000,
    unit_price DECIMAL(12,2) NOT NULL DEFAULT 0.00,

    discount_type ENUM('fixed', 'percentage') DEFAULT 'fixed',
    discount_value DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    discount_amount DECIMAL(12,2) NOT NULL DEFAULT 0.00,

    tax_rate DECIMAL(5,2) NOT NULL DEFAULT 0.00,
    tax_amount DECIMAL(12,2) NOT NULL DEFAULT 0.00,

    line_total DECIMAL(12,2) NOT NULL DEFAULT 0.00,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_quotation_item_quotation
        FOREIGN KEY (quotation_id)
        REFERENCES quotations(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_quotation_item_product
        FOREIGN KEY (product_id)
        REFERENCES products(id)
        ON DELETE SET NULL,

    INDEX idx_quotation_item_quotation (quotation_id),
    INDEX idx_quotation_item_product (product_id)
);

