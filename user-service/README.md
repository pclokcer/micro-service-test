# User Service 👤

Bu mikroservis, sistemdeki kullanıcıları yönetmekten sorumludur. Diğer servislerin (özellikle `company-service`) ihtiyaç duyduğu temel kullanıcı verilerini sağlar.

## ⚙️ Teknik Detaylar
- **Port:** `3001`
- **Veritabanı:** PostgreSQL (`user_db`)
- **İletişim Rolü:** 
  - Gelen HTTP isteklerine yanıt verir (API Composition için HTTP hedefi).
  - Kullanıcı oluşturulduğunda Kafka'ya `user.created` event'ini asenkron olarak fırlatır.

## 🚀 Nasıl Çalıştırılır?
Docker Compose ile ana dizinden tüm proje başlatıldığında bu servis otomatik olarak ayağa kalkar. Sadece bu servisi manuel çalıştırmak isterseniz:
```bash
npm install
npm start
```

## 📡 API Uç Noktaları (Endpoints)
- `GET /health` : Servis sağlık durumu.
- `GET /users` : Tüm kullanıcıları listeler.
- `GET /users/:id` : Belirli bir kullanıcının detaylarını getirir (Company Service tarafından API Composition ile çağrılır).
- `POST /users` : Yeni bir kullanıcı oluşturur.
