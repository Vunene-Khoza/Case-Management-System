-- Seed data for University of Venda Legal & Labour Case Management System

-- Seed default cases if table is empty
INSERT IGNORE INTO cases (case_id, employee_number, employee_name, case_type, classification, description, date_opened, trial_date, status, closure_date, final_notes, costing, created_at, updated_at)
VALUES 
('C001', 'EMP1001', 'John Doe', 'LEGAL', 'DISCIPLINARY', 'Disciplinary hearing regarding compliance violation.', '2026-03-01', '2026-04-10', 'OPEN', NULL, NULL, 15000.00, NOW(), NOW()),
('C002', 'EMP1002', 'Mary Khosa', 'LABOUR', 'DISPUTE', 'Labour dispute over contractual terms resolution.', '2026-02-15', '2026-03-15', 'CLOSED', '2026-03-18', 'Case settled out of court with mutual consent.', 25000.00, NOW(), NOW());

INSERT IGNORE INTO case_reminder_dates (case_id, reminder_date)
VALUES 
('C001', '2026-04-01'),
('C001', '2026-04-05'),
('C002', '2026-03-01');
