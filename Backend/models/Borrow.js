const pool = require('../config/database');

const Borrow = {
  // Create borrow request
  request: async (userId, bookId) => {
    const result = await pool.query(
      'INSERT INTO borrows (user_id, book_id, status) VALUES ($1, $2, $3) RETURNING *',
      [userId, bookId, 'pending']
    );
    return result.rows[0];
  },

  // Get pending requests (for librarian)
  getPendingRequests: async () => {
    const result = await pool.query(
      `SELECT b.*, u.name as user_name, bk.title as book_title 
       FROM borrows b 
       JOIN users u ON b.user_id = u.id 
       JOIN books bk ON b.book_id = bk.id 
       WHERE b.status = 'pending'`
    );
    return result.rows;
  },

  // Approve request
  approve: async (id, librarianId, dueDays = 14) => {
    const issueDate = new Date();
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + dueDays);
    
    const result = await pool.query(
      `UPDATE borrows 
       SET status = 'active', issue_date = $1, due_date = $2, approved_by = $3 
       WHERE id = $4 RETURNING *`,
      [issueDate, dueDate, librarianId, id]
    );
    return result.rows[0];
  },

  // Get user's active borrows
  getUserActiveBorrows: async (userId) => {
    const result = await pool.query(
      `SELECT b.*, bk.title, bk.author, bk.img 
       FROM borrows b 
       JOIN books bk ON b.book_id = bk.id 
       WHERE b.user_id = $1 AND b.status = 'active'`,
      [userId]
    );
    return result.rows;
  }
};

module.exports = Borrow;