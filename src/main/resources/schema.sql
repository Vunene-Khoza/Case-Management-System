-- Database Schema for University of Venda Legal & Labour Case Management System

CREATE TABLE IF NOT EXISTS users (
    user_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS employees (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    employee_number VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    surname VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    phone_number VARCHAR(25) NOT NULL,
    id_number VARCHAR(25) NOT NULL,
    department VARCHAR(100) NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS cases (
    case_id VARCHAR(50) PRIMARY KEY,
    employee_number VARCHAR(50) NOT NULL,
    employee_name VARCHAR(100) NOT NULL,
    case_type VARCHAR(50) NOT NULL,
    classification VARCHAR(50) NOT NULL,
    description TEXT,
    date_opened DATE NOT NULL,
    trial_date DATE,
    status VARCHAR(50) NOT NULL DEFAULT 'OPEN',
    closure_date DATE,
    final_notes TEXT,
    costing DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS case_reminder_dates (
    case_id VARCHAR(50) NOT NULL,
    reminder_date DATE NOT NULL,
    FOREIGN KEY (case_id) REFERENCES cases(case_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS case_notes (
    note_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    case_id VARCHAR(50) NOT NULL,
    author_id BIGINT NOT NULL,
    author_name VARCHAR(100) NOT NULL,
    content TEXT NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (case_id) REFERENCES cases(case_id) ON DELETE CASCADE,
    FOREIGN KEY (author_id) REFERENCES users(user_id)
);

CREATE TABLE IF NOT EXISTS activity_logs (
    log_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT,
    user_name VARCHAR(100),
    action VARCHAR(255) NOT NULL,
    details TEXT,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
