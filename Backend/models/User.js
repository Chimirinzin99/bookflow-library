const pool = require('../config/database');
const bcrypt = require('bcryptjs');

const User = {
  create: async (name, email, password, role = 'student') => {
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await pool.query(
      'INSERT INTO users (name, email, password, role, created_at) VALUES ($1, $2, $3, $4, NOW()) RETURNING id, name, email, role',
      [name, email, hashedPassword, role]
    );
    return result.rows[0];
  },

  findByEmail: async (email) => {
  const result = await pool.query(
    'SELECT id, name, email, password, role, profile_picture, last_login FROM users WHERE email = $1',
    [email]
  );
  return result.rows[0];
},
  findById: async (id) => {
  const result = await pool.query(
    'SELECT id, name, email, role, profile_picture, created_at, last_login FROM users WHERE id = $1',
    [id]
  );
  return result.rows[0];
},

  comparePassword: async (plainPassword, hashedPassword) => {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }
};

module.exports = User;