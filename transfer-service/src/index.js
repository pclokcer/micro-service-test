const express = require('express');
const { initDB } = require('./db');
const { connectConsumer } = require('./kafka/consumer');
const { connectProducer } = require('./kafka/producer');
const transferRoutes = require('./routes/transfers');

const app = express();
app.use(express.json());

app.use('/transfers', transferRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'UP', service: 'transfer-service' });
});

const PORT = process.env.PORT || 3005;

const startServer = async () => {
  try {
    setTimeout(async () => {
      await initDB();
      await connectConsumer();
      await connectProducer();
      
      app.listen(PORT, () => {
        console.log(`Transfer Service running on port ${PORT}`);
      });
    }, 5000);
  } catch (err) {
    console.error('Failed to start Transfer Service', err);
    process.exit(1);
  }
};

startServer();
