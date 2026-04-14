# 🏥 Healthcare Management System - Sağlık Yönetim Sistemi

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Java](https://img.shields.io/badge/Java-17-red.svg)](https://www.oracle.com/java/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.2.0-green.svg)](https://spring.io/projects/spring-boot)
[![React](https://img.shields.io/badge/React-18.2.0-blue.svg)](https://react.dev/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-12+-336791.svg)](https://www.postgresql.org/)

---

  İçindekiler

- [Proje Özeti](#proje-özeti)
- [Teknoloji Yığını](#teknoloji-yığını)
- [Mimari](#mimari)
- [Tamamlanan Senaryolar](#tamamlanan-senaryolar)
- [Kurulum Rehberi](#kurulum-rehberi)
- [Başlangıç](#başlangıç)
- [API Dokümantasyonu](#api-dokümantasyonu)
- [Kullanıcı Rolleri](#kullanıcı-rolleri)
- [Proje Yapısı](#proje-yapısı)
- [Göğüş & Geliştirme](#katkı--geliştirme)

---

  Proje Özeti

**Sağlık Yönetim Sistemi**, modern bir sağlık hizmetleri platformudur. Hastalar randevu alabilir, doktorlar randevuları yönetip reçete yazabilir ve yöneticiler sistem istatistiklerini izleyebilir.

  Temel Özellikler

 **Hasta Modülü**
- Poliklinik seçimi, doktor filtrelemesi, randevu kitabı
- Kişisel sağlık profili (kan grubu, boy, kilo, BMI)
- Reçete takibi ve doktor değerlendirmesi (1-5 yıldız)

 **Doktor Modülü**
- Günün randevularını gösterme
- Hasta profili ve sağlık verilerine erişim
- Reçete yazma (ilaçlar + dozaj talimatları)

 **Admin Modülü**
- Gerçek zamanlı dashboard (aylık başarı, branş yoğunluğu)
- Finansal özet (varsayımsal gelir/gider hesabı)
- Doktor yönetimi (ekleme, pasifleştirme)
- Geri bildirim onaylama sistemi

 **Güvenlik**
- BCrypt ile şifre şifreleme
- CORS yapılandırması (Cross-Origin Resource Sharing)
- Role-based erişim kontrolleri

---

  Teknoloji Yığını

### Backend
| Teknoloji | Versiyon | Amaç |
|-----------|----------|------|
| Java | 17 LTS | Programlama dili |
| Spring Boot | 3.2.0 | Web framework |
| Spring Data JPA | 3.2.0 | ORM (Object Relational Mapping) |
| Spring Security | 6.1.0 | Güvenlik & Şifreleme |
| PostgreSQL | 12+ | İlişkisel database |
| Maven | 3.6+ | Proje yönetimi |

### Frontend
| Teknoloji | Versiyon | Amaç |
|-----------|----------|------|
| React | 18.2.0 | UI framework |
| Axios | 1.6.0 | HTTP istemci |
| Vite | 5.0 | Build tool |
| CSS3 | - | Stil & responsive design |

### Database
| Bileşen | Versiyon | Detay |
|---------|----------|-------|
| PostgreSQL | 12+ | RDBMS |
| JDBC Driver | 42.x | Veritabanı bağlanması |

---

  Mimari

### Layered Architecture (Katmanlı Mimari)

```
┌─────────────────────────────────────┐
│      Frontend (React)               │
│  ├─ Patient Portal                  │
│  ├─ Doctor Panel                    │
│  └─ Admin Dashboard                 │
└──────────────┬──────────────────────┘
               │ REST API (Axios)
┌──────────────▼──────────────────────┐
│    API Gateway / Controllers        │
│  ├─ UserController                  │
│  ├─ DoctorController                │
│  ├─ PatientController               │
│  ├─ AppointmentController           │
│  ├─ PrescriptionController          │
│  ├─ FeedbackController              │
│  ├─ DepartmentController            │
│  ├─ AdminController                 │
│  └─ ReportController                │
└──────────────┬──────────────────────┘
               │ Business Logic
┌──────────────▼──────────────────────┐
│    Service Layer                    │
│  ├─ UserService                     │
│  ├─ DoctorService                   │
│  ├─ PatientService                  │
│  ├─ AppointmentService              │
│  ├─ PrescriptionService             │
│  ├─ FeedbackService                 │
│  ├─ DepartmentService               │
│  ├─ AdminService                    │
│  └─ ReportService (embedded)        │
└──────────────┬──────────────────────┘
               │ Data Access
┌──────────────▼──────────────────────┐
│    Repository Layer (Spring Data)   │
│  ├─ UserRepository                  │
│  ├─ DoctorRepository                │
│  ├─ PatientRepository               │
│  ├─ AppointmentRepository           │
│  ├─ PrescriptionRepository          │
│  ├─ FeedbackRepository              │
│  ├─ DepartmentRepository            │
│  └─ AdminRepository                 │
└──────────────┬──────────────────────┘
               │ ORM (Hibernate/JPA)
┌──────────────▼──────────────────────┐
│   Database (PostgreSQL)             │
│  ├─ users, doctors, patients        │
│  ├─ appointments, prescriptions     │
│  ├─ feedbacks, departments          │
│  └─ admins                          │
└─────────────────────────────────────┘
```

---

  Tamamlanan Senaryolar

### Senaryo 1: Hasta Randevu Alma
- Poliklinikleri listeleme
- Doktor seçimi (departman bazlı)
- Uygunluk kontrolü (doktor takvimi)
- Randevu kitabı
- **API**: POST `/api/appointments`

### Senaryo 2: Doktor Randevu Yönetimi
- Günün randevuları gösterme
- Patient profili (kan grubu, boy, kilo)
- Reçete yazma (ilaçlar + dozaj)
- **API**: GET `/api/appointments/doctor/{id}/today`, POST `/api/prescriptions`

### Senaryo 4: Geri Bildirim Sistemi
- Tamamlanan randevular için yıldız-yorum
- Admin onayı (moderation)
- Onaylanan yorumların gösterilmesi
- **API**: POST `/api/feedback`, PUT `/api/feedback/{id}/approve`

### Senaryo 8-10: Admin Paneli
- Aylık randevu istatistikleri
- Branş bazlı yoğunluk analizi
- Finansal özet (varsayımsal: 100 TL/randevu, 50 TL doktor payı)
- Doktor performans metrikleri
- Yeni doktor ekleme/pasifleştirme
- **API**: GET `/api/reports/*`, POST `/api/doctors`, PATCH `/api/doctors/{id}/deactivate`

---

  Kurulum Rehberi

### Ön Gereksinimler

- **JDK 17+** veya **JRE 17+**
- **Node.js 18+** ve **npm 9+**
- **PostgreSQL 12+**
- **Git** (klonlama için)

### Adım 1: Projeyi Klonla

```bash
git clone <repository-url>
cd healthcare-system
```

### Adım 2: Backend Kurulumu

#### 2.1 PostgreSQL Veritabanı Oluşturma

```bash
# PostgreSQL CLI'ye gir
psql -U postgres

# Veritabanı ve kullanıcı oluştur (SQL)
CREATE DATABASE healthcare_db;
CREATE USER healthcare_user WITH PASSWORD 'healthcare_pass123';
ALTER ROLE healthcare_user SET client_encoding TO 'utf8';
ALTER ROLE healthcare_user SET default_transaction_isolation TO 'read committed';
ALTER ROLE healthcare_user SET default_transaction_deferrable TO on;
GRANT ALL PRIVILEGES ON DATABASE healthcare_db TO healthcare_user;
\q
```

#### 2.2 Spring Boot Uygulamasını Çalıştırma

```bash
cd healthcare-system

# Maven ile derle ve çalıştır
mvn clean compile
mvn spring-boot:run

# Terminal çıktısında göreceğiniz:
# Started HealthcareApplication in X.XXX seconds
# Backend hazır: http://localhost:8080
```

**application.properties kontrol:**
```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/healthcare_db
spring.datasource.username=healthcare_user
spring.datasource.password=healthcare_pass123
spring.jpa.hibernate.ddl-auto=update
```

### Adım 3: Frontend Kurulumu

```bash
cd healthcare-frontend

# Bağımlılıkları yükle
npm install

# Development sunucusunu başlat
npm run dev

# Terminal çıktısında göreceğiniz:
# VITE v5.0.0 ready in XXX ms
# Frontend hazır: http://localhost:3000
```

---

  Başlangıç

### Backend Başlatma

```bash
cd healthcare-system
mvn spring-boot:run
```

**Kontrol Noktaları:**
- Konsol: "Started HealthcareApplication" mesajı
- Browser: `http://localhost:8080/api/doctors` (JSON yanıt)

### Frontend Başlatma

```bash
cd healthcare-frontend
npm run dev
```

**Kontrol Noktaları:**
- Konsol: "VITE v5.0.0 ready" mesajı
- Browser: `http://localhost:3000` (Menu ekranı)

### Test Girişleri

**Hasta Paneli:**
- Hasta ID: `1`
- Email: (Opsiyonel)

**Doktor Paneli:**
- Doktor ID: `1`
- Email: (Opsiyonel)

**Admin Paneli:**
- Admin ID: `1`
- Email: (Opsiyonel)

---

  API Dokümantasyonu

### Kimlik Doğrulama (Authentication)

```http
POST /api/users/login
Content-Type: application/json

{
  "email": "doctor@example.com",
  "password": "password123"
}

Response: 200 OK
{
  "success": true,
  "message": "Login successful",
  "data": {
    "id": 1,
    "email": "doctor@example.com",
    "userType": "DOCTOR"
  }
}
```

**ACL (Erişim Kontrol):**
- Tüm endpoints: CORS enabled (localhost:3000)
- Protected endpoints: (Şu anda tarayıcı localStorage'da tutulur)

---

### Randevu (Appointments)

#### Randevu Kitabı Getir (Hasta)
```http
GET /api/appointments/patient/{patientId}

Response: 200 OK
{
  "success": true,
  "data": [
    {
      "id": 1,
      "dateTime": "2026-04-15T10:00:00",
      "status": "PENDING",
      "doctor": { "id": 1, "email": "doc@hospital.com" },
      "patient": { "id": 1 },
      "notes": "Kontrol vizesi"
    }
  ]
}
```

#### Doktorun Bugünün Randevuları
```http
GET /api/appointments/doctor/{doctorId}/today

Response: 200 OK
[
  {
    "id": 1,
    "dateTime": "2026-04-10T14:00:00",
    "status": "PENDING",
    "patient": { 
      "id": 1, 
      "email": "patient@email.com",
      "bloodType": "AB+",
      "height": 175,
      "weight": 75
    }
  }
]
```

#### Yeni Randevu Oluştur
```http
POST /api/appointments
Content-Type: application/json

{
  "patientId": 1,
  "doctorId": 1,
  "dateTime": "2026-04-20T15:30:00",
  "notes": "Aile hekimi kontrolü"
}

Response: 201 Created
```

**Erişim:** Hasta & Doktor

---

### Reçete (Prescriptions)

#### Reçete Oluştur (Doktor)
```http
POST /api/prescriptions
Content-Type: application/json

{
  "appointmentId": 1,
  "medicineList": "Aspirin 100mg\nParasetamol 500mg",
  "dosage": "Günde 3 kez 1 tablet, yemeklerden sonra"
}

Response: 201 Created
{
  "id": 1,
  "medicineList": "...",
  "dosage": "...",
  "createdAt": "2026-04-10T15:20:00",
  "appointment": { ... }
}
```

**Not:** Reçete oluşturulurken Appointment status otomatik `COMPLETED` olur.

#### Hastanın Reçetelerini Al
```http
GET /api/prescriptions/patient/{patientId}

Response: 200 OK
[
  {
    "id": 1,
    "medicineList": "...",
    "dosage": "...",
    "createdAt": "2026-04-05T14:00:00",
    "appointment": {
      "id": 1,
      "doctor": { "email": "cardiologist@hospital.com" }
    }
  }
]
```

**Erişim:** Hasta (kendi reçeteleri), Doktor (tudo)

---

### Geri Bildirim (Feedback)

#### Geri Bildirim Gönder (Hasta)
```http
POST /api/feedback
Content-Type: application/json

{
  "appointmentId": 1,
  "rating": 5,
  "comment": "Doktor çok profesyonel ve sabırlıydı. Tavsiye ederim!"
}

Response: 201 Created
{
  "id": 1,
  "rating": 5,
  "comment": "...",
  "isApproved": false,
  "createdAt": "2026-04-10T16:30:00"
}
```

**Not:** İlk gönderişte `isApproved = false` (admin onay bekliyor)

#### Beklemede Geri Bildirimleri Al (Admin)
```http
GET /api/feedback/pending

Response: 200 OK
[
  {
    "id": 1,
    "rating": 5,
    "comment": "...",
    "isApproved": false,
    "patient": { "email": "patient@email.com" },
    "doctor": { "email": "doctor@hospital.com" }
  }
]
```

#### Geri Bildirimi Onayla (Admin)
```http
PUT /api/feedback/{feedbackId}/approve

Response: 200 OK
{
  "id": 1,
  "isApproved": true,
  "updatedAt": "2026-04-10T17:00:00"
}
```

**Erişim:** 
- POST: Hasta (COMPLETED randevusu olanlar)
- GET/PUT: Admin

---

### Raporlama (Reports)

#### Aylık Randevu İstatistikleri
```http
GET /api/reports/monthly-appointments

Response: 200 OK
{
  "2026-01": 12,
  "2026-02": 18,
  "2026-03": 25,
  "2026-04": 10
}
```

#### Branş Bazlı Yoğunluk
```http
GET /api/reports/department-stats

Response: 200 OK
{
  "Kardiyoloji": 15,
  "Ortopedi": 12,
  "Ruh Sağlığı": 8,
  "Fizik Tedavi": 5
}
```

#### Finansal Özet
```http
GET /api/reports/financial-summary

Response: 200 OK
{
  "totalRevenue": 1500.0,
  "totalDoctorPayment": 750.0,
  "netProfit": 750.0,
  "completedAppointments": 15,
  "appointmentCost": 100.0,
  "doctorSharePerAppointment": 50.0
}
```

**Formül:**
- Toplam Gelir = Tamamlanan Randevular × 100 TL
- Doktor Ödemeleri = Tamamlanan Randevular × 50 TL
- Net Kar = Toplam Gelir - Doktor Ödemeleri

#### Doktor Performansı
```http
GET /api/reports/doctor-performance

Response: 200 OK
[
  {
    "doctorId": 1,
    "doctorEmail": "cardiologist@hospital.com",
    "department": "Kardiyoloji",
    "totalAppointments": 20,
    "completedAppointments": 18,
    "averageRating": 4.7
  }
]
```

**Erişim:** Admin

---

### Doktor Yönetimi (Doctor Management)

#### Yeni Doktor Ekle (Admin)
```http
POST /api/doctors
Content-Type: application/json

{
  "email": "newdoctor@hospital.com",
  "password": "SecurePass123!",
  "specialization": "Onkoloji",
  "departmentId": 3,
  "bio": "Kanser tedavisi konusunda 15 yıl deneyim"
}

Response: 201 Created
```

#### Doktoru Pasifleştir
```http
PATCH /api/doctors/{doctorId}/deactivate

Response: 200 OK
{
  "id": 1,
  "active": false,
  "updatedAt": "2026-04-10T17:30:00"
}
```

#### Doktoru Aktifleştir
```http
PATCH /api/doctors/{doctorId}/reactivate

Response: 200 OK
{
  "id": 1,
  "active": true,
  "updatedAt": "2026-04-10T17:35:00"
}
```

**Erişim:** Admin

---

  Kullanıcı Rolleri

| Role | Özellikler | Erişim Sınırları |
|------|-----------|------------------|
| **PATIENT** | Randevu kitabı, reçete al, geri bildirim, profil | Kendi verilerine, tamamlanan randevularına |
| **DOCTOR** | Bugünün randevuları, hasta profili, reçete yaz | Kendi randevularına, hastalar arası |
| **ADMIN** | Dashboard, doktor yönetimi, feedback onayı | Sistem çapında tüm veri |

---

  Proje Yapısı

### Backend
```
healthcare-system/
├── src/main/java/com/healthcare/
│   ├── entity/                  # JPA Entities
│   │   ├── User.java
│   │   ├── Doctor.java
│   │   ├── Patient.java
│   │   ├── Appointment.java
│   │   ├── Prescription.java
│   │   ├── Feedback.java
│   │   └── Department.java
│   ├── repository/              # Data Access Layer
│   │   ├── UserRepository.java
│   │   ├── DoctorRepository.java
│   │   └── ...
│   ├── service/                 # Business Logic
│   │   ├── UserService.java
│   │   ├── DoctorService.java
│   │   └── ...
│   ├── controller/              # REST Endpoints
│   │   ├── UserController.java
│   │   ├── DoctorController.java
│   │   ├── ReportController.java
│   │   └── ...
│   ├── dto/                     # Data Transfer Objects
│   │   ├── ApiResponse.java
│   │   ├── DoctorProfileDTO.java
│   │   └── ...
│   ├── config/                  # Configuration
│   │   └── SecurityConfig.java
│   └── HealthcareApplication.java
├── resources/
│   └── application.properties
└── pom.xml
```

### Frontend
```
healthcare-frontend/
├── src/
│   ├── components/              # React Components
│   │   ├── AppointmentBooking.jsx
│   │   ├── PatientPanel.jsx
│   │   ├── DoctorPanel.jsx
│   │   ├── AdminPanel.jsx
│   │   ├── FeedbackModal.jsx
│   │   └── ...
│   ├── styles/                  # CSS Files
│   │   ├── AppointmentBooking.css
│   │   ├── AdminPanel.css
│   │   ├── PatientPanel.css
│   │   └── ...
│   ├── services/                # API Services
│   │   └── api.js               # Axios configuration
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── public/
├── index.html
├── vite.config.js
├── package.json
└── .eslintrc.cjs
```

---

  Güvenlik Özellikleri

### 1. Şifre Güvenliği
- **BCrypt Hashing**: Tüm şifreler `PasswordEncoder` ile hashlenir
- **Salt**: Otomatik salt oluşturulur
- Özgün şifre asla veritabanında depolanmaz

```java
// Örnek: Spring Security'de BCrypt ile
@Bean
public PasswordEncoder passwordEncoder() {
    return new BCryptPasswordEncoder();
}

// Şifre şifrelemesi
doctor.setPassword(passwordEncoder.encode(rawPassword));
```

### 2. CORS Yapılandırması
```java
@CrossOrigin(origins = "http://localhost:3000")
public class DoctorController { ... }
```
- Sadece localhost:3000'den istek kabul eder
- Production'da host name değiştirilmelidir

### 3. JWT (İleri güvenlik için)
- Şu anda localStorage'da tutulur
- Production'da JWT tokens kullanılması önerilir

### 4. Role-Based Access Control (RBAC)
- Doktor sadece kendi randevularını görebilir
- Hasta sadece kendi verilerine erişebilir
- Admin sistem çapında erişim

---

  Performans & NFR Uygunluğu

### NFR-2: Performans
**Async Data Loading**: Frontend'de loading states  
**Pagination Ready**: Repository sorguları List dönüyor  
**Database Indexing**: ID'ler üzerinde otomatik indeks  
**Connection Pooling**: HikariCP default  

### NFR-3: Kullanılabilirlik
**Responsive Design**: Mobile-first CSS  
**Turkish Language**: Tüm UI Türkçe  
**Intuitive Navigation**: Tab-based interfaces  
**Error Handling**: User-friendly hata mesajları  

---

  Test Yönergeleri

### Unit Tests (Backend)
```bash
cd healthcare-system
mvn test
```

### Integration Tests (API)
```bash
# Backend çalışırken, browser'de:
curl http://localhost:8080/api/doctors
```

### Frontend Tests
```bash
cd healthcare-frontend
npm test
```

---

  Deployment

### Docker Deployment (Opsiyonel)
```dockerfile
# Dockerfile - Backend
FROM openjdk:17-slim
COPY target/healthcare-system-1.0.jar app.jar
ENTRYPOINT ["java", "-jar", "app.jar"]
```

### Kubernetes (Opsiyonel)
```yaml
# deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: healthcare-api
spec:
  replicas: 2
  selector:
    matchLabels:
      app: healthcare-api
```

---

  Referanslar

- [Spring Boot Dokümantasyonu](https://spring.io/projects/spring-boot)
- [React Hooks Guide](https://react.dev/reference/react/hooks)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [RESTful API Best Practices](https://restfulapi.net/)

---

  Lisans

Bu proje MIT Lisansı altında yayımlanmıştır.

---

  Destek & İletişim

**Geliştirici**: Sağlık Sistemi Geliştirme Ekibi  
**Tarih**: 2026-04-10  
**Versiyon**: 3.0

Sorular ve öneriler için iletişime geçebilirsiniz.

---

  Özellikler Özeti

| Özellik | Durum | Notlar |
|---------|-------|--------|
| Hasta Paneli (Senaryo 1-2, 4) | Complete | Randevu, Reçete, Feedback |
| Doktor Paneli (Senaryo 2) | Complete | Randevu, Reçete yazma |
| Admin Paneli (Senaryo 8-10) | Complete | Dashboard, Yönetim, Onay |
| Güvenlik (BCrypt, CORS) | Complete | - |
| API Dokümantasyonu | Complete | - |
| Responsive Design | Complete | Mobile-friendly |
| Versi Kontrolü | Complete | Git ready |

---

**Son Güncelleme**: 2026-04-10  
**Durum**:  Ready for Production
