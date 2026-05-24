const express = require('express');
const pool = require('../config/database');
const { authMiddleware, isLibrarian } = require('../middleware/auth');
const router = express.Router();

// Get active quote (public - no auth needed)
router.get('/active', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, quote_text, author FROM quotes WHERE is_active = true ORDER BY updated_at DESC LIMIT 1'
    );
    
    if (result.rows.length === 0) {
      // Return default quote if none exists
      return res.json({ 
        quote_text: 'There is more treasure in books than in all the pirate\'s loot on Treasure Island.',
        author: 'Walt Disney'
      });
    }
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all quotes (admin only)
router.get('/all', authMiddleware, isLibrarian, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, quote_text, author, is_active, updated_at FROM quotes ORDER BY updated_at DESC'
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add new quote (admin only)
router.post('/', authMiddleware, isLibrarian, async (req, res) => {
  try {
    const { quote_text, author } = req.body;
    const userId = req.user.id;
    
    // Deactivate all current quotes
    await pool.query('UPDATE quotes SET is_active = false');
    
    // Insert new quote
    const result = await pool.query(
      'INSERT INTO quotes (quote_text, author, is_active, updated_by) VALUES ($1, $2, true, $3) RETURNING *',
      [quote_text, author, userId]
    );
    
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update existing quote (admin only)
router.put('/:id', authMiddleware, isLibrarian, async (req, res) => {
  try {
    const { id } = req.params;
    const { quote_text, author, is_active } = req.body;
    const userId = req.user.id;
    
    const result = await pool.query(
      'UPDATE quotes SET quote_text = $1, author = $2, is_active = $3, updated_by = $4, updated_at = CURRENT_TIMESTAMP WHERE id = $5 RETURNING *',
      [quote_text, author, is_active, userId, id]
    );
    
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete quote (admin only)
router.delete('/:id', authMiddleware, isLibrarian, async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM quotes WHERE id = $1', [id]);
    res.json({ message: 'Quote deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;