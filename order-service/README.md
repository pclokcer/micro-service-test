# Order Service 🛒

Bu mikroservis, sipariş yönetiminden (Sipariş Sepeti ve Siparişler) sorumludur. Mikroservis mimarisindeki **Saga Deseni (Choreography/Orchestrator)** için kritik bir başlatıcı görevi görür.

## ⚙️ Teknik Detaylar
- **Port:** `3003`
- **Veritabanı:** PostgreSQL (`order_db`)
- **Tasarım Deseni (Pattern):** Saga Pattern, Local Database Transactions
  - Müşteri bir sipariş verdiğinde veritabanına `PENDING` (Beklemede) statüsünde bir kayıt atar.
  - Ödeme tahsilatı için `order.created` event'ini Kafka'ya gönderir.
  - Eğer `Payment Service` başarısız olursa, Kafka üzerinden `payment.failed` event'ini alır ve sipariş durumunu **`CANCELLED` (İptal)** olarak güncelleyerek işlemi geri alır (Rollback).
  - Sipariş oluştururken `orders` ve `order_items` tablolarına aynı anda insert atarken `BEGIN`, `COMMIT`, `ROLLBACK` anahtarlarını kullanarak kendi içerisinde **Local DB Transaction** garantisi sunar.

## 🚀 Nasıl Çalıştırılır?
```bash
npm install
npm start
```

## 📡 API Uç Noktaları (Endpoints)
- `GET /health` : Servis sağlık durumu.
- `GET /orders` : Tüm siparişleri getirir.
- `POST /orders` : Yeni bir sipariş başlatır, veritabanına PENDING yazar ve Saga akışını (Ödeme sürecini) tetikler.
