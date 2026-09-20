const express = require('express');
const router = express.Router();
const { pool } = require('../db');
const { publishEvent } = require('../kafka/producer');

// GET all transfers
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM transfers ORDER BY id ASC');
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// POST new transfer
router.post('/', async (req, res) => {
  try {
    const { from_wallet_id, to_wallet_id, amount } = req.body;
    
    // 1. Create transfer record as PENDING
    const result = await pool.query(
      'INSERT INTO transfers (from_wallet_id, to_wallet_id, amount, status) VALUES ($1, $2, $3, $4) RETURNING *',
      [from_wallet_id, to_wallet_id, amount, 'PENDING']
    );
    const newTransfer = result.rows[0];

    // 2. Publish transfer.initiated event to start the Saga
    await publishEvent('wallet-events', 'transfer.initiated', {
      transferId: newTransfer.id,
      fromWallet: newTransfer.from_wallet_id,
      toWallet: newTransfer.to_wallet_id,
      amount: newTransfer.amount
    });
    console.log(`Transfer ${newTransfer.id} initiated and event published`);

    res.status(201).json(newTransfer);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
