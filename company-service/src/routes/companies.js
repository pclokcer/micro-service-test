const express = require('express');
const router = express.Router();
const { pool } = require('../db');

// GET all companies
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM companies ORDER BY id ASC');
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// GET single company with its users
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const companyResult = await pool.query('SELECT * FROM companies WHERE id = $1', [id]);
    
    if (companyResult.rows.length === 0) return res.status(404).json({ error: 'Company not found' });
    
    const usersResult = await pool.query('SELECT user_id, role, joined_at FROM company_has_users WHERE company_id = $1', [id]);
    
    const company = companyResult.rows[0];
    company.users = usersResult.rows;

    res.json(company);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// POST new company
router.post('/', async (req, res) => {
  try {
    const { name, address } = req.body;
    
    const result = await pool.query(
      'INSERT INTO companies (name, address) VALUES ($1, $2) RETURNING *',
      [name, address]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// DELETE user from company
router.delete('/:id/users/:userId', async (req, res) => {
  try {
    const { id, userId } = req.params;
    
    const result = await pool.query(
      'DELETE FROM company_has_users WHERE company_id = $1 AND user_id = $2 RETURNING *',
      [id, userId]
    );

    if (result.rows.length === 0) return res.status(404).json({ error: 'Relation not found' });

    res.json({ message: 'User removed from company' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
