-- =============================================================================
-- Seed Data for University of Venda Legal & Labour Case Management System
-- Runs AFTER Hibernate DDL creates all tables (defer-datasource-initialization=true)
-- =============================================================================

-- Default Users (passwords are BCrypt encoded)
-- Admin@123 -> $2a$10$... (BCrypt)
-- Officer@123 -> BCrypt
-- Viewer@123 -> BCrypt
INSERT IGNORE INTO users (name, email, password, role, status, created_at)
VALUES
('System Admin', 'admin@univen.ac.za', '$2a$10$eLyY5O6xQe7r3ZpmLZO8HOSvf9bnABluF5WJ1Ah2EyH5nYMdM4ttu', 'ADMIN', 'ACTIVE', NOW()),
('Legal Officer One', 'officer@univen.ac.za', '$2a$10$bG5GULn9dJkqYvhBjXVjSOvXqm6y/dS5hmLl4u5G5.P.xhInAQT.y', 'LEGAL_OFFICER', 'ACTIVE', NOW()),
('Standard Viewer', 'viewer@univen.ac.za', '$2a$10$v7q1q2D5yMt2zBrkl7tFwem9O6gKzBt.RCU1pScKLpRjJAnhGJBLy', 'VIEWER', 'ACTIVE', NOW());

-- Seed default cases
INSERT IGNORE INTO cases (case_id, employee_number, employee_name, case_type, classification, description, date_opened, trial_date, status, closure_date, final_notes, costing, created_at, updated_at)
VALUES
('C001', 'EMP1001', 'John Doe', 'LEGAL', 'DISCIPLINARY', 'Disciplinary hearing regarding compliance violation.', '2026-03-01', '2026-04-10', 'OPEN', NULL, NULL, 15000.00, NOW(), NOW()),
('C002', 'EMP1002', 'Mary Khosa', 'LABOUR', 'DISPUTE', 'Labour dispute over contractual terms resolution.', '2026-02-15', '2026-03-15', 'CLOSED', '2026-03-18', 'Case settled out of court with mutual consent.', 25000.00, NOW(), NOW());

-- Seed reminder dates
INSERT IGNORE INTO case_reminder_dates (case_id, reminder_date)
VALUES
('C001', '2026-04-01'),
('C001', '2026-04-05'),
('C002', '2026-03-01');

-- Seed university employees
INSERT IGNORE INTO employees (employee_number, name, surname, email, phone_number, id_number, department, created_at)
VALUES
('10012', 'Ripfumelo', 'Mukosi', 'mukosi@univen.ac.za', '+27 15 962 8000', '8501015800081', 'Department of Legal Services', NOW()),
('12345', 'Tshilidzi', 'Avhashoni', 'avhashoni.tshilidzi@univen.ac.za', '+27 15 962 8114', '8902155800083', 'Office of the Registrar', NOW()),
('31007', 'Vhutshilo', 'Sinthumule', 'sinthumule.vhutshilo@univen.ac.za', '+27 15 962 8452', '9107245800087', 'Human Resources Directorate', NOW()),
('40234', 'Ndidzulafhi', 'Baloyi', 'baloyi.ndidzulafhi@univen.ac.za', '+27 15 962 8901', '8405125800084', 'Faculty of Management & Law', NOW()),
('51923', 'Livhuwani', 'Makhuvha', 'livhuwani.makhuvha@univen.ac.za', '+27 15 962 8332', '9303185800089', 'Information & Communication Technology', NOW()),
('60114', 'Khathutshelo', 'Nemutanzhela', 'nemutanzhela.k@univen.ac.za', '+27 15 962 8776', '8809095800082', 'Finance Directorate', NOW()),
('71205', 'Rudzani', 'Madzivhandila', 'madzivhandila.rudzani@univen.ac.za', '+27 15 962 8510', '9004125800085', 'Faculty of Science, Engineering & Agriculture', NOW()),
('82341', 'Ndivhuwo', 'Ramabulana', 'ramabulana.ndivhuwo@univen.ac.za', '+27 15 962 8625', '8711035800081', 'Facilities Management & Campus Security', NOW()),
('93452', 'Funanani', 'Netshifhefhe', 'netshifhefhe.funanani@univen.ac.za', '+27 15 962 8734', '9408225800086', 'Directorate of Research & Innovation', NOW()),
('24563', 'Mulatedzi', 'Mudau', 'mudau.mulatedzi@univen.ac.za', '+27 15 962 8840', '8606155800082', 'Academic Affairs & Examinations', NOW()),
('35674', 'Thanyani', 'Khorommbi', 'khorommbi.thanyani@univen.ac.za', '+27 15 962 8955', '9212055800088', 'Student Affairs & Governance', NOW());
