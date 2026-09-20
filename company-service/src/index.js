const express = require('express');
const { initDB } = require('./db');
const { connectConsumer } = require('./kafka/consumer');
const companyRoutes = require('./routes/companies');

const app = express();
const PORT = process.env.PORT || 3002;

// Middleware
app.use(express.json());

// Routes
app.use('/companies', companyRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'UP', service: 'company-service' });
});

// Init & Start
const startServer = async () => {
  try {
    // Wait for DB and Kafka to be ready
    setTimeout(async () => {
      await initDB();
      await connectConsumer();
      
      app.listen(PORT, () => {
        console.log(`Company Service running on port ${PORT}`);
      });
    }, 5000); // 5 sec delay for docker-compose dependencies
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
};

startServer();
