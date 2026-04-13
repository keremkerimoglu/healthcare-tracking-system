# Healthcare Management System - Backend

## 📋 Proje Özeti

Sağlık Takip ve Randevu Sistemi için Java 17 Spring Boot 3 based full-stack backend projesi.

## 🏗️ Proje Yapısı

```
healthcare-system/
├── src/
│   ├── main/
│   │   ├── java/com/healthcare/
│   │   │   ├── HealthcareSystemApplication.java  (Spring Boot Entry Point)
│   │   │   ├── entity/                            (Entity Sınıfları)
│   │   │   │   ├── User.java                     (Abstract - BCrypt ile şifreleme)
│   │   │   │   ├── Patient.java                  (extends User)
│   │   │   │   ├── Doctor.java                   (extends User)
│   │   │   │   ├── Admin.java                    (extends User)
│   │   │   │   ├── Department.java
│   │   │   │   ├── Appointment.java
│   │   │   │   ├── Feedback.java
│   │   │   │   ├── Prescription.java
│   │   │   │   ├── UserRole.java                 (Enum)
│   │   │   │   └── AppointmentStatus.java        (Enum)
│   │   │   ├── repository/                        (Spring Data JPA)
│   │   │   │   ├── UserRepository.java
│   │   │   │   ├── PatientRepository.java
│   │   │   │   ├── DoctorRepository.java
│   │   │   │   ├── AdminRepository.java
│   │   │   │   ├── DepartmentRepository.java
│   │   │   │   ├── AppointmentRepository.java
│   │   │   │   ├── FeedbackRepository.java
│   │   │   │   └── PrescriptionRepository.java
│   │   │   ├── service/                          (İçi boş - gelecek implementasyonlar)
│   │   │   ├── controller/                       (İçi boş - gelecek implementasyonlar)
│   │   │   └── config/
│   │   │       └── SecurityConfig.java           (BCrypt Password Encoder)
│   │   └── resources/
│   │       └── application.properties            (PostgreSQL Konfigürasyonu)
│   └── test/
├── pom.xml                                        (Maven Dependencies)
└── README.md
```

## 🗄️ Entity Sınıfları ve İlişkiler

### 1. **User (Abstract Base Class)**
- ✅ Inheritance Strategy: SINGLE_TABLE
- ✅ Alanlar: `id`, `email`, `password` (BCrypt şifreli), `role`
- ✅ Methods: `login()`, `logout()`, `resetPassword()`
- ✅ Child Classes: Patient, Doctor, Admin

### 2. **Patient** (extends User)
- ✅ Alanlar: `bloodType`, `height`, `weight`, `birthDate`
- ✅ Methods: `updateProfile()`, `viewHistory()`
- ✅ İlişkiler: 
  - 1..* Appointment (randevuları)
  - 1..* Feedback (yaptığı yorumlar)

### 3. **Doctor** (extends User)
- ✅ Alanlar: `specialization`, `bio`, `ratingAvg`
- ✅ Methods: `createPrescription()`, `createAppointment()`
- ✅ İlişkiler:
  - M..1 Department (çalışanlar)
  - 1..* Appointment (takiyimi)
  - 1..* Feedback (hakkındaki yorumlar)

### 4. **Admin** (extends User)
- ✅ Alanlar: -
- ✅ Methods: `addDoctor()`, `viewFinancialReports()`, `monitorPerformance()`
- ✅ İlişkiler:
  - M..1 Department

### 5. **Department**
- ✅ Alanlar: `name`, `description`
- ✅ İlişkiler:
  - 1..* Doctor (çalışanlar)

### 6. **Appointment**
- ✅ Alanlar: `dateTime`, `notes`, `status` (AppointmentStatus)
- ✅ Methods: `cancel()`
- ✅ İlişkiler:
  - M..1 Doctor (takiyimi)
  - M..1 Patient (hakkındaki_yorumlar)
  - 1..1 Prescription (sonucu)
  - 1..1 Feedback

### 7. **Feedback**
- ✅ Alanlar: `rating` (1-5), `comment`, `isApproved`
- ✅ Methods: `submit()`
- ✅ İlişkiler:
  - 1..1 Appointment
  - M..1 Patient (yaptığı_yorumlar)
  - M..1 Doctor (hakkındaki_yorumlar)

### 8. **Prescription**
- ✅ Alanlar: `medicineList`, `dosage`, `createdAt`
- ✅ İlişkiler:
  - 1..1 Appointment (sonucu)

## 🔐 Güvenlik

- **Password Encryption**: BCryptPasswordEncoder
- **User.java** içinde şifre set edilirken otomatik olarak BCrypt ile şifreleniyor
- Spring Security dependency eklenmiş

## 🗄️ Veritabanı Konfigürasyonu

**Database**: PostgreSQL  
**Application Properties** (`application.properties`):
```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/healthcare_db
spring.datasource.username=postgres
spring.datasource.password=postgres
spring.jpa.hibernate.ddl-auto=update
```

**Veritabanı Oluşturma Komutu**:
```sql
CREATE DATABASE healthcare_db;
```

## 📦 Dependencies

- ✅ Spring Boot 3.2.0
- ✅ Spring Data JPA
- ✅ Spring Security
- ✅ PostgreSQL Driver
- ✅ Lombok (optional)
- ✅ DevTools

## 🚀 Çalışmaya Başlamak

### 1. PostgreSQL Kurulumu
```bash
# PostgreSQL başlatın ve healthcare_db oluşturun
CREATE DATABASE healthcare_db;
```

### 2. Maven Dependencies Kurulumu
```bash
cd healthcare-system
mvn clean install
```

### 3. Uygulamayı Çalıştırma
```bash
mvn spring-boot:run
```

Uygulama `http://localhost:8080/api` adresinde çalışacak.

## 📝 Sonra Yapılacaklar

- [ ] Service Layer Implementasyonu
- [ ] REST Controller Implementasyonu
- [ ] Authentication & Authorization (JWT)
- [ ] Exception Handling
- [ ] Validation
- [ ] Unit Tests
- [ ] Integration Tests
- [ ] API Documentation (Swagger/SpringDoc)

## 📞 Ek Bilgiler

- **Inheritance Type**: SINGLE_TABLE (User, Patient, Doctor, Admin)
- **Cascade Type**: ALL + orphanRemoval (ilişkili kayıtları otomatik sil)
- **FetchType**: LAZY (performans için)
- **Audit Fields**: createdAt, updatedAt (tüm entitylerde)

---
**Hazırlayan**: GitHub Copilot  
**Tarih**: 10 Nisan 2026  
**Java Version**: 17  
**Spring Boot Version**: 3.2.0
