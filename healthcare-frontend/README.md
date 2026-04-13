# Healthcare Frontend - React Randevu Uygulaması

Bu React uygulaması, hastalar için randevu alma sisteminin ön yüzüdür.

## Kurulum ve Çalıştırma

### Adım 1: Bağımlılıkları Yükle
```bash
npm install
```

### Adım 2: Backend'in Ayakta Olduğundan Emin Ol
Backend uygulaması `http://localhost:8080` adresinde çalışıyor olmalıdır.

### Adım 3: Frontend'i Başlat
```bash
npm run dev
```

Frontend `http://localhost:3000` adresinden erişilebilir hale gelecektir.

## Özellikler

### Senaryo 1: Randevu Alma (Hasta)
- **Adım 1**: Hasta girişi (Hasta ID gerekli)
- **Adım 2**: Poliklinik seçimi - Tüm bölümlerin listesi gösterilir
- **Adım 3**: Doktor seçimi - Seçilen bölüme ait doktorlar listelenir
- **Adım 4**: Tarih ve saat seçimi
  - Minimum 1 gün sonra, maksimum 30 gün sonrasına kadar randevu alınabilir
  - Doktor'un müsait olan saatleri dinamik olarak gösterilir (30 dakikalık aralıklar)
  - Opsiyonel notlar eklenebilir
- **Adım 5**: Başarı mesajı ve randevu detayları

## API Endpoint'leri

### Bölümler
- `GET /api/departments` - Tüm bölümleri getir

### Doktorlar
- `GET /api/doctors/department/{departmentId}` - Bölüme göre doktorları filtrele
- `GET /api/doctors/specialization/{specialization}` - Uzmanlaşmaya göre filtrele

### Randevular
- `POST /api/appointments` - Yeni randevu oluştur
- `GET /api/appointments/doctor/{doctorId}/available-slots?date=YYYY-MM-DD` - Müsait zaman aralıklarını getir
- `GET /api/appointments/doctor/{doctorId}/available?dateTime=YYYY-MM-DDTHH:mm:ss` - Belirli saatte müsaitlik kontrol et

## Dosya Yapısı

```
healthcare-frontend/
├── src/
│   ├── components/
│   │   └── AppointmentBooking.jsx    # Randevu alma bileşeni
│   ├── services/
│   │   └── api.js                    # API istemcisi ve servisleri
│   ├── styles/
│   │   └── AppointmentBooking.css    # Stil dosyaları
│   ├── App.jsx                       # Ana bileşen
│   ├── main.jsx                      # Entry point
│   ├── index.css                     # Global stiller
│   └── App.css
├── index.html                        # HTML sayfası
├── vite.config.js                    # Vite konfigürasyonu
├── package.json                      # Bağımlılıklar
└── README.md
```

## CORS Desteği

Frontend ve Backend arasında CORS desteği sağlanmıştır:
- Backend: Tüm controller'larda `@CrossOrigin(origins = "http://localhost:3000")`
- Frontend: Axios otomatik olarak CORS headers'ını gönderir

## Teknolojiler

- React 18.2.0
- Axios (HTTP istemcisi)
- Vite (Build tool)
- CSS3

## Notlar

- Hasta ID'si localStorage'da saklanır, böylece sayfa yenilenirse oturum devam eder
- Tüm API çağrıları Axios üzerinden yapılır
- Hata yönetimi ve loading state'leri uygulanmıştır
- Responsive tasarım (mobil uyumlu)

## Geliştirme

Yeni özellikler eklemek için:

1. `src/components/` klasöründe yeni bileşen oluştur
2. `src/services/api.js` dosyasına API fonksiyonlarını ekle
3. Gerekirse `src/styles/` klasöründe CSS dosyası oluştur
4. Bileşeni `App.jsx` veya başka bileşenlerde kullan

## Sorun Giderme

### "Cannot GET /api/..."
- Backend'in 8080 portunda çalışır durumda olduğundan emin olun
- `vite.config.js` dosyasında proxy ayarları kontrol edin

### CORS Hatası
- Backend'in `@CrossOrigin` annotation'ı kontrol edin
- Localhost:3000'den istek gönderildiğinden emin olun

### Bölüm/Doktor boş geliyorsa
- Backend veritabanında test veri olduğundan emin olun
- Browser console'da hata mesajı kontrol edin

