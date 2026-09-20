CREATE TABLE IF NOT EXISTS wallets (
    id SERIAL PRIMARY KEY,
    balance DECIMAL(10, 2) NOT NULL DEFAULT 0.00
);

-- İlk kurulumda test için 2 adet cüzdan oluştur (1 numarada para var, 2 numarada az var)
INSERT INTO wallets (id, balance) VALUES (1, 1000.00) ON CONFLICT DO NOTHING;
INSERT INTO wallets (id, balance) VALUES (2, 50.00) ON CONFLICT DO NOTHING;
