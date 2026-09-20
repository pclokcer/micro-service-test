const { Kafka, Partitioners } = require('kafkajs');

const kafka = new Kafka({
  clientId: 'payment-service',
  brokers: [process.env.KAFKA_BROKER || 'localhost:9092']
});

const producer = kafka.producer({
  createPartitioner: Partitioners.LegacyPartitioner
});

const connectProducer = async () => {
  try {
    await producer.connect();
    console.log('Kafka Producer connected');
  } catch (error) {
    console.error('Kafka Producer connection error:', error);
  }
};

const disconnectProducer = async () => {
  await producer.disconnect();
};

const publishEvent = async (topic, eventType, data) => {
  try {
    await producer.send({
      topic,
      messages: [
        {
          key: String(data.orderId || 'default'),
          value: JSON.stringify({ type: eventType, data })
        }
      ]
    });
    console.log(`Published ${eventType} to ${topic}`);
  } catch (error) {
    console.error('Error publishing event:', error);
  }
};

module.exports = {
  connectProducer,
  disconnectProducer,
  publishEvent
};
