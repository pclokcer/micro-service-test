# Wallet Service 💰

Kullanıcıların veya şirketlerin cüzdan bakiyelerini yöneten en kritik ve hataya tahammülü olmayan finansal servistir. Bu serviste tutarlılık her şeyden önemlidir.

## ⚙️ Teknik Detaylar
- **Port:** `3006`
- **Veritabanı:** PostgreSQL (`wallet_db`)
- **Tasarım Deseni (Pattern):** Saga Pattern, Local Database Transactions, Row Locking
  - Kafka üzerinden `transfer.initiated` event'ini dinler.
  - **Local Transaction & Kilitleme:** Cüzdandan para düşmek ve diğerine para eklemek için `BEGIN` işlemi başlatır. Araya giren başka işlemlerin veriyi bozmaması için `SELECT ... FOR UPDATE` ile işlem yapılan satırları kilitler.
  - Göndericinin bakiyesi yetersizse hemen bir Exception fırlatır, işlemi `ROLLBACK` ile geri alır ve Kafka'ya `transfer.failed` gönderir (Distributed Saga Rollback).
  - İşlem başarılı olursa `COMMIT` ile veritabanına yazar ve Kafka'ya `transfer.success` event'ini yollar.

## 🚀 Nasıl Çalıştırılır?
```bash
npm install
npm start
```

## 📡 API Uç Noktaları (Endpoints)
- `GET /health` : Servis sağlık durumu.
- `GET /wallets` : Tüm cüzdanları ve güncel bakiyelerini getirir (Bakiye kontrolü için).
