const express = require('express');
const { initDB } = require('./db');
const { connectConsumer } = require('./kafka/consumer');
const { connectProducer } = require('./kafka/producer');
const orderRoutes = require('./routes/orders');

const app = express();
app.use(express.json());

app.use('/orders', orderRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'UP', service: 'order-service' });
});

const PORT = process.env.PORT || 3003;

const startServer = async () => {
  try {
    // Add small delay to let DB/Kafka initialize in docker-compose
    setTimeout(async () => {
      await initDB();
      await connectConsumer();
      await connectProducer();
      
      app.listen(PORT, () => {
        console.log(`Order Service running on port ${PORT}`);
      });
    }, 5000);
  } catch (err) {
    console.error('Failed to start Order Service', err);
    process.exit(1);
  }
};

startServer();
