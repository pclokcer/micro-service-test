const express = require('express');
const router = express.Router();
const { pool } = require('../db');
const { publishEvent } = require('../kafka/producer');

// GET all orders
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM orders ORDER BY id ASC');
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// GET order by id
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM orders WHERE id = $1', [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Order not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// POST new order
router.post('/', async (req, res) => {
  try {
    const { amount } = req.body;
    
    // 1. Create order as PENDING
    const result = await pool.query(
      'INSERT INTO orders (amount, status) VALUES ($1, $2) RETURNING *',
      [amount, 'PENDING']
    );
    const newOrder = result.rows[0];

    // 2. Publish order.created event to start the Saga
    await publishEvent('order-events', 'order.created', {
      orderId: newOrder.id,
      amount: newOrder.amount
    });
    console.log(`Order ${newOrder.id} created and event published`);

    res.status(201).json(newOrder);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
