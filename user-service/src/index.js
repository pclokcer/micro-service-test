const express = require('express');
const { initDB } = require('./db');
const { connectProducer } = require('./kafka/producer');
const userRoutes = require('./routes/users');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(express.json());

// Routes
app.use('/users', userRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'UP', service: 'user-service' });
});

// Init & Start
const startServer = async () => {
  try {
    // Wait for DB and Kafka to be ready
    setTimeout(async () => {
      await initDB();
      await connectProducer();
      
      app.listen(PORT, () => {
        console.log(`User Service running on port ${PORT}`);
      });
    }, 5000); // 5 sec delay for docker-compose dependencies to fully start
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
};

startServer();
