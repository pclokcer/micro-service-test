const { Kafka } = require('kafkajs');
const { pool } = require('../db');
const { publishEvent } = require('./producer');

const kafka = new Kafka({
  clientId: 'wallet-service',
  brokers: [process.env.KAFKA_BROKER || 'localhost:9092']
});

const consumer = kafka.consumer({ groupId: 'wallet-service-group' });

const connectConsumer = async () => {
  let connected = false;
  while (!connected) {
    try {
      await consumer.connect();
      console.log('Kafka Consumer connected (Wallet)');

      await consumer.subscribe({ topic: 'wallet-events', fromBeginning: true });

      await consumer.run({
        eachMessage: async ({ topic, partition, message }) => {
          try {
            const payload = JSON.parse(message.value.toString());
            console.log(`Received event: ${payload.type}`, payload.data);

            if (payload.type === 'transfer.initiated') {
              const { transferId, fromWallet, toWallet, amount } = payload.data;
              
              const client = await pool.connect();
              try {
                // LOCAL DB TRANSACTION BEGINS
                await client.query('BEGIN');

                // 1. Check sender balance and lock the row (FOR UPDATE)
                const senderRes = await client.query('SELECT balance FROM wallets WHERE id = $1 FOR UPDATE', [fromWallet]);
                if (senderRes.rows.length === 0) {
                  throw new Error('Sender wallet not found');
                }
                const senderBalance = parseFloat(senderRes.rows[0].balance);
                
                if (senderBalance < amount) {
                  throw new Error('Insufficient balance');
                }

                // 2. Deduct from sender
                await client.query('UPDATE wallets SET balance = balance - $1 WHERE id = $2', [amount, fromWallet]);

                // 3. Check and update receiver
                const receiverRes = await client.query('SELECT id FROM wallets WHERE id = $1 FOR UPDATE', [toWallet]);
                if (receiverRes.rows.length === 0) {
                  throw new Error('Receiver wallet not found');
                }
                await client.query('UPDATE wallets SET balance = balance + $1 WHERE id = $2', [amount, toWallet]);

                // LOCAL DB TRANSACTION COMMITS
                await client.query('COMMIT');
                console.log(`Local DB Transaction Successful. Deducted ${amount} from ${fromWallet} to ${toWallet}`);

                // Publish success event for the distributed Saga
                await publishEvent('transfer-events', 'transfer.success', { transferId });

              } catch (err) {
                // LOCAL DB TRANSACTION ROLLBACK
                await client.query('ROLLBACK');
                console.error(`Local DB Transaction Failed, Rolling back: ${err.message}`);
                
                // Publish failed event for the distributed Saga Rollback
                await publishEvent('transfer-events', 'transfer.failed', { transferId, reason: err.message });
              } finally {
                client.release();
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
