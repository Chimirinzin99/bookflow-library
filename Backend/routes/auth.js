const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const pool = require('../config/database');
const { sendWelcomeEmail, sendResetEmail } = require('../services/emailService');
const { createWelcomeNotification } = require('../services/notificationService');
const { authMiddleware } = require('../middleware/auth');
const router = express.Router();

// Password strength validator
const validatePassword = (password) => {
  const errors = [];
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Password must contain at least one special character (!@#$%^&*)');
  }
  
  return errors;
};

// Rate limiting (simple in-memory store)
const loginAttempts = new Map();
const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_TIME = 15 * 60 * 1000; // 15 minutes

// Register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role, adminCode } = req.body;
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }
    
    // Validate password strength
    const passwordErrors = validatePassword(password);
    if (passwordErrors.length > 0) {
      return res.status(400).json({ 
        error: 'Password validation failed', 
        details: passwordErrors 
      });
    }
    
    // Check if user exists
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({ error: 'Email already exists' });
    }
    
    // Determine role (admin code required for librarian)
    let finalRole = 'student';
    if (role === 'librarian') {
      const ADMIN_SECRET_CODE = process.env.ADMIN_SECRET_CODE || 'ADMIN123';
      if (adminCode === ADMIN_SECRET_CODE) {
        finalRole = 'librarian';
      } else {
        return res.status(403).json({ error: 'Invalid admin code' });
      }
    }
    
    // Create user
    const user = await User.create(name, email, password, finalRole);
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role }, 
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    // Send welcome email (don't await to avoid blocking)
    sendWelcomeEmail(email, name).catch(console.error);
    createWelcomeNotification(user.id, name).catch(console.error);
    
    res.json({ 
      user: { id: user.id, name: user.name, email: user.email, role: user.role }, 
      token 
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Login with rate limiting
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const ip = req.ip || req.connection.remoteAddress;
    
    // Check rate limiting
    const attempts = loginAttempts.get(ip) || { count: 0, lockUntil: null };
    
    if (attempts.lockUntil && attempts.lockUntil > Date.now()) {
      const remainingMinutes = Math.ceil((attempts.lockUntil - Date.now()) / 60000);
      return res.status(429).json({ 
        error: `Too many attempts. Try again in ${remainingMinutes} minutes.` 
      });
    }
    
    const user = await User.findByEmail(email);
    if (!user) {
      // Record failed attempt
      attempts.count++;
      if (attempts.count >= MAX_LOGIN_ATTEMPTS) {
        attempts.lockUntil = Date.now() + LOCKOUT_TIME;
      }
      loginAttempts.set(ip, attempts);
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    
    const isValid = await User.comparePassword(password, user.password);
    if (!isValid) {
      // Record failed attempt
      attempts.count++;
      if (attempts.count >= MAX_LOGIN_ATTEMPTS) {
        attempts.lockUntil = Date.now() + LOCKOUT_TIME;
      }
      loginAttempts.set(ip, attempts);
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    
    // Reset attempts on successful login
    loginAttempts.delete(ip);
    
    // Update last login
    await pool.query('UPDATE users SET last_login = NOW() WHERE id = $1', [user.id]);
    
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role }, 
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    res.json({ 
      user: { 
        id: user.id, 
        name: user.name, 
        email: user.email, 
        role: user.role,
        profile_picture: user.profile_picture || null
      }, 
      token 
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ========== ADD THESE ROUTES ==========

// Forgot password - Request reset link
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    
    const user = await User.findByEmail(email);
    if (!user) {
      // Don't reveal if user exists for security
      return res.json({ message: 'If an account exists, a reset link will be sent' });
    }
    
    // Generate reset token (expires in 1 hour)
    const resetToken = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
    
    // Store reset token in database
    await pool.query(
      'UPDATE users SET reset_token = $1, reset_token_expires = NOW() + INTERVAL \'1 hour\' WHERE id = $2',
      [resetToken, user.id]
    );
    
    // Send reset email
    await sendResetEmail(email, user.name, resetToken);
    
    res.json({ message: 'If an account exists, a reset link will be sent' });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Reset password - Set new password
router.post('/reset-password', async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    
    // Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(400).json({ error: 'Invalid or expired token' });
    }
    
    // Check if token exists in database and not expired
    const user = await pool.query(
      'SELECT * FROM users WHERE id = $1 AND reset_token = $2 AND reset_token_expires > NOW()',
      [decoded.id, token]
    );
    
    if (user.rows.length === 0) {
      return res.status(400).json({ error: 'Invalid or expired token' });
    }
    
    // Validate new password strength
    const passwordErrors = validatePassword(newPassword);
    if (passwordErrors.length > 0) {
      return res.status(400).json({ 
        error: 'Password validation failed', 
        details: passwordErrors 
      });
    }
    
    // Hash and update password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await pool.query(
      'UPDATE users SET password = $1, reset_token = NULL, reset_token_expires = NULL WHERE id = $2',
      [hashedPassword, decoded.id]
    );
    
    res.json({ message: 'Password reset successful. You can now login.' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Change password (authenticated users)
router.post('/change-password', authMiddleware, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const isValid = await User.comparePassword(currentPassword, user.password);
    if (!isValid) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }
    
    const passwordErrors = validatePassword(newPassword);
    if (passwordErrors.length > 0) {
      return res.status(400).json({ 
        error: 'Password validation failed', 
        details: passwordErrors 
      });
    }
    
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await pool.query('UPDATE users SET password = $1 WHERE id = $2', [hashedPassword, userId]);
    
    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;