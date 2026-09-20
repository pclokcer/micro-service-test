const { Kafka } = require('kafkajs');
const { publishEvent } = require('./producer');

const kafka = new Kafka({
  clientId: 'payment-service',
  brokers: [process.env.KAFKA_BROKER || 'localhost:9092']
});

const consumer = kafka.consumer({ groupId: 'payment-service-group' });

const connectConsumer = async () => {
  let connected = false;
  while (!connected) {
    try {
      await consumer.connect();
      console.log('Kafka Consumer connected');

      await consumer.subscribe({ topic: 'order-events', fromBeginning: true });

      await consumer.run({
        eachMessage: async ({ topic, partition, message }) => {
          try {
            const payload = JSON.parse(message.value.toString());
            console.log(`Received event: ${payload.type}`, payload.data);

            if (payload.type === 'order.created') {
              const { orderId, amount } = payload.data;
              
              // Simulate payment processing
              console.log(`Processing payment for Order ${orderId} with amount ${amount}...`);
              
              if (amount < 100) {
                console.log(`Payment successful for Order ${orderId}`);
                await publishEvent('payment-events', 'payment.success', { orderId });
              } else {
                console.log(`Payment failed for Order ${orderId} - Insufficient Funds`);
                await publishEvent('payment-events', 'payment.failed', { orderId, reason: 'Insufficient Funds' });
              }
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
