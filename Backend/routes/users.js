const express = require('express');
const bcrypt = require('bcryptjs');
const pool = require('../config/database');
const { authMiddleware } = require('../middleware/auth');
const router = express.Router();

// Get all users (admin only)
router.get('/', authMiddleware, async (req, res) => {
  try {
    // Only librarians can see all users
    if (req.user.role !== 'librarian') {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    const result = await pool.query(
      'SELECT id, name, email, role, created_at as joined FROM users ORDER BY created_at DESC'
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update user profile (own profile)
router.put('/profile', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, profile_picture } = req.body;
    
    let query = 'UPDATE users SET ';
    const updates = [];
    const values = [];
    let idx = 1;
    
    if (name) {
      updates.push(`name = $${idx++}`);
      values.push(name);
    }
    
    if (profile_picture) {
      updates.push(`profile_picture = $${idx++}`);
      values.push(profile_picture);
    }
    
    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }
    
    query += updates.join(', ') + ` WHERE id = $${idx} RETURNING id, name, email, role, profile_picture`;
    values.push(userId);
    
    const result = await pool.query(query, values);
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete user account with password verification
router.delete('/account', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const { password } = req.body;
    
    // Get user with password
    const user = await pool.query('SELECT password FROM users WHERE id = $1', [userId]);
    
    if (user.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Verify password
    const isValid = await bcrypt.compare(password, user.rows[0].password);
    if (!isValid) {
      return res.status(401).json({ error: 'Incorrect password' });
    }
    
    // Check if user has active borrows
    const activeBorrows = await pool.query(
      'SELECT * FROM borrows WHERE user_id = $1 AND status IN ($2, $3)',
      [userId, 'pending', 'active']
    );
    
    if (activeBorrows.rows.length > 0) {
      return res.status(400).json({ 
        error: 'Cannot delete account. You have active or pending book borrows. Please return all books first.' 
      });
    }
    
    // Delete user (cascade will handle related records)
    await pool.query('DELETE FROM users WHERE id = $1', [userId]);
    
    res.json({ message: 'Account deleted successfully' });
  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;