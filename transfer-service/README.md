# Transfer Service 🔄

Bu mikroservis cüzdanlar arası para transferi işlemlerini başlatır. Tıpkı `Order Service` gibi bir dağıtık işlem (**Saga Pattern**) başlatıcısı rolündedir.

## ⚙️ Teknik Detaylar
- **Port:** `3005`
- **Veritabanı:** PostgreSQL (`transfer_db`)
- **Tasarım Deseni (Pattern):** Saga Pattern
  - Transfer başlatıldığında tabloya `PENDING` kaydı atılır.
  - `Wallet Service`in bu işlemi veritabanında gerçekleştirmesi için Kafka'ya `transfer.initiated` event'i yollar.
  - Eğer `Wallet Service` (Örn. Yetersiz bakiye sebebiyle) hata fırlatırsa `transfer.failed` event'ini alır ve kendi veritabanındaki transfer kaydını `FAILED` yaparak işlemi geri alır (Rollback). Başarılıysa `COMPLETED` olur.

## 🚀 Nasıl Çalıştırılır?
```bash
npm install
npm start
```

## 📡 API Uç Noktaları (Endpoints)
- `GET /health` : Servis sağlık durumu.
- `GET /transfers` : Tüm transferleri ve durumlarını listeler.
- `POST /transfers` : Yeni bir para transferi Saga'sını başlatır.
