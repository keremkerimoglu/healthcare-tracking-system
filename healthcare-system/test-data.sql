-- Healthcare System Test Data
-- Replace with your database credentials

-- Insert Departments
INSERT INTO departments (name, description) VALUES 
('Kardiyoloji', 'Kalp ve damar hastalıkları'),
('Nöroloji', 'Sinir sistemi hastalıkları'),
('Ortopedi', 'Kemik ve eklem hastalıkları'),
('Dermatoloji', 'Cilt hastalıkları'),
('Göz Hastalıkları', 'Göz problemleri');

-- Insert Users (Doctors with passwords pre-hashed if needed)
-- Note: Passwords should be BCrypt hashed. Using plain text here, will be hashed by backend

-- Insert Doctors
INSERT INTO users (user_type, email, password, role, created_at, updated_at) VALUES 
('Doctor', 'dr.ahmet@hospital.com', 'pass123', 'DOCTOR', NOW(), NOW()),
('Doctor', 'dr.fatma@hospital.com', 'pass123', 'DOCTOR', NOW(), NOW()),
('Doctor', 'dr.mehmet@hospital.com', 'pass123', 'DOCTOR', NOW(), NOW()),
('Doctor', 'dr.selin@hospital.com', 'pass123', 'DOCTOR', NOW(), NOW()),
('Doctor', 'dr.basak@hospital.com', 'pass123', 'DOCTOR', NOW(), NOW());

-- Insert Doctor specific data
INSERT INTO doctor (specialization, bio, rating_avg, department_id, user_id) VALUES 
('Kardiyoloji Uzmanı', '25 yıl deneyim', 4.8, 1, (SELECT id FROM users WHERE email = 'dr.ahmet@hospital.com')),
('Nöroloji Uzmanı', '20 yıl deneyim', 4.6, 2, (SELECT id FROM users WHERE email = 'dr.fatma@hospital.com')),
('Ortopedi Uzmanı', '18 yıl deneyim', 4.7, 3, (SELECT id FROM users WHERE email = 'dr.mehmet@hospital.com')),
('Dermatoloji Uzmanı', '15 yıl deneyim', 4.5, 4, (SELECT id FROM users WHERE email = 'dr.selin@hospital.com')),
('Göz Hastalıkları Uzmanı', '22 yıl deneyim', 4.9, 5, (SELECT id FROM users WHERE email = 'dr.basak@hospital.com'));

-- Insert Patients
INSERT INTO users (user_type, email, password, role, created_at, updated_at) VALUES 
('Patient', 'hasta1@email.com', 'pass123', 'PATIENT', NOW(), NOW()),
('Patient', 'hasta2@email.com', 'pass123', 'PATIENT', NOW(), NOW()),
('Patient', 'hasta3@email.com', 'pass123', 'PATIENT', NOW(), NOW());

-- Insert Patient specific data
INSERT INTO patient (blood_type, height, weight, birth_date, user_id) VALUES 
('O+', 175.5, 82.0, '1990-05-15', (SELECT id FROM users WHERE email = 'hasta1@email.com')),
('A+', 165.0, 65.0, '1995-08-20', (SELECT id FROM users WHERE email = 'hasta2@email.com')),
('B+', 180.0, 90.0, '1988-03-10', (SELECT id FROM users WHERE email = 'hasta3@email.com'));

-- Insert Admin
INSERT INTO users (user_type, email, password, role, created_at, updated_at) VALUES 
('Admin', 'admin@hospital.com', 'pass123', 'ADMIN', NOW(), NOW());

INSERT INTO admin (user_id) VALUES ((SELECT id FROM users WHERE email = 'admin@hospital.com'));
