const express = require('express');
const router = express.Router();
const { pool } = require('../db');
const { publishUserEvent } = require('../kafka/producer');

const KAFKA_TOPIC = 'user-events';

// GET all users
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM users ORDER BY id ASC');
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// GET single user
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'User not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// POST new user
router.post('/', async (req, res) => {
  try {
    const { name, email, companyId } = req.body;
    
    // 1. Create user in DB
    const result = await pool.query(
      'INSERT INTO users (name, email) VALUES ($1, $2) RETURNING *',
      [name, email]
    );
    const newUser = result.rows[0];

    // 2. Publish event
    await publishUserEvent(KAFKA_TOPIC, 'user.created', {
      userId: newUser.id,
      name: newUser.name,
      email: newUser.email,
      companyId: companyId // Can be undefined/null, which is fine
    });

    res.status(201).json(newUser);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// PUT update user
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email } = req.body;

    const result = await pool.query(
      'UPDATE users SET name = $1, email = $2, updated_at = NOW() WHERE id = $3 RETURNING *',
      [name, email, id]
    );

    if (result.rows.length === 0) return res.status(404).json({ error: 'User not found' });
    const updatedUser = result.rows[0];

    // Publish event
    await publishUserEvent(KAFKA_TOPIC, 'user.updated', {
      userId: updatedUser.id,
      name: updatedUser.name,
      email: updatedUser.email
    });

    res.json(updatedUser);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// DELETE user
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query('DELETE FROM users WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'User not found' });

    // Publish event
    await publishUserEvent(KAFKA_TOPIC, 'user.deleted', {
      userId: id
    });

    res.json({ message: 'User deleted' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
