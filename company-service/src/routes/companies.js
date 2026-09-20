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

// GET single company with its users (via HTTP API Composition)
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const companyResult = await pool.query('SELECT * FROM companies WHERE id = $1', [id]);
    
    if (companyResult.rows.length === 0) return res.status(404).json({ error: 'Company not found' });
    
    const usersResult = await pool.query('SELECT user_id, role, joined_at FROM company_has_users WHERE company_id = $1', [id]);
    
    const company = companyResult.rows[0];
    
    // Fetch full user details from user-service
    const usersWithDetails = await Promise.all(usersResult.rows.map(async (u) => {
      try {
        // user-service container is reachable as "user-service" within docker network
        const userRes = await fetch(`http://user-service:3001/users/${u.user_id}`);
        if (userRes.ok) {
          const userData = await userRes.json();
          return { ...u, name: userData.name, email: userData.email };
        }
        return { ...u, name: 'Unknown', email: 'Unknown' };
      } catch (error) {
        console.error(`Failed to fetch user ${u.user_id}:`, error.message);
        return { ...u, name: 'Unknown', email: 'Unknown' };
      }
    }));

    company.users = usersWithDetails;

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
