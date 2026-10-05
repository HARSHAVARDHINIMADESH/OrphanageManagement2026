CREATE DATABASE IF NOT EXISTS hands2hands;

USE hands2hands;


-- =========================================
-- USERS TABLE
-- =========================================

CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,

    name VARCHAR(100) NOT NULL,

    email VARCHAR(150) NOT NULL UNIQUE,

    password_hash VARCHAR(255) NOT NULL,

    role ENUM(
        'user',
        'staff',
        'admin'
    ) NOT NULL DEFAULT 'user',

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- =========================================
-- CHILDREN TABLE
-- =========================================

CREATE TABLE IF NOT EXISTS children (
    id INT AUTO_INCREMENT PRIMARY KEY,

    name VARCHAR(150) NOT NULL,

    date_of_birth DATE NULL,

    gender VARCHAR(20) NULL,

    medical_info TEXT NULL,

    education VARCHAR(255) NULL,

    status ENUM(
        'active',
        'adopted',
        'inactive'
    ) NOT NULL DEFAULT 'active',

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- =========================================
-- VOLUNTEERS TABLE
-- =========================================

CREATE TABLE IF NOT EXISTS volunteers (
    id INT AUTO_INCREMENT PRIMARY KEY,

    name VARCHAR(100) NOT NULL,

    email VARCHAR(150) NOT NULL,

    phone VARCHAR(30) NOT NULL,

    availability VARCHAR(255) NULL,

    activities VARCHAR(255) NULL,

    message TEXT NULL,

    status ENUM(
        'pending',
        'approved',
        'rejected'
    ) NOT NULL DEFAULT 'pending',

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- =========================================
-- CONTACT MESSAGES TABLE
-- =========================================

CREATE TABLE IF NOT EXISTS contact_messages (
    id INT AUTO_INCREMENT PRIMARY KEY,

    name VARCHAR(100) NOT NULL,

    email VARCHAR(150) NOT NULL,

    message TEXT NOT NULL,

    status ENUM(
        'new',
        'read',
        'replied',
        'closed'
    ) NOT NULL DEFAULT 'new',

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- =========================================
-- ADOPTION APPLICATIONS TABLE
-- =========================================

CREATE TABLE IF NOT EXISTS adoption_applications (
    id INT AUTO_INCREMENT PRIMARY KEY,

    child_id INT NOT NULL,

    user_id INT NOT NULL,

    application_date DATE NOT NULL,

    status ENUM(
        'pending',
        'approved',
        'rejected',
        'completed'
    ) NOT NULL DEFAULT 'pending',

    remarks TEXT NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_adoption_child
        FOREIGN KEY (child_id)
        REFERENCES children(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_adoption_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
);


-- =========================================
-- DONATIONS TABLE
-- =========================================

CREATE TABLE IF NOT EXISTS donations (
    id INT AUTO_INCREMENT PRIMARY KEY,

    user_id INT NOT NULL,

    amount DECIMAL(10,2) NOT NULL,

    purpose VARCHAR(255) DEFAULT 'General',

    payment_status ENUM(
        'pending',
        'paid',
        'failed',
        'refunded'
    ) NOT NULL DEFAULT 'pending',

    transaction_id VARCHAR(255) NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_donation_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
);


-- =========================================
-- SAMPLE CHILDREN
-- =========================================

INSERT INTO children
(
    name,
    date_of_birth,
    gender,
    education,
    medical_info,
    status
)
VALUES
(
    'Arun',
    '2014-06-15',
    'Male',
    'Primary School',
    'No major medical issues',
    'active'
),
(
    'Anitha',
    '2013-09-22',
    'Female',
    'Primary School',
    'Healthy',
    'active'
),
(
    'Kavin',
    '2015-02-10',
    'Male',
    'Primary School',
    'Regular health checkups',
    'active'
);


-- =========================================
-- CHECK TABLES
-- =========================================

SELECT * FROM users;

SELECT * FROM children;

SELECT * FROM volunteers;

SELECT * FROM contact_messages;

SELECT * FROM adoption_applications;

SELECT * FROM donations;