const express = require('express');
const pool = require('../config/database');
const { authMiddleware } = require('../middleware/auth');
const router = express.Router();

// Get user's wishlist
router.get('/', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    
    const result = await pool.query(
      `SELECT w.*, b.title, b.author, b.img, b.year, b.description 
       FROM wishlist w
       JOIN books b ON w.book_id = b.id
       WHERE w.user_id = $1
       ORDER BY w.added_at DESC`,
      [userId]
    );
    
    res.json(result.rows);
  } catch (error) {
    console.error('Get wishlist error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Add to wishlist
router.post('/', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const { bookId } = req.body;
    
    // Check if already in wishlist
    const existing = await pool.query(
      'SELECT * FROM wishlist WHERE user_id = $1 AND book_id = $2',
      [userId, bookId]
    );
    
    if (existing.rows.length > 0) {
      return res.status(400).json({ error: 'Book already in wishlist' });
    }
    
    await pool.query(
      'INSERT INTO wishlist (user_id, book_id) VALUES ($1, $2)',
      [userId, bookId]
    );
    
    res.json({ message: 'Added to wishlist' });
  } catch (error) {
    console.error('Add to wishlist error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Remove from wishlist
router.delete('/:bookId', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const { bookId } = req.params;
    
    await pool.query(
      'DELETE FROM wishlist WHERE user_id = $1 AND book_id = $2',
      [userId, bookId]
    );
    
    res.json({ message: 'Removed from wishlist' });
  } catch (error) {
    console.error('Remove from wishlist error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Clear entire wishlist
router.delete('/', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    await pool.query('DELETE FROM wishlist WHERE user_id = $1', [userId]);
    res.json({ message: 'Wishlist cleared' });
  } catch (error) {
    console.error('Clear wishlist error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;