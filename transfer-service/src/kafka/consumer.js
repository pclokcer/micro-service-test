const { Kafka } = require('kafkajs');
const { pool } = require('../db');

const kafka = new Kafka({
  clientId: 'transfer-service',
  brokers: [process.env.KAFKA_BROKER || 'localhost:9092']
});

const consumer = kafka.consumer({ groupId: 'transfer-service-group' });

const connectConsumer = async () => {
  let connected = false;
  while (!connected) {
    try {
      await consumer.connect();
      console.log('Kafka Consumer connected (Transfer)');

      await consumer.subscribe({ topic: 'transfer-events', fromBeginning: true });

      await consumer.run({
        eachMessage: async ({ topic, partition, message }) => {
          try {
            const payload = JSON.parse(message.value.toString());
            console.log(`Received event: ${payload.type}`, payload.data);

            if (payload.type === 'transfer.success') {
              const { transferId } = payload.data;
              await pool.query('UPDATE transfers SET status = $1 WHERE id = $2', ['COMPLETED', transferId]);
              console.log(`Transfer ${transferId} status updated to COMPLETED`);
            } else if (payload.type === 'transfer.failed') {
              const { transferId } = payload.data;
              await pool.query('UPDATE transfers SET status = $1 WHERE id = $2', ['FAILED', transferId]);
              console.log(`Transfer ${transferId} status updated to FAILED (Rollback)`);
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
