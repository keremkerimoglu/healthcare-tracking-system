-- Healthcare System Test Data
-- Passwords are BCrypt hashes of 'pass123'
-- SINGLE_TABLE inheritance: all user types stored in 'users' table
-- Run on a fresh database (no existing data). Safe to re-run: uses ON CONFLICT DO NOTHING.

-- ============================================================
-- DEPARTMENTS
-- ============================================================
INSERT INTO departments (name, description) VALUES
('Kardiyoloji',      'Kalp ve damar hastalıkları')         ON CONFLICT DO NOTHING;
INSERT INTO departments (name, description) VALUES
('Nöroloji',         'Sinir sistemi hastalıkları')          ON CONFLICT DO NOTHING;
INSERT INTO departments (name, description) VALUES
('Ortopedi',         'Kemik ve eklem hastalıkları')         ON CONFLICT DO NOTHING;
INSERT INTO departments (name, description) VALUES
('Dermatoloji',      'Cilt hastalıkları')                   ON CONFLICT DO NOTHING;
INSERT INTO departments (name, description) VALUES
('Göz Hastalıkları', 'Göz ve görme problemleri')            ON CONFLICT DO NOTHING;
INSERT INTO departments (name, description) VALUES
('Dahiliye',         'İç hastalıkları ve genel muayene')    ON CONFLICT DO NOTHING;
INSERT INTO departments (name, description) VALUES
('Çocuk Sağlığı',   'Pediatri ve çocuk hastalıkları')      ON CONFLICT DO NOTHING;
INSERT INTO departments (name, description) VALUES
('Kulak Burun Boğaz','KBB hastalıkları')                    ON CONFLICT DO NOTHING;

-- ============================================================
-- DOCTORS  (3 per department — SINGLE_TABLE: all columns in users)
-- BCrypt hash of 'pass123': $2a$10$KYs1mj4fULel9G0BnEesVeV/PqJ7HgX7UmS57UWKyAFrx6CPK8OCy
-- ============================================================

-- Kardiyoloji (dept 1)
INSERT INTO users (user_type, identity_number, email, password, role, specialization, bio, rating_avg, department_id, is_active, created_at, updated_at) VALUES
('DOCTOR','12345678901','dr.ahmet.kaya@hospital.com',    '$2a$10$KYs1mj4fULel9G0BnEesVeV/PqJ7HgX7UmS57UWKyAFrx6CPK8OCy','DOCTOR','Kardiyoloji Uzmanı',    'Kalp ritim bozuklukları ve koroner arter hastalıkları alanında 25 yıl deneyim.',4.8,(SELECT id FROM departments WHERE name='Kardiyoloji'),     true,NOW(),NOW()) ON CONFLICT (identity_number) DO NOTHING;
INSERT INTO users (user_type, identity_number, email, password, role, specialization, bio, rating_avg, department_id, is_active, created_at, updated_at) VALUES
('DOCTOR','12345678902','dr.zeynep.arslan@hospital.com', '$2a$10$KYs1mj4fULel9G0BnEesVeV/PqJ7HgX7UmS57UWKyAFrx6CPK8OCy','DOCTOR','Kardiyoloji Uzmanı',    'Ekokardiyografi ve kalp kapak hastalıkları uzmanı, 12 yıl deneyim.',          4.6,(SELECT id FROM departments WHERE name='Kardiyoloji'),     true,NOW(),NOW()) ON CONFLICT (identity_number) DO NOTHING;
INSERT INTO users (user_type, identity_number, email, password, role, specialization, bio, rating_avg, department_id, is_active, created_at, updated_at) VALUES
('DOCTOR','12345678903','dr.burak.demir@hospital.com',   '$2a$10$KYs1mj4fULel9G0BnEesVeV/PqJ7HgX7UmS57UWKyAFrx6CPK8OCy','DOCTOR','Kardiyoloji Uzmanı',    'Girişimsel kardiyoloji ve anjiyoplasti uzmanı, 8 yıl deneyim.',               4.5,(SELECT id FROM departments WHERE name='Kardiyoloji'),     true,NOW(),NOW()) ON CONFLICT (identity_number) DO NOTHING;

-- Nöroloji (dept 2)
INSERT INTO users (user_type, identity_number, email, password, role, specialization, bio, rating_avg, department_id, is_active, created_at, updated_at) VALUES
('DOCTOR','12345678904','dr.fatma.celik@hospital.com',   '$2a$10$KYs1mj4fULel9G0BnEesVeV/PqJ7HgX7UmS57UWKyAFrx6CPK8OCy','DOCTOR','Nöroloji Uzmanı',       'Epilepsi ve nörodejeneratif hastalıklar konusunda 20 yıl deneyim.',           4.7,(SELECT id FROM departments WHERE name='Nöroloji'),        true,NOW(),NOW()) ON CONFLICT (identity_number) DO NOTHING;
INSERT INTO users (user_type, identity_number, email, password, role, specialization, bio, rating_avg, department_id, is_active, created_at, updated_at) VALUES
('DOCTOR','12345678905','dr.emre.yildiz@hospital.com',   '$2a$10$KYs1mj4fULel9G0BnEesVeV/PqJ7HgX7UmS57UWKyAFrx6CPK8OCy','DOCTOR','Nöroloji Uzmanı',       'Baş ağrısı, migren ve inme rehabilitasyonu, 10 yıl deneyim.',                 4.4,(SELECT id FROM departments WHERE name='Nöroloji'),        true,NOW(),NOW()) ON CONFLICT (identity_number) DO NOTHING;
INSERT INTO users (user_type, identity_number, email, password, role, specialization, bio, rating_avg, department_id, is_active, created_at, updated_at) VALUES
('DOCTOR','12345678906','dr.ayse.sahin@hospital.com',    '$2a$10$KYs1mj4fULel9G0BnEesVeV/PqJ7HgX7UmS57UWKyAFrx6CPK8OCy','DOCTOR','Nöroloji Uzmanı',       'Hareket bozuklukları ve Parkinson tedavisi, 7 yıl deneyim.',                  4.3,(SELECT id FROM departments WHERE name='Nöroloji'),        true,NOW(),NOW()) ON CONFLICT (identity_number) DO NOTHING;

-- Ortopedi (dept 3)
INSERT INTO users (user_type, identity_number, email, password, role, specialization, bio, rating_avg, department_id, is_active, created_at, updated_at) VALUES
('DOCTOR','12345678907','dr.mehmet.ozturk@hospital.com', '$2a$10$KYs1mj4fULel9G0BnEesVeV/PqJ7HgX7UmS57UWKyAFrx6CPK8OCy','DOCTOR','Ortopedi Uzmanı',       'Eklem replasmanı ve spor yaralanmaları, 18 yıl deneyim.',                     4.8,(SELECT id FROM departments WHERE name='Ortopedi'),        true,NOW(),NOW()) ON CONFLICT (identity_number) DO NOTHING;
INSERT INTO users (user_type, identity_number, email, password, role, specialization, bio, rating_avg, department_id, is_active, created_at, updated_at) VALUES
('DOCTOR','12345678908','dr.mustafa.gunes@hospital.com', '$2a$10$KYs1mj4fULel9G0BnEesVeV/PqJ7HgX7UmS57UWKyAFrx6CPK8OCy','DOCTOR','Ortopedi Uzmanı',       'Omurga cerrahisi ve disk hernisi tedavisi, 14 yıl deneyim.',                  4.6,(SELECT id FROM departments WHERE name='Ortopedi'),        true,NOW(),NOW()) ON CONFLICT (identity_number) DO NOTHING;
INSERT INTO users (user_type, identity_number, email, password, role, specialization, bio, rating_avg, department_id, is_active, created_at, updated_at) VALUES
('DOCTOR','12345678909','dr.elif.koc@hospital.com',      '$2a$10$KYs1mj4fULel9G0BnEesVeV/PqJ7HgX7UmS57UWKyAFrx6CPK8OCy','DOCTOR','Ortopedi Uzmanı',       'Pediatrik ortopedi ve skolyoz tedavisi, 6 yıl deneyim.',                      4.2,(SELECT id FROM departments WHERE name='Ortopedi'),        true,NOW(),NOW()) ON CONFLICT (identity_number) DO NOTHING;

-- Dermatoloji (dept 4)
INSERT INTO users (user_type, identity_number, email, password, role, specialization, bio, rating_avg, department_id, is_active, created_at, updated_at) VALUES
('DOCTOR','12345678910','dr.selin.aydin@hospital.com',   '$2a$10$KYs1mj4fULel9G0BnEesVeV/PqJ7HgX7UmS57UWKyAFrx6CPK8OCy','DOCTOR','Dermatoloji Uzmanı',    'Psoriazis, egzama ve deri kanseri tanısı, 15 yıl deneyim.',                   4.7,(SELECT id FROM departments WHERE name='Dermatoloji'),     true,NOW(),NOW()) ON CONFLICT (identity_number) DO NOTHING;
INSERT INTO users (user_type, identity_number, email, password, role, specialization, bio, rating_avg, department_id, is_active, created_at, updated_at) VALUES
('DOCTOR','12345678911','dr.hasan.dogan@hospital.com',   '$2a$10$KYs1mj4fULel9G0BnEesVeV/PqJ7HgX7UmS57UWKyAFrx6CPK8OCy','DOCTOR','Dermatoloji Uzmanı',    'Kozmetik dermatoloji ve lazer tedavileri, 11 yıl deneyim.',                   4.5,(SELECT id FROM departments WHERE name='Dermatoloji'),     true,NOW(),NOW()) ON CONFLICT (identity_number) DO NOTHING;
INSERT INTO users (user_type, identity_number, email, password, role, specialization, bio, rating_avg, department_id, is_active, created_at, updated_at) VALUES
('DOCTOR','12345678912','dr.merve.erdogan@hospital.com', '$2a$10$KYs1mj4fULel9G0BnEesVeV/PqJ7HgX7UmS57UWKyAFrx6CPK8OCy','DOCTOR','Dermatoloji Uzmanı',    'Saç ve tırnak hastalıkları, alerjik deri reaksiyonları, 5 yıl deneyim.',      4.1,(SELECT id FROM departments WHERE name='Dermatoloji'),     true,NOW(),NOW()) ON CONFLICT (identity_number) DO NOTHING;

-- Göz Hastalıkları (dept 5)
INSERT INTO users (user_type, identity_number, email, password, role, specialization, bio, rating_avg, department_id, is_active, created_at, updated_at) VALUES
('DOCTOR','12345678913','dr.basak.yilmaz@hospital.com',  '$2a$10$KYs1mj4fULel9G0BnEesVeV/PqJ7HgX7UmS57UWKyAFrx6CPK8OCy','DOCTOR','Göz Hastalıkları Uzmanı','Retina ve vitreus hastalıkları, lazer tedavisi, 22 yıl deneyim.',             4.9,(SELECT id FROM departments WHERE name='Göz Hastalıkları'),true,NOW(),NOW()) ON CONFLICT (identity_number) DO NOTHING;
INSERT INTO users (user_type, identity_number, email, password, role, specialization, bio, rating_avg, department_id, is_active, created_at, updated_at) VALUES
('DOCTOR','12345678914','dr.ali.turk@hospital.com',      '$2a$10$KYs1mj4fULel9G0BnEesVeV/PqJ7HgX7UmS57UWKyAFrx6CPK8OCy','DOCTOR','Göz Hastalıkları Uzmanı','Katarakt ve glokom cerrahisi, 9 yıl deneyim.',                                4.6,(SELECT id FROM departments WHERE name='Göz Hastalıkları'),true,NOW(),NOW()) ON CONFLICT (identity_number) DO NOTHING;
INSERT INTO users (user_type, identity_number, email, password, role, specialization, bio, rating_avg, department_id, is_active, created_at, updated_at) VALUES
('DOCTOR','12345678915','dr.nazli.cetin@hospital.com',   '$2a$10$KYs1mj4fULel9G0BnEesVeV/PqJ7HgX7UmS57UWKyAFrx6CPK8OCy','DOCTOR','Göz Hastalıkları Uzmanı','Pediatrik oftalmoloji ve şaşılık tedavisi, 4 yıl deneyim.',                  4.2,(SELECT id FROM departments WHERE name='Göz Hastalıkları'),true,NOW(),NOW()) ON CONFLICT (identity_number) DO NOTHING;

-- Dahiliye (dept 6)
INSERT INTO users (user_type, identity_number, email, password, role, specialization, bio, rating_avg, department_id, is_active, created_at, updated_at) VALUES
('DOCTOR','12345678916','dr.ibrahim.kurt@hospital.com',  '$2a$10$KYs1mj4fULel9G0BnEesVeV/PqJ7HgX7UmS57UWKyAFrx6CPK8OCy','DOCTOR','Dahiliye Uzmanı',       'Diyabet, hipertansiyon ve metabolik hastalıklar, 16 yıl deneyim.',            4.5,(SELECT id FROM departments WHERE name='Dahiliye'),        true,NOW(),NOW()) ON CONFLICT (identity_number) DO NOTHING;
INSERT INTO users (user_type, identity_number, email, password, role, specialization, bio, rating_avg, department_id, is_active, created_at, updated_at) VALUES
('DOCTOR','12345678917','dr.gulsen.oz@hospital.com',     '$2a$10$KYs1mj4fULel9G0BnEesVeV/PqJ7HgX7UmS57UWKyAFrx6CPK8OCy','DOCTOR','Dahiliye Uzmanı',       'Tiroid ve endokrin sistem hastalıkları, 13 yıl deneyim.',                     4.6,(SELECT id FROM departments WHERE name='Dahiliye'),        true,NOW(),NOW()) ON CONFLICT (identity_number) DO NOTHING;
INSERT INTO users (user_type, identity_number, email, password, role, specialization, bio, rating_avg, department_id, is_active, created_at, updated_at) VALUES
('DOCTOR','12345678918','dr.cengiz.bal@hospital.com',    '$2a$10$KYs1mj4fULel9G0BnEesVeV/PqJ7HgX7UmS57UWKyAFrx6CPK8OCy','DOCTOR','Dahiliye Uzmanı',       'Geriatri ve kronik hastalık yönetimi, 7 yıl deneyim.',                        4.3,(SELECT id FROM departments WHERE name='Dahiliye'),        true,NOW(),NOW()) ON CONFLICT (identity_number) DO NOTHING;

-- Çocuk Sağlığı (dept 7)
INSERT INTO users (user_type, identity_number, email, password, role, specialization, bio, rating_avg, department_id, is_active, created_at, updated_at) VALUES
('DOCTOR','12345678919','dr.nurcan.yuce@hospital.com',   '$2a$10$KYs1mj4fULel9G0BnEesVeV/PqJ7HgX7UmS57UWKyAFrx6CPK8OCy','DOCTOR','Pediatri Uzmanı',       'Yenidoğan ve bebek sağlığı, aşılama programları, 17 yıl deneyim.',            4.9,(SELECT id FROM departments WHERE name='Çocuk Sağlığı'),  true,NOW(),NOW()) ON CONFLICT (identity_number) DO NOTHING;
INSERT INTO users (user_type, identity_number, email, password, role, specialization, bio, rating_avg, department_id, is_active, created_at, updated_at) VALUES
('DOCTOR','12345678920','dr.tarkan.sen@hospital.com',    '$2a$10$KYs1mj4fULel9G0BnEesVeV/PqJ7HgX7UmS57UWKyAFrx6CPK8OCy','DOCTOR','Pediatri Uzmanı',       'Çocuk enfeksiyon hastalıkları ve allerji, 11 yıl deneyim.',                   4.7,(SELECT id FROM departments WHERE name='Çocuk Sağlığı'),  true,NOW(),NOW()) ON CONFLICT (identity_number) DO NOTHING;
INSERT INTO users (user_type, identity_number, email, password, role, specialization, bio, rating_avg, department_id, is_active, created_at, updated_at) VALUES
('DOCTOR','12345678921','dr.pinar.ak@hospital.com',      '$2a$10$KYs1mj4fULel9G0BnEesVeV/PqJ7HgX7UmS57UWKyAFrx6CPK8OCy','DOCTOR','Pediatri Uzmanı',       'Çocuk gelişim bozuklukları ve beslenme, 5 yıl deneyim.',                      4.4,(SELECT id FROM departments WHERE name='Çocuk Sağlığı'),  true,NOW(),NOW()) ON CONFLICT (identity_number) DO NOTHING;

-- Kulak Burun Boğaz (dept 8)
INSERT INTO users (user_type, identity_number, email, password, role, specialization, bio, rating_avg, department_id, is_active, created_at, updated_at) VALUES
('DOCTOR','12345678922','dr.serkan.ince@hospital.com',   '$2a$10$KYs1mj4fULel9G0BnEesVeV/PqJ7HgX7UmS57UWKyAFrx6CPK8OCy','DOCTOR','KBB Uzmanı',           'İşitme kaybı, bademcik ve sinüs cerrahisi, 19 yıl deneyim.',                  4.7,(SELECT id FROM departments WHERE name='Kulak Burun Boğaz'),true,NOW(),NOW()) ON CONFLICT (identity_number) DO NOTHING;
INSERT INTO users (user_type, identity_number, email, password, role, specialization, bio, rating_avg, department_id, is_active, created_at, updated_at) VALUES
('DOCTOR','12345678923','dr.dilek.can@hospital.com',     '$2a$10$KYs1mj4fULel9G0BnEesVeV/PqJ7HgX7UmS57UWKyAFrx6CPK8OCy','DOCTOR','KBB Uzmanı',           'Rinoplasti ve septum deviasyonu ameliyatları, 12 yıl deneyim.',               4.5,(SELECT id FROM departments WHERE name='Kulak Burun Boğaz'),true,NOW(),NOW()) ON CONFLICT (identity_number) DO NOTHING;
INSERT INTO users (user_type, identity_number, email, password, role, specialization, bio, rating_avg, department_id, is_active, created_at, updated_at) VALUES
('DOCTOR','12345678924','dr.volkan.polat@hospital.com',  '$2a$10$KYs1mj4fULel9G0BnEesVeV/PqJ7HgX7UmS57UWKyAFrx6CPK8OCy','DOCTOR','KBB Uzmanı',           'Ses kısıklığı, uyku apnesi ve baş dönmesi tedavisi, 6 yıl deneyim.',          4.2,(SELECT id FROM departments WHERE name='Kulak Burun Boğaz'),true,NOW(),NOW()) ON CONFLICT (identity_number) DO NOTHING;

-- ============================================================
-- PATIENTS
-- ============================================================
INSERT INTO users (user_type, identity_number, email, phone_number, password, role, blood_type, height, weight, birth_date, is_active, created_at, updated_at) VALUES
('PATIENT','98765432101','ali.veli@email.com',   '05321234567','$2a$10$KYs1mj4fULel9G0BnEesVeV/PqJ7HgX7UmS57UWKyAFrx6CPK8OCy','PATIENT','O+', 175.5, 82.0, '1990-05-15', true, NOW(), NOW()) ON CONFLICT (identity_number) DO NOTHING;
INSERT INTO users (user_type, identity_number, email, phone_number, password, role, blood_type, height, weight, birth_date, is_active, created_at, updated_at) VALUES
('PATIENT','98765432102','ayse.kaya@email.com',  '05359876543','$2a$10$KYs1mj4fULel9G0BnEesVeV/PqJ7HgX7UmS57UWKyAFrx6CPK8OCy','PATIENT','A+', 165.0, 65.0, '1995-08-20', true, NOW(), NOW()) ON CONFLICT (identity_number) DO NOTHING;
INSERT INTO users (user_type, identity_number, email, phone_number, password, role, blood_type, height, weight, birth_date, is_active, created_at, updated_at) VALUES
('PATIENT','98765432103','mehmet.oz@email.com',  '05425554433','$2a$10$KYs1mj4fULel9G0BnEesVeV/PqJ7HgX7UmS57UWKyAFrx6CPK8OCy','PATIENT','B+', 180.0, 90.0, '1988-03-10', true, NOW(), NOW()) ON CONFLICT (identity_number) DO NOTHING;
INSERT INTO users (user_type, identity_number, email, phone_number, password, role, blood_type, height, weight, birth_date, is_active, created_at, updated_at) VALUES
('PATIENT','98765432104','zeynep.er@email.com',  '05301112233','$2a$10$KYs1mj4fULel9G0BnEesVeV/PqJ7HgX7UmS57UWKyAFrx6CPK8OCy','PATIENT','AB+',160.0, 55.0, '2000-11-25', true, NOW(), NOW()) ON CONFLICT (identity_number) DO NOTHING;
INSERT INTO users (user_type, identity_number, email, phone_number, password, role, blood_type, height, weight, birth_date, is_active, created_at, updated_at) VALUES
('PATIENT','98765432105','burak.tas@email.com',  '05443332211','$2a$10$KYs1mj4fULel9G0BnEesVeV/PqJ7HgX7UmS57UWKyAFrx6CPK8OCy','PATIENT','0-', 172.0, 78.5, '1983-07-04', true, NOW(), NOW()) ON CONFLICT (identity_number) DO NOTHING;

-- ============================================================
-- ADMIN
-- ============================================================
INSERT INTO users (user_type, identity_number, email, password, role, is_active, created_at, updated_at) VALUES
('ADMIN','11111111111','admin@hospital.com','$2a$10$KYs1mj4fULel9G0BnEesVeV/PqJ7HgX7UmS57UWKyAFrx6CPK8OCy','ADMIN',true,NOW(),NOW()) ON CONFLICT (identity_number) DO NOTHING;
