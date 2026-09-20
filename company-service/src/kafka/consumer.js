const { Kafka } = require('kafkajs');
const { pool } = require('../db');

const kafka = new Kafka({
  clientId: 'company-service',
  brokers: [process.env.KAFKA_BROKER || 'localhost:9092']
});

const consumer = kafka.consumer({ groupId: 'company-service-group' });

const connectConsumer = async () => {
  let connected = false;
  while (!connected) {
    try {
      await consumer.connect();
      console.log('Kafka Consumer connected');

      await consumer.subscribe({ topic: 'user-events', fromBeginning: true });

      await consumer.run({
        eachMessage: async ({ topic, partition, message }) => {
          try {
            const payload = JSON.parse(message.value.toString());
            console.log(`Received event: ${payload.type}`, payload.data);

            if (payload.type === 'user.created') {
              const { userId, companyId } = payload.data;
              if (companyId) {
                await pool.query(
                  'INSERT INTO company_has_users (company_id, user_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
                  [companyId, userId]
                );
                console.log(`User ${userId} assigned to company ${companyId}`);
              }
            } else if (payload.type === 'user.deleted') {
              const { userId } = payload.data;
              await pool.query('DELETE FROM company_has_users WHERE user_id = $1', [userId]);
              console.log(`User ${userId} removed from all companies`);
            }

          } catch (err) {
            console.error('Error processing message:', err);
          }
        }
      });
      connected = true; // successfully connected and subscribed
    } catch (error) {
      console.error('Kafka Consumer error, retrying in 5s...', error.message);
      await new Promise(res => setTimeout(res, 5000));
    }
  }
};

module.exports = {
  connectConsumer
};
