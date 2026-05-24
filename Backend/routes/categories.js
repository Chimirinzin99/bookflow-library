const express = require('express');
const pool = require('../config/database');
const { authMiddleware, isLibrarian } = require('../middleware/auth');
const router = express.Router();

// Get all categories (public)
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT name FROM categories ORDER BY name');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add new category (admin only)
router.post('/', authMiddleware, isLibrarian, async (req, res) => {
  try {
    const { name } = req.body;
    const result = await pool.query(
      'INSERT INTO categories (name) VALUES ($1) ON CONFLICT (name) DO NOTHING RETURNING *',
      [name]
    );
    res.json(result.rows[0] || { message: 'Category already exists' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete category (admin only)
router.delete('/:name', authMiddleware, isLibrarian, async (req, res) => {
  try {
    const { name } = req.params;
    await pool.query('DELETE FROM categories WHERE name = $1', [name]);
    res.json({ message: 'Category deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;