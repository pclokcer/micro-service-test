const express = require('express');
const { initDB, pool } = require('./db');
const { connectConsumer } = require('./kafka/consumer');
const { connectProducer } = require('./kafka/producer');

const app = express();
app.use(express.json());

// GET all wallets (for easy verification)
app.get('/wallets', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM wallets ORDER BY id ASC');
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

app.get('/health', (req, res) => {
  res.json({ status: 'UP', service: 'wallet-service' });
});

const PORT = process.env.PORT || 3006;

const startServer = async () => {
  try {
    setTimeout(async () => {
      await initDB();
      await connectConsumer();
      await connectProducer();
      
      app.listen(PORT, () => {
        console.log(`Wallet Service running on port ${PORT}`);
      });
    }, 5000);
  } catch (err) {
    console.error('Failed to start Wallet Service', err);
    process.exit(1);
  }
};

startServer();
