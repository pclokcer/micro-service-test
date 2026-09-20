# Payment Service 💳

Bu servis ödeme süreçlerinin simülasyonunu yönetir. Gerçek bir veritabanı tutmak yerine Kafka üzerinden gelen sipariş taleplerine göre asenkron çalışarak olumlu veya olumsuz ödeme kararını verir.

## ⚙️ Teknik Detaylar
- **Port:** `3004`
- **Veritabanı:** Yok (Stateless olarak çalışır)
- **Tasarım Deseni (Pattern):** Event-Driven & Saga Pattern
  - Kafka'dan `order.created` event'ini dinler.
  - Sipariş edilen miktar `100` ve üzeriyse ödemeyi reddeder ve `payment.failed` event'ini Kafka'ya yazar (Saga Rollback süreci tetiklenir).
  - Miktar `100`'den küçükse ödemeyi onaylar ve `payment.success` event'ini yazar.

## 🚀 Nasıl Çalıştırılır?
```bash
npm install
npm start
```

## 📡 API Uç Noktaları (Endpoints)
- `GET /health` : Servis sağlık durumu.
- *API katmanı yoktur, tamamen Event-Driven (Kafka) çalışır.*
