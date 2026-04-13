# 📘 API Dokümantasyonu - Healthcare Management System

**Versiyon**: 3.0  
**Son Güncelleme**: 2026-04-10  
**Base URL**: `http://localhost:8080/api`

---

## 📑 İçindekiler

1. [Kimlik Doğrulama](#1-kimlik-doğrulama)
2. [Randevu Yönetimi](#2-randevu-yönetimi)
3. [Reçete Yönetimi](#3-reçete-yönetimi)
4. [Geri Bildirim Sistemi](#4-geri-bildirim-sistemi)
5. [Raporlama Sistemi](#5-raporlama-sistemi)
6. [Doktor Yönetimi](#6-doktor-yönetimi)
7. [Departman Yönetimi](#7-departman-yönetimi)
8. [Hasta Yönetimi](#8-hasta-yönetimi)
9. [Hata Kodları](#9-hata-kodları)

---

## 1. Kimlik Doğrulama

### **POST** `/users/login`
Kullanıcı giriş ve kimlik doğrulama

**İstek:**
```json
{
  "email": "cardiologist@hospital.com",
  "password": "password123"
}
```

**Başarılı Yanıt (200 OK):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "id": 1,
    "email": "cardiologist@hospital.com",
    "userType": "DOCTOR"
  }
}
```

**Başarısız Yanıt (401 Unauthorized):**
```json
{
  "success": false,
  "message": "Invalid credentials"
}
```

**Erişim**: Tüm roller (Public)

---

### **POST** `/users/register`
Yeni kullanıcı kaydı

**İstek:**
```json
{
  "email": "newpatient@email.com",
  "password": "SecurePass123!",
  "userType": "PATIENT"
}
```

**Başarılı Yanıt (201 Created):**
```json
{
  "success": true,
  "data": { "id": 5, "email": "newpatient@email.com" }
}
```

**Erişim**: Tüm roller (Public)

---

## 2. Randevu Yönetimi

### **GET** `/appointments/patient/{patientId}`
Hastanın tüm randevularını listele

**Yanıt (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "dateTime": "2026-04-15T10:00:00",
      "status": "PENDING",
      "notes": "Kontrol vizesi",
      "doctor": {
        "id": 1,
        "email": "cardiologist@hospital.com",
        "specialization": "Kardiyoloji"
      },
      "patient": { "id": 1 }
    },
    {
      "id": 2,
      "dateTime": "2026-04-05T14:30:00",
      "status": "COMPLETED",
      "notes": "İlk muayene",
      "doctor": { "id": 2, "email": "orthopedist@hospital.com" },
      "patient": { "id": 1 }
    }
  ]
}
```

**Erişim**: 
- ✅ PATIENT (kendi randevuları)
- ✅ DOCTOR (tüm randevular)
- ✅ ADMIN (tüm randevular)

---

### **GET** `/appointments/doctor/{doctorId}/today`
Doktorun bugünün randevularını listele

**Yanıt (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": 5,
      "dateTime": "2026-04-10T09:00:00",
      "status": "PENDING",
      "notes": "Rutin kontrol",
      "patient": {
        "id": 3,
        "email": "patient3@email.com",
        "bloodType": "O+",
        "height": 180,
        "weight": 80
      }
    },
    {
      "id": 6,
      "dateTime": "2026-04-10T14:00:00",
      "status": "PENDING",
      "notes": "Acil durum",
      "patient": {
        "id": 4,
        "email": "patient4@email.com",
        "bloodType": "AB-",
        "height": 165,
        "weight": 60
      }
    }
  ]
}
```

**Erişim**: 
- ✅ DOCTOR (kendi randevuları)
- ✅ ADMIN (tüm doktorların randevuları)

---

### **GET** `/appointments/doctor/{doctorId}/date`
Doktorun belirli tarihte randevularını listele

**Query Parametresi**: `date=2026-04-15`

**Erişim**: ✅ DOCTOR, ADMIN

---

### **POST** `/appointments`
Yeni randevu oluştur

**İstek:**
```json
{
  "patientId": 1,
  "doctorId": 2,
  "dateTime": "2026-04-20T15:30:00",
  "notes": "EKG çekimi gerekli"
}
```

**Başarılı Yanıt (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": 7,
    "dateTime": "2026-04-20T15:30:00",
    "status": "PENDING"
  }
}
```

**Erişim**: 
- ✅ PATIENT (kendi adına)
- ✅ ADMIN (herkes adına)

---

### **PUT** `/appointments/{appointmentId}`
Randevu güncelle (Status değiştir)

**İstek:**
```json
{
  "status": "COMPLETED"
}
```

**Yanıt (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "status": "COMPLETED",
    "updatedAt": "2026-04-10T16:20:00"
  }
}
```

**Durum Değerleri**: `PENDING`, `CONFIRMED`, `COMPLETED`, `CANCELLED`

**Erişim**: ✅ DOCTOR, ADMIN

---

### **DELETE** `/appointments/{appointmentId}`
Randevu iptal et

**Erişim**: ✅ PATIENT (kendi), DOCTOR (tüm), ADMIN (tüm)

---

## 3. Reçete Yönetimi

### **POST** `/prescriptions`
Yeni reçete yaz

**İstek:**
```json
{
  "appointmentId": 1,
  "medicineList": "Aspirin 100mg\nMetformin 500mg\nLisinopril 10mg",
  "dosage": "Günde 3 kez (sabah, öğle, akşam) yemeklerden sonra"
}
```

**Başarılı Yanıt (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "medicineList": "Aspirin 100mg\nMetformin 500mg\nLisinopril 10mg",
    "dosage": "Günde 3 kez (sabah, öğle, akşam) yemeklerden sonra",
    "createdAt": "2026-04-10T15:20:00",
    "appointment": {
      "id": 1,
      "status": "COMPLETED"  // ← Status otomatik güncellenir
    }
  }
}
```

**Not**: Reçete oluşturulurken Appointment status otomatik `COMPLETED` olur.

**Erişim**: 
- ✅ DOCTOR (kendi randevuları)
- ✅ ADMIN

---

### **GET** `/prescriptions/patient/{patientId}`
Hastanın tüm reçetelerini listele

**Yanıt (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "medicineList": "Aspirin 100mg\nMetformin 500mg",
      "dosage": "Günde 3 kez yemeklerden sonra",
      "createdAt": "2026-04-05T14:00:00",
      "appointment": {
        "id": 1,
        "dateTime": "2026-04-05T10:00:00",
        "doctor": {
          "id": 1,
          "email": "cardiologist@hospital.com"
        }
      }
    }
  ]
}
```

**Erişim**: 
- ✅ PATIENT (kendi)
- ✅ DOCTOR (tüm)
- ✅ ADMIN

---

### **GET** `/prescriptions/{prescriptionId}`
Tek reçetenin detaylarını al

**Erişim**: ✅ PATIENT (kendi), DOCTOR, ADMIN

---

### **DELETE** `/prescriptions/{prescriptionId}`
Reçete sil

**Erişim**: ✅ DOCTOR (kendi), ADMIN

---

## 4. Geri Bildirim Sistemi

### **POST** `/feedback`
Geri bildirim gönder (Hasta → Doktor)

**İstek:**
```json
{
  "appointmentId": 1,
  "rating": 5,
  "comment": "Doktor çok profesyonel ve sabırlıydı. Tüm sorularıma cevap verdi. Kesinlikle tekrar gitme niyetindeyim!"
}
```

**Başarılı Yanıt (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "rating": 5,
    "comment": "Doktor çok profesyonel...",
    "isApproved": false,
    "createdAt": "2026-04-10T16:30:00",
    "appointment": {
      "id": 1,
      "status": "COMPLETED"
    }
  }
}
```

**Doğrulama Kuralları:**
- ⚠️ Rating: 1-5 arası (zorunlu)
- ⚠️ Comment: Boş olamaz, max 500 karakter
- ⚠️ Appointment status: COMPLETED olmalı

**Erişim**: 
- ✅ PATIENT (tamamlanan randevularından)
- ✅ ADMIN

---

### **GET** `/feedback/pending`
Onay beklemede geri bildirimleri listele (Admin Paneli)

**Yanıt (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "rating": 5,
      "comment": "Mükemmel hasta bakım",
      "isApproved": false,
      "createdAt": "2026-04-10T16:30:00",
      "patient": {
        "id": 1,
        "email": "patient1@email.com"
      },
      "doctor": {
        "id": 1,
        "email": "cardiologist@hospital.com"
      }
    },
    {
      "id": 2,
      "rating": 3,
      "comment": "Orta derecede iyi",
      "isApproved": false,
      "createdAt": "2026-04-09T14:00:00",
      "patient": {
        "id": 2,
        "email": "patient2@email.com"
      },
      "doctor": {
        "id": 2,
        "email": "orthopedist@hospital.com"
      }
    }
  ]
}
```

**Erişim**: ✅ ADMIN

---

### **GET** `/feedback/approved`
Onaylanan geri bildirimleri listele (Public View)

**Yanıt (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "rating": 5,
      "comment": "Mükemmel hasta bakım",
      "isApproved": true,
      "approvedAt": "2026-04-10T17:00:00",
      "doctor": {
        "id": 1,
        "email": "cardiologist@hospital.com",
        "specialization": "Kardiyoloji"
      }
    }
  ]
}
```

**Erişim**: 
- ✅ ADMIN (tümü görebilir)
- ✅ PUBLIC (sadece onaylananları görebilir)

---

### **PUT** `/feedback/{feedbackId}/approve`
Geri bildirimi onayla (Admin)

**Yanıt (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "isApproved": true,
    "approvedAt": "2026-04-10T17:00:00"
  }
}
```

**Erişim**: ✅ ADMIN

---

### **DELETE** `/feedback/{feedbackId}`
Geri bildirimi reddet/sil (Admin)

**Yanıt (200 OK):**
```json
{
  "success": true,
  "message": "Feedback rejected successfully"
}
```

**Erişim**: ✅ ADMIN

---

## 5. Raporlama Sistemi

### **GET** `/reports/monthly-appointments`
Aylık randevu istatistikleri

**Yanıt (200 OK):**
```json
{
  "success": true,
  "data": {
    "2026-01": 12,
    "2026-02": 18,
    "2026-03": 25,
    "2026-04": 10
  }
}
```

**Kullanım**: Admin Dashboard (Bar Chart)

**Erişim**: ✅ ADMIN

---

### **GET** `/reports/department-stats`
Branş bazlı yoğunluk analizi

**Yanıt (200 OK):**
```json
{
  "success": true,
  "data": {
    "Kardiyoloji": 15,
    "Ortopedi": 12,
    "Ruh Sağlığı": 8,
    "Fizik Tedavi": 5,
    "Nöroloji": 7
  }
}
```

**Kullanım**: Admin Dashboard (Branş Yoğunluğu Chart)

**Erişim**: ✅ ADMIN

---

### **GET** `/reports/financial-summary`
Finansal özet (Varsayımsal hesaplama)

**Yanıt (200 OK):**
```json
{
  "success": true,
  "data": {
    "totalRevenue": 1500.0,
    "totalDoctorPayment": 750.0,
    "netProfit": 750.0,
    "completedAppointments": 15,
    "appointmentCost": 100.0,
    "doctorSharePerAppointment": 50.0
  }
}
```

**Formül:**
- `Toplam Gelir = Tamamlanan Randevular × 100 TL`
- `Doktor Ödemeleri = Tamamlanan Randevular × 50 TL`
- `Net Kar = Toplam Gelir - Doktor Ödemeleri`

**Not**: Sayılar varsayımsal olup, gerçek fiyatlandırma konfigürasyonu gerekebilir.

**Erişim**: ✅ ADMIN

---

### **GET** `/reports/doctor-performance`
Doktor performans metrikleri

**Yanıt (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "doctorId": 1,
      "doctorEmail": "cardiologist@hospital.com",
      "department": "Kardiyoloji",
      "totalAppointments": 20,
      "completedAppointments": 18,
      "averageRating": 4.7,
      "feedbackCount": 15
    },
    {
      "doctorId": 2,
      "doctorEmail": "orthopedist@hospital.com",
      "department": "Ortopedi",
      "totalAppointments": 15,
      "completedAppointments": 14,
      "averageRating": 4.3,
      "feedbackCount": 12
    }
  ]
}
```

**Kullanım**: Admin Dashboard (Doktor Performans Tablosu)

**Erişim**: ✅ ADMIN

---

## 6. Doktor Yönetimi

### **GET** `/doctors`
Tüm doktorları listele

**Query Parametreleri**: `?departmentId=1&active=true`

**Yanıt (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "email": "cardiologist@hospital.com",
      "specialization": "Kardiyoloji",
      "bio": "20 yıl deneyim, ABC hastanesi müdürü",
      "active": true,
      "department": {
        "id": 1,
        "name": "Kardiyoloji"
      }
    }
  ]
}
```

**Erişim**: 
- ✅ PATIENT (aktif doktorlar)
- ✅ DOCTOR
- ✅ ADMIN

---

### **GET** `/doctors/{doctorId}`
Doktor detaylarını al

**Yanıt (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "email": "cardiologist@hospital.com",
    "specialization": "Kardiyoloji",
    "bio": "20 yıl deneyim, ABC hastanesi müdürü",
    "active": true,
    "department": {
      "id": 1,
      "name": "Kardiyoloji"
    },
    "appointmentCount": 20,
    "averageRating": 4.7
  }
}
```

**Erişim**: 
- ✅ PATIENT
- ✅ DOCTOR (kendi)
- ✅ ADMIN

---

### **POST** `/doctors`
Yeni doktor ekle (Admin)

**İstek:**
```json
{
  "email": "newdoctor@hospital.com",
  "password": "SecurePass123!",
  "specialization": "Onkoloji",
  "departmentId": 3,
  "bio": "15 yıl deneyim, kanser araştırmaları"
}
```

**Başarılı Yanıt (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": 10,
    "email": "newdoctor@hospital.com",
    "specialization": "Onkoloji",
    "active": true
  }
}
```

**Erişim**: ✅ ADMIN

---

### **PATCH** `/doctors/{doctorId}/deactivate`
Doktoru pasifleştir (Admin)

**Yanıt (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "email": "oldcardio@hospital.com",
    "active": false,
    "deactivatedAt": "2026-04-10T17:30:00"
  }
}
```

**Etki**: 
- Doktor yeni randevu alamaz
- Mevcut randevuları görünür kalmaya devam eder
- Geçmiş reçeteler erişilebilir

**Erişim**: ✅ ADMIN

---

### **PATCH** `/doctors/{doctorId}/reactivate`
Doktoru yeniden aktifleştir (Admin)

**Yanıt (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "email": "oldcardio@hospital.com",
    "active": true,
    "reactivatedAt": "2026-04-10T17:35:00"
  }
}
```

**Erişim**: ✅ ADMIN

---

### **PUT** `/doctors/{doctorId}`
Doktor profili güncelle

**İstek:**
```json
{
  "bio": "25 yıl deneyim, uluslararası sertifikasyon",
  "specialization": "Kardiovaskler Cerrahı"
}
```

**Erişim**: 
- ✅ DOCTOR (kendi)
- ✅ ADMIN

---

## 7. Departman Yönetimi

### **GET** `/departments`
Tüm departmanları listele

**Yanıt (200 OK):**
```json
{
  "success": true,
  "data": [
    { "id": 1, "name": "Kardiyoloji" },
    { "id": 2, "name": "Ortopedi" },
    { "id": 3, "name": "Ruh Sağlığı" },
    { "id": 4, "name": "Fizik Tedavi" },
    { "id": 5, "name": "Nöroloji" }
  ]
}
```

**Erişim**: Tüm roller

---

### **POST** `/departments`
Yeni departman ekle (Admin)

**İstek:**
```json
{
  "name": "Onkoloji"
}
```

**Erişim**: ✅ ADMIN

---

## 8. Hasta Yönetimi

### **GET** `/patients/{patientId}`
Hasta profili al

**Yanıt (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "email": "patient1@email.com",
    "bloodType": "O+",
    "height": 175,
    "weight": 75,
    "bmi": 24.5
  }
}
```

**Erişim**: 
- ✅ PATIENT (kendi)
- ✅ DOCTOR (randevusu olanlar)
- ✅ ADMIN

---

### **PUT** `/patients/{patientId}`
Hasta profili güncelle

**İstek:**
```json
{
  "bloodType": "AB+",
  "height": 176,
  "weight": 76
}
```

**Yanıt (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "bloodType": "AB+",
    "height": 176,
    "weight": 76,
    "bmi": 24.5,
    "updatedAt": "2026-04-10T18:00:00"
  }
}
```

**Erişim**: 
- ✅ PATIENT (kendi)
- ✅ ADMIN

---

## 9. Hata Kodları

| HTTP Kodu | Durum | Açıklama |
|-----------|-------|----------|
| **200** | OK | Başarılı GET/PUT isteği |
| **201** | Created | Başarılı kaynak oluşturma |
| **400** | Bad Request | Geçersiz istek parametreleri |
| **401** | Unauthorized | Kimlik doğrulama hatasında |
| **403** | Forbidden | Yetki yetersizliği |
| **404** | Not Found | Kaynak bulunamadı |
| **409** | Conflict | Veri çakışması (örn: duplicate email) |
| **500** | Server Error | Sunucu hatası |

---

## 🔐 Rol Tabanlı Erişim Özeti

| Endpoint | PATIENT | DOCTOR | ADMIN |
|----------|---------|--------|-------|
| POST /users/login | ✅ | ✅ | ✅ |
| GET /appointments/patient/{id} | ✅* | ✅ | ✅ |
| GET /appointments/doctor/{id}/today | ❌ | ✅* | ✅ |
| POST /appointments | ✅* | ❌ | ✅ |
| POST /prescriptions | ❌ | ✅ | ✅ |
| GET /prescriptions/patient/{id} | ✅* | ✅ | ✅ |
| POST /feedback | ✅ | ❌ | ✅ |
| GET /feedback/pending | ❌ | ❌ | ✅ |
| PUT /feedback/{id}/approve | ❌ | ❌ | ✅ |
| GET /reports/* | ❌ | ❌ | ✅ |
| POST /doctors | ❌ | ❌ | ✅ |
| PATCH /doctors/{id}/deactivate | ❌ | ❌ | ✅ |

**Not**: `*` işareti kendi verilerine sınırlı erişimi gösterir.

---

## 📞 Sık Sorulan Sorular (SSS)

**S: Tamamlanmayan randevulara reçete yazılabilir mi?**  
C: Hayır. Reçete oluşturmak sadece COMPLETED randevular için mümkündür ve reçete yazıldığında randevu otomatik COMPLETED olur.

**S: Geri bildirimleri silersek ne olur?**  
C: Admin tarafından deleted geri bildirim veritabanından kalıcı olarak silinir ve kurtarılamaz.

**S: Pasif doktor sadece neler yapamaz?**  
C: Pasif doktorlar:
- Yeni randevu alamazlar
- Giriş yapabilirler (eski verilerine erişim)
- Geçmiş reçete yönetimi yapabilirler

**S: Finansal raporlama gerçek mi?**  
C: Hayır. Varsayımsal bir modeldir (100 TL/randevu, 50 TL doktor payı). Real sistem için yapılandırılabilir hale getirilmelidir.

---

**Versiyon**: 3.0  
**Tarih**: 2026-04-10  
**Durum**: ✅ Production Ready
