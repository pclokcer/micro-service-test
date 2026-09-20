# Company Service 🏢

Bu servis şirket bilgilerini yönetir. Şirket verisini oluştururken veya listelerken, o şirketi kimin oluşturduğunu (kullanıcı bilgisini) göstermek için **API Composition** desenini kullanır.

## ⚙️ Teknik Detaylar
- **Port:** `3002`
- **Veritabanı:** PostgreSQL (`company_db`)
- **Tasarım Deseni (Pattern):** API Composition (Senkron İletişim)
  - Kendi veritabanına sadece `created_by_user_id` kaydeder.
  - İhtiyaç anında `user-service` üzerinden HTTP Fetch ile kullanıcı datasına ulaşıp istemciye birleştirilmiş veriyi sunar. Bu sayede CQRS veya Veri Kopyalama ihtiyacını ortadan kaldırır.

## 🚀 Nasıl Çalıştırılır?
Docker Compose ile ana dizinden tüm proje başlatıldığında otomatik çalışır. Manuel başlatmak için:
```bash
npm install
npm start
```

## 📡 API Uç Noktaları (Endpoints)
- `GET /health` : Servis sağlık durumu.
- `GET /companies` : Şirketleri getirirken User Service'e **HTTP GET** isteği atarak datayı birleştirir (API Composition).
- `POST /companies` : Yeni bir şirket oluşturur.
