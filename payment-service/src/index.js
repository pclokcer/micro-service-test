const express = require('express');
const { connectConsumer } = require('./kafka/consumer');
const { connectProducer } = require('./kafka/producer');

const app = express();
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'UP', service: 'payment-service' });
});

const PORT = process.env.PORT || 3004;

const startServer = async () => {
  try {
    // Add small delay to let Kafka initialize in docker-compose
    setTimeout(async () => {
      await connectConsumer();
      await connectProducer();
      
      app.listen(PORT, () => {
        console.log(`Payment Service running on port ${PORT}`);
      });
    }, 5000);
  } catch (err) {
    console.error('Failed to start Payment Service', err);
    process.exit(1);
  }
};

startServer();
