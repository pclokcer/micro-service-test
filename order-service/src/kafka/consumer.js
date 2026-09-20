const { Kafka } = require('kafkajs');
const { pool } = require('../db');

const kafka = new Kafka({
  clientId: 'order-service',
  brokers: [process.env.KAFKA_BROKER || 'localhost:9092']
});

const consumer = kafka.consumer({ groupId: 'order-service-group' });

const connectConsumer = async () => {
  let connected = false;
  while (!connected) {
    try {
      await consumer.connect();
      console.log('Kafka Consumer connected');

      await consumer.subscribe({ topic: 'payment-events', fromBeginning: true });

      await consumer.run({
        eachMessage: async ({ topic, partition, message }) => {
          try {
            const payload = JSON.parse(message.value.toString());
            console.log(`Received event: ${payload.type}`, payload.data);

            if (payload.type === 'payment.success') {
              const { orderId } = payload.data;
              await pool.query('UPDATE orders SET status = $1 WHERE id = $2', ['COMPLETED', orderId]);
              console.log(`Order ${orderId} status updated to COMPLETED`);
            } else if (payload.type === 'payment.failed') {
              const { orderId } = payload.data;
              await pool.query('UPDATE orders SET status = $1 WHERE id = $2', ['CANCELLED', orderId]);
              console.log(`Order ${orderId} status updated to CANCELLED (Rollback)`);
            }

          } catch (err) {
            console.error('Error processing message:', err);
          }
        }
      });
      connected = true;
    } catch (error) {
      console.error('Kafka Consumer error, retrying in 5s...', error.message);
      await new Promise(res => setTimeout(res, 5000));
    }
  }
};

module.exports = {
  connectConsumer
};
