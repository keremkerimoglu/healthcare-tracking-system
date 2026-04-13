# Sağlık Randevu Sistemi - Kurulum ve Çalıştırma Kılavuzu

## 📋 Proje Yapısı

```
yazılım müh proje/
├── healthcare-system/        # Backend (Java Spring Boot)
│   ├── src/
│   ├── pom.xml
│   └── test-data.sql
└── healthcare-frontend/      # Frontend (React)
    ├── src/
    ├── package.json
    └── vite.config.js
```

---

## 🔧 Backend Kurulumu (Java Spring Boot)

### Gereksinimler
- Java 17+
- Maven 3.6+
- PostgreSQL 12+

### Adım 1: PostgreSQL Veritabanı Oluştur

```sql
CREATE DATABASE healthcare_db;
```

### Adım 2: Backend Bağımlılıklarını Yükle

```bash
cd healthcare-system
mvn clean install
```

### Adım 3: Test Verisi Ekle (Opsiyonel)

PostgreSQL'e bağlan ve `test-data.sql` dosyasını çalıştır:

```bash
psql -U postgres -d healthcare_db -f test-data.sql
```

Veya pgAdmin/SQL IDE aracılığıyla dosyayı çalıştır.

### Adım 4: Backend'i Başlat

```bash
mvn spring-boot:run
```

veya IDE'de (VS Code / IntelliJ) sağ tıkla → Run 

Backend şu adresinde çalışacaktır: **http://localhost:8080**

---

## 🎨 Frontend Kurulumu (React)

### Gereksinimler
- Node.js 16+
- npm 7+

### Adım 1: Bağımlılıkları Yükle

```bash
cd healthcare-frontend
npm install
```

### Adım 2: Frontend'i Başlat

```bash
npm run dev
```

Frontend şu adresinde çalışacaktır: **http://localhost:3000**

---

## 🧪 Test Senaryosu: Randevu Alma

### 1️⃣ Backend'i Test Et

Terminal'de backend'in çalışıp çalışmadığını kontrol et:

```bash
curl http://localhost:8080/api/departments
```

Bölümlerin JSON formatında dönerken, başarılıdır.

### 2️⃣ Frontend'e Git

Tarayıcıda aç: **http://localhost:3000**

### 3️⃣ Randevu Alma Adımları

1. **Hasta Girişi**: Hasta ID gir (örn: 1)
2. **Poliklinik Seç**: Listeden bir bölüm seç (örn: Kardiyoloji)
3. **Doktor Seç**: O bölümdeki doktorlardan birini seç
4. **Tarih Seç**: Takvimden 1-30 gün sonrasını seç
5. **Saat Seç**: Müsait saatleri göster (30 dakikalık aralıklar)
6. **Onayla**: "Randevuyu Onayla" butonuna tıkla
7. **Başarı**: Randevu başarıyla oluşturuldu mesajını gör

---

## 🔌 API Endpoint'leri

### Bölümler
```
GET /api/departments              → Tüm bölümleri getir
GET /api/departments/{id}         → Bölümü ID'ye göre getir
POST /api/departments             → Yeni bölüm oluştur
PUT /api/departments/{id}         → Bölümü güncelle
DELETE /api/departments/{id}      → Bölümü sil
```

### Doktorlar
```
GET /api/doctors                                  → Tüm doktorları getir
GET /api/doctors/{id}                            → Doktoru ID'ye göre getir
GET /api/doctors/department/{departmentId}       → Bölüme göre doktorları listele
GET /api/doctors/specialization/{specialization} → Uzmanlaşmaya göre listele
PUT /api/doctors/{id}/profile                    → Profili güncelle
PUT /api/doctors/{id}/rating                     → Puanı güncelle
DELETE /api/doctors/{id}                         → Doktoru sil
POST /api/doctors                                → Yeni doktor oluştur
```

### Randevular
```
GET /api/appointments                                    → Tüm randevuları getir
GET /api/appointments/{id}                              → Randevuyu ID'ye göre getir
POST /api/appointments                                  → Yeni randevu oluştur
GET /api/appointments/patient/{patientId}              → Hastanın randevuları
GET /api/appointments/doctor/{doctorId}                → Doktorun randevuları
GET /api/appointments/doctor/{doctorId}/available-slots?date=YYYY-MM-DD      → Müsait saatler
GET /api/appointments/doctor/{doctorId}/available?dateTime=YYYY-MM-DDTHH:mm:ss → Saati kontrol et
PUT /api/appointments/{id}/cancel-patient               → Hastanın iptali
PUT /api/appointments/{id}/cancel-doctor                → Doktorun iptali
PUT /api/appointments/{id}/complete                     → Randevuyu tamamla
GET /api/appointments/upcoming                          → Yaklaşan randevular
DELETE /api/appointments/{id}                           → Randevuyu sil
```

### Hastalar
```
GET /api/patients                   → Tüm hastaları getir
GET /api/patients/{id}              → Hastayı ID'ye göre getir
POST /api/patients                  → Yeni hasta oluştur
PUT /api/patients/{id}/profile      → Profili güncelle
DELETE /api/patients/{id}           → Hastayı sil
```

### Kullanıcılar
```
GET /api/users/{id}                 → Kullanıcıyı getir
GET /api/users/email/{email}        → Email'e göre getir
GET /api/users                      → Tüm kullanıcıları getir
POST /api/users/login               → Giriş yap
DELETE /api/users/{id}              → Kullanıcıyı sil
PUT /api/users/{id}/reset-password  → Şifreyi sıfırla
```

### Geri Bildirim
```
GET /api/feedback                          → Tüm geri bildirimleri getir
GET /api/feedback/{id}                     → Geri bildirimi getir
POST /api/feedback                         → Geri bildirim gönder
GET /api/feedback/doctor/{doctorId}        → Doktora ait geri bildirimler
GET /api/feedback/doctor/{doctorId}/average-rating  → Doktor puanı
GET /api/feedback/approved                 → Onaylı geri bildirimler
GET /api/feedback/pending                  → Beklemede olan geri bildirimler
PUT /api/feedback/{id}/approve             → Geri bildirimi onayla
DELETE /api/feedback/{id}                  → Geri bildirimi sil
```

### Reçeteler
```
GET /api/prescriptions                     → Tüm reçeteleri getir
GET /api/prescriptions/{id}                → Reçeteyi getir
POST /api/prescriptions                    → Reçete oluştur
GET /api/prescriptions/patient/{patientId} → Hastanın reçeteleri
PUT /api/prescriptions/{id}                → Reçeteyi güncelle
DELETE /api/prescriptions/{id}             → Reçeteyi sil
```

---

## 🐛 CORS Desteği

Frontend ve Backend arasında CORS otomatik olarak etkindir:
- Backend: Tüm controller'lar `@CrossOrigin(origins = "http://localhost:3000")`
- Frontend: Axios CORS headers'ları otomatik gönderir

---

## 📱 Müsaitlik Kontrol Mantığı

- **30 dakikalık aralıklar**: Her saat başında ve 30 dakikada bir randevu alınabilir
- **Çakışma kontrolü**: Aynı doktor için aynı saatte iki randevu olamaz
- **Arası boşluk**: Minimum 30 dakika arası gerektirir
- **Tarih aralığı**: 1 gün sonra - 30 gün sonra arasında

---

## ⚠️ Sorun Giderme

### Backend başlamıyor
```
Error: Could not find or load main class...
```
- Java 17+ kurulu olduğunu kontrol et: `java -version`
- Maven kurulu olduğunu kontrol et: `mvn -version`
- Bağımlılıkları temizle ve yeniden yükle: `mvn clean install`

### PostgreSQL bağlantısı başarısız
- PostgreSQL servisi çalışır durumda mı? 
- `application.properties`'de veritabanı ayarlarını kontrol et
- Kullanıcı adı/şifre doğru mu?

### Frontend başlamıyor
```
npm ERR! command not found: create-react-app
```
- Node.js ve npm yüklü mü? `node -v && npm -v`
- Bağımlılıkları yeniden yükle: `npm install`

### API çağrıları başarısız (CORS hatası)
- Backend 8080'de çalışıyor mu?
- Frontend 3000'de çalışıyor mu?
- Browser console'da hatayı kontrol et

---

## 📚 Senaryo 1: Randevu Alma (Hasta) - Ardışıklık Diyagramı

```
Hasta
  │
  ├─→ [1] /api/departments GET (Poliklinikleri listele)
  │        ↓ (Bölümleri göster)
  │
  ├─→ [2] /api/doctors/department/{deptId} GET (Doktorları listele)
  │        ↓ (Doktorları göster)
  │
  ├─→ [3] /api/appointments/doctor/{docId}/available-slots GET (Müsait saatleri getir)
  │        ↓ (Takvimde müsait saatleri göster)
  │
  ├─→ [4] /api/appointments POST (Randevu oluştur)
  │        ├─→ (Müsaitlik kontrol)
  │        ├─→ (PENDING durumunda kaydet)
  │        └─→ Başarı/Hata mesajı
  │
  └─→ [5] Randevu detaylarını göster
```

---

## 🚀 Üretim Ortamına Dağıtım (İleri)

### Backend JAR oluştur
```bash
mvn clean package
java -jar target/healthcare-system-1.0.0.jar
```

### Frontend build et
```bash
npm run build
```

---

## 📝 Notlar

- Test verileri `test-data.sql` dosyasında bulunur
- Şifreler gerçek uygulamada mutlaka BCrypt ile hashlenmelidir
- CORS ayarları production'da kısıtlanmalıdır
- API rate limiting eklenmelidir
- Loglama ve hata yönetimi geliştirilmelidir

---

## ✅ Kontrol Listesi

- [ ] Java 17+ kurulu
- [ ] Maven kurulu
- [ ] PostgreSQL çalışıyor
- [ ] healthcare_db veritabanı oluşturuldu
- [ ] Backend derlemesi başarılı
- [ ] Backend 8080'de çalışıyor
- [ ] Node.js 16+ kurulu
- [ ] npm kurulu
- [ ] Frontend bağımlılıkları yüklenmiş
- [ ] Frontend 3000'de çalışıyor
- [ ] API endpoint'leri test edildi
- [ ] Randevu alma akışı test edildi

---

**Başarılar! 🎉**

