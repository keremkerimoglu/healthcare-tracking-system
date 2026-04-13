# Admin Paneli, Doktor Yönetimi ve Geri Bildirim Sistemi - Implementasyon Kılavuzu

**Tarih**: 2026-04-10  
**Versiyon**: 3.0  
**Özellikler**: Admin Dashboard, Doktor Yönetimi, Feedback Sistemi, Raporlama

---

## 📋 İçindekiler

1. [Genel Bakış](#genel-bakış)
2. [Senaryo 4: Geri Bildirim Sistemi](#senaryo-4-geri-bildirim-sistemi)
3. [Senaryo 8-10: Admin Senaryoları](#senaryo-8-10-admin-senaryoları)
4. [Backend API Uçnoktaları](#backend-api-uçnoktaları)
5. [Frontend Bileşenleri](#frontend-bileşenleri)
6. [Kullanım Örnekleri](#kullanım-örnekleri)
7. [Test Senaryoları](#test-senaryoları)

---

## 🎯 Genel Bakış

Senaryo 4, 8, 9 ve 10 şunları içermektedir:

### Senaryo 4: Geri Bildirim Sistemi
- Hastalar tamamlanmış randevular için 1-5 yıldız rating ve yorum bırakabilir
- Yorumlar admin tarafından onaylanmalı
- Onaylanan yorumlar diğer hastalar için görünür hale gelir

### Senaryo 8-9: İstatistikler ve Raporlama
- Aylık randevu sayıları (grafik verisi)
- Branş bazlı yoğunluk
- Finansal özet (gelir, doktor ödemeleri, net kar)
- Doktor performansı (randevu sayısı, ortalama rating)

### Senaryo 10: Doktor Yönetimi
- Admin yeni doktor ekleyebilir
- Doktor profili güncellenebilir
- Doktor pasifleştirilebilir/aktifleştirilebilir

---

## 🔄 Senaryo 4: Geri Bildirim Sistemi

### Akış Diyagramı

```
Hasta Paneli (COMPLETED Randevu)
    ↓
[⭐ Değerlendir] Butonu
    ↓
FeedbackModal Açılır
    ↓
1-5 Yıldız + Yorum Girilir
    ↓
POST /api/feedback
    ↓
Backend: isApproved = false (Beklemede)
    ↓
Admin Paneli → Yorum Onaylama
    ↓
PUT /api/feedback/{id}/approve
    ↓
Doktor Profil Sayfasında Görüntülenebilir
```

### Frontend: PatientPanel.jsx

**COMPLETED randevular için "Değerlendir" butonu:**

```jsx
{apt.status === 'COMPLETED' && (
  <div className="appointment-footer">
    <button 
      className="btn btn-small btn-primary"
      onClick={() => setFeedbackModal({ 
        isOpen: true, 
        appointmentId: apt.id, 
        doctorId: apt.doctor?.id 
      })}
    >
      ⭐ Değerlendir
    </button>
  </div>
)}
```

### Frontend: FeedbackModal.jsx

**Modal özellikleri:**
- 5 yıldız seçimi (interactive)
- Metin alanı (max 500 karakter)
- Hata kontrolleri
- Yükleme durumu gösterimi
- Admin onayı bilgisi

```javascript
const handleSubmit = async () => {
  const feedbackData = {
    appointmentId: appointmentId,
    patientId: patientId,
    doctorId: doctorId,
    rating: parseInt(rating),
    comment: comment
  };
  const response = await feedbackService.submitFeedback(feedbackData);
};
```

### Backend: FeedbackService

```java
public Feedback submitFeedback(Long appointmentId, Integer rating, String comment) {
  // Randevuyu alır, rating ve comment'i kaydeder
  // İlk olarak isApproved = false olarak ayarlanır
  feedback.setIsApproved(false);
  return feedbackRepository.save(feedback);
}
```

### Backend: FeedbackController

**Uçnoktalar:**
- `POST /api/feedback` - Feedback gönder
- `GET /api/feedback/pending` - Beklemede olan yorumlar
- `GET /api/feedback/approved` - Onaylanan yorumlar
- `PUT /api/feedback/{id}/approve` - Onay
- `DELETE /api/feedback/{id}/reject` - Reddet

---

## 📊 Senaryo 8-10: Admin Senaryoları

### Admin Paneli Yapısı

```
⚙️ Admin Paneli
├── 📊 Dashboard
│   ├── 💰 Finansal Özet (Gelir, Doktor Ödemeleri, Net Kar)
│   ├── 📅 Aylık Randevu İstatistikleri (Grafik)
│   ├── 🏥 Branş Bazlı Yoğunluk
│   └── 🌟 Doktor Performansı (Tablo)
├── 👨‍⚕️ Doktor Yönetimi
│   ├── ➕ Yeni Doktor Ekle (Form)
│   └── 📋 Doktor Listesi (Kartlar)
└── 💬 Yorum Onaylama
    ├── ⏳ Beklemede (n yorumlar)
    └── ✅ Onaylanan (n yorumlar)
```

### Finansal Metrikleri

**Varsayımsal Fiyatlandırma:**
- Randevu maliyeti: 100 TL
- Doktor payı: 50 TL (randevu başına)

**Formüller:**
```
Toplam Gelir = Tamamlanan Randevu Sayısı × 100 TL
Doktor Ödemeleri = Tamamlanan Randevu Sayısı × 50 TL
Net Kar = Toplam Gelir - Doktor Ödemeleri
```

---

## 🔌 Backend API Uçnoktaları

### ReportController

```http
GET /api/reports/monthly-appointments
├─ Yanıt: { "2026-01": 10, "2026-02": 15, ... }

GET /api/reports/department-stats
├─ Yanıt: { "Kardiyoloji": 25, "Ruh Sağlığı": 15, ... }

GET /api/reports/financial-summary
├─ Yanıt: { 
│   "totalRevenue": 1500,
│   "totalDoctorPayment": 750,
│   "netProfit": 750,
│   "completedAppointments": 15,
│   "appointmentCost": 100,
│   "doctorSharePerAppointment": 50
│ }

GET /api/reports/doctor-performance
├─ Yanıt: [
│   {
│     "doctorId": 1,
│     "doctorEmail": "doc1@example.com",
│     "totalAppointments": 20,
│     "completedAppointments": 15,
│     "averageRating": 4.5,
│     "department": "Kardiyoloji"
│   },
│   ...
│ ]
```

### DoctorController (Güncellenen)

```http
POST /api/doctors
├─ İstek: { email, password, specialization, departmentId, bio }
├─ Yanıt: DoctorProfileDTO

PATCH /api/doctors/{id}/deactivate
├─ Yanıt: Doktor (active=false)

PATCH /api/doctors/{id}/reactivate
├─ Yanıt: Doktor (active=true)
```

### FeedbackController

```http
POST /api/feedback
├─ İstek: { appointmentId, rating, comment }
├─ Yanıt: Feedback (isApproved=false)

GET /api/feedback/pending
├─ Yanıt: [ Feedback[], ... ]

GET /api/feedback/approved
├─ Yanıt: [ Feedback[], ... ]

PUT /api/feedback/{id}/approve
├─ Yanıt: Feedback (isApproved=true)

DELETE /api/feedback/{id}/reject
├─ Yanıt: { success: true }
```

---

## 🎨 Frontend Bileşenleri

### 1. AdminPanel.jsx

**Dosya:** `src/components/AdminPanel.jsx`  
**Satır:** ~600 satır  
**Sekmeler:** Dashboard, Doktor Yönetimi, Yorum Onaylama

**Önemli State'ler:**
```javascript
const [activeTab, setActiveTab] = useState('dashboard');
const [monthlyData, setMonthlyData] = useState({});
const [departmentData, setDepartmentData] = useState({});
const [financialData, setFinancialData] = useState(null);
const [doctorPerformance, setDoctorPerformance] = useState([]);
const [pendingFeedback, setPendingFeedback] = useState([]);
```

**Fonksiyonlar:**
- `fetchDashboardData()` - Rapor verilerini yükle
- `handleAddDoctor()` - Yeni doktor ekle
- `handleDeactivateDoctor()` / `handleReactivateDoctor()` - Doktor durumu değiştir
- `handleApproveFeedback()` / `handleRejectFeedback()` - Yorum onayı

### 2. PatientPanel.jsx (Güncellenen)

**Dosya:** `src/components/PatientPanel.jsx`

**Yeni Eklenen Özellikleri:**
```javascript
const [feedbackModal, setFeedbackModal] = useState({ 
  isOpen: false, 
  appointmentId: null, 
  doctorId: null 
});

// COMPLETED randevuya tıklandığında
<button onClick={() => setFeedbackModal({ 
  isOpen: true, 
  appointmentId: apt.id, 
  doctorId: apt.doctor?.id 
})}>
  ⭐ Değerlendir
</button>
```

### 3. FeedbackModal.jsx

**Dosya:** `src/components/FeedbackModal.jsx`  
**Satır:** ~90 satır

**Özellikler:**
- 5 yıldız seçici (interactive hover ve click)
- Metin alanı (500 karakter limiti)
- Hata kontrolleri
- Loading durumu
- Admin onayı notası

**Örnek Kullanım:**
```jsx
<FeedbackModal
  appointmentId={feedbackModal.appointmentId}
  patientId={patientId}
  doctorId={feedbackModal.doctorId}
  onClose={() => setFeedbackModal({ isOpen: false, appointmentId: null, doctorId: null })}
  onSubmitSuccess={() => alert('✅ Değerlendirmeniz gönderildi!')}
/>
```

### 4. App.jsx (Güncellenen)

**Yeni:**
- AdminPanel için 3. role seçeneği
- Menu ekranında 3 buton (Hasta, Doktor, Admin)
- Rol-başına localStorage temizleme

---

## 🔌 API Servisleri (api.js)

```javascript
export const reportService = {
  getMonthlyAppointments: () => api.get('/reports/monthly-appointments'),
  getDepartmentStats: () => api.get('/reports/department-stats'),
  getFinancialSummary: () => api.get('/reports/financial-summary'),
  getDoctorPerformance: () => api.get('/reports/doctor-performance')
};

export const feedbackService = {
  submitFeedback: (feedbackData) => api.post('/feedback', feedbackData),
  getPendingFeedback: () => api.get('/feedback/pending'),
  getApprovedFeedback: () => api.get('/feedback/approved'),
  approveFeedback: (feedbackId) => api.put(`/feedback/${feedbackId}/approve`),
  rejectFeedback: (feedbackId) => api.delete(`/feedback/${feedbackId}/reject`)
};

export const doctorService = {
  // ... mevcut metodlar ...
  createDoctor: (doctorData) => api.post('/doctors', doctorData),
  deactivateDoctor: (doctorId) => api.patch(`/doctors/${doctorId}/deactivate`),
  reactivateDoctor: (doctorId) => api.patch(`/doctors/${doctorId}/reactivate`)
};
```

---

## 📖 Kullanım Örnekleri

### Hasta: Doktorunuzu Değerlendirme

1. Hasta Paneli'ne giriş yap (Hasta ID: 1)
2. "Randevularım" sekmesine git
3. COMPLETED (✅ Tamamlandı) durumundaki bir randevuya tıkla
4. "⭐ Değerlendir" butonunu tıkla
5. Modal açılır - 1-5 yıldız seç
6. Yorum yazıyla (500 karaktere kadar)
7. "Gönder" butonuna tıkla
8. Başarı mesajı gösterilir

### Admin: Dashboard'u İnceleme

1. Admin Paneli'ne giriş yap (Admin ID: 1)
2. "📊 Dashboard" sekmesini seç
3. Aşağıdaki metrikleri görüntüle:
   - Toplam Gelir, Doktor Ödemeleri, Net Kar
   - Aylık Randevu sayıları (çubuk grafik)
   - Branş Bazlı Yoğunluk
   - Doktor Performansı Tablosu

### Admin: Yeni Doktor Ekleme

1. "👨‍⚕️ Doktor Yönetimi" sekmesini seç
2. "➕ Yeni Doktor Ekle" formunu doldur:
   - Email: oncologist@hospital.com
   - Şifre: SecurePass123!
   - Uzmanlık: Onkoloji
   - Bölüm: Kanser Merkezi seç
   - Biyografi: (isteğe bağlı)
3. "Doktor Ekle" butonuna tıkla
4. Doktor listesinde görüntülenmesi gerekir

### Admin: Yoga Onaylama

1. "💬 Yorum Onaylama" sekmesini seç
2. "⏳ Beklemede Olan Yorumlar" bölümünü incele
3. Yanlış bir yorumun "❌ Reddet" butonunu tıkla
4. İyi bir yorum için "✅ Onayla" butonunu tıkla
5. Onaylanan yorum "✅ Onaylanan Yorumlar" bölümüne taşınır

---

## 🧪 Test Senaryoları

### Test 1: Feedback Submission Flow

```
Ön Şart:
- Hasta ID 1 vardır
- Randevu ID 1 vardır ve status=COMPLETED
- Doktor ID 1 vardır

Adımlar:
1. PatientPanel'e (ID: 1) giriş yap
2. Randevu tab'inde 1. randevuyu bul
3. Status "✅ Tamamlandı" olmalı
4. "⭐ Değerlendir" butonuna tıkla

Beklenen Sonuç:
- FeedbackModal açılır
- 4 yıldız seç
- "Çok iyi doktor, tavsiye ederim" yaz
- Gönder butonuna tıkla
- Server cevap: success=true
- Modal kapanır ve success message gösterilir
- Veritabanı: feedback entry, isApproved=false
```

### Test 2: Admin Dashboard

```
Ön Şart:
- En az 5 COMPLETED randevu vardır
- Randevular farklı doktorlar tarafından yapılmıştır
- Doktorlar farklı bölümlerdedir

Adımlar:
1. AdminPanel'e (ID: 1) giriş yap
2. Dashboard tab'ını seç

Beklenen Sonuç:
- Finansal Özet kartları görüntülenir:
  * Toplam Gelir = Randevu Sayısı × 100
  * Doktor Ödemeleri = Randevu Sayısı × 50
  * Net Kar = Toplam Gelir - Doktor Ödemeleri
- Aylık randevu bar grafiği görüntülenir
- Branş bazlı yoğunluk bar grafiği görüntülenir
- Doktor performans tablosu görüntülenir:
  * Tom doktor en fazla randevuya sahip olmalı
  * Ortalama rating hesaplanmalı
```

### Test 3: Doctor Management

```
Ön Şart:
- Bölümler mevcuttur

Adımlar:
1. AdminPanel'e giriş yap
2. "👨‍⚕️ Doktor Yönetimi" tab'ını seç
3. Form'u doldur:
   Email: test@mail.com
   Password: TestPass123!
   Uzmanlık: Fizik Tedavi
   Bölüm: Fizyoterapist
4. "Doktor Ekle" butonuna tıkla

Beklenen Sonuç:
- Server cevap: success=true
- Doktor listesinde yeni doktor görüntülenir
- Doktor kartı "🟢 Aktif" badge'i gösterir
- Veritabanında doktor entry oluşmuştur (active=true)
```

### Test 4: Feedback Approval

```
Ön Şart:
- Beklemede feedback entry'si vardır

Adımlar:
1. AdminPanel'e giriş yap
2. "💬 Yorum Onaylama" tab'ını seç
3. Beklemede yorumlardan birini bul
4. "✅ Onayla" butonuna tıkla

Beklenen Sonuç:
- Success mesajı gösterilir
- Yorum "✅ Onaylanan Yorumlar" bölümüne taşınır
- Feedback entry, isApproved=true olur
```

---

## 🔒 Güvenlik Notları

1. **Admin Yetkilendirmesi**: Şu anda UI-level kontrol vardır. Production'da JWT/claims bazında backend kontrolü eklenmelidir.

2. **Feedback Moderation**: Admin onayından geçmeyen yorumlar public'te görüntülenmemelidir.

3. **Doktor Deactivation**: Pasifleştirilmiş doktor'lara randevu verilmemelidir.

4. **Finansal Veriler**: Raporlama verisi SQL injection/veri manipülasyonundan korunmalı.

---

## 🚀 Deployment Checklist

- [ ] Backend derlenecek: `mvn clean compile`
- [ ] Frontend build edilecek: `npm run build`
- [ ] Test verileri yüklenecek
- [ ] Admin kullanıcısı oluşturulacak
- [ ] Veritabanı backuplanacak
- [ ] CORS ayarları kontrol edilecek
- [ ] Port'lar açık olmalı: 8080 (backend), 3000 (frontend)
- [ ] Database Connection doğrulanmalı

---

## 📝 Sonraki Adımlar

1. **Senaryo 5**: Hasta Profil Sistemi (sağlık özgeçmişi, alerjiler)
2. **Senaryo 6**: İstatistiksel Raporlama (PDF export)
3. **Senaryo 7**: Email Notifikasyonu
4. **Senaryo 11-12**: Bilgi Yönetimi & Güvenliği

---

**Hazırlayan:** AI Healthcare System  
**Tarih:** 2026-04-10  
**Durum:** ✅ Tamamlandı (Senaryo 1-4, 8-10)
