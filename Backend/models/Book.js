const pool = require('../config/database');

const Book = {
  // Get all books
 // Update the getAll method to include section
getAll: async () => {
  const result = await pool.query('SELECT *, COALESCE(section, \'Uncategorized\') as section FROM books ORDER BY id DESC');
  return result.rows;
},

  // Get book by id
  getById: async (id) => {
    const result = await pool.query('SELECT * FROM books WHERE id = $1', [id]);
    return result.rows[0];
  },

  // Create book
 create: async (title, author, img, description, year, section = 'Uncategorized') => {
  const result = await pool.query(
    'INSERT INTO books (title, author, img, description, year, status, section) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
    [title, author, img, description, year, 'available', section]
  );
  return result.rows[0];
},

  // Update book status
  updateStatus: async (id, status, borrowerId = null) => {
    const result = await pool.query(
      'UPDATE books SET status = $1, current_borrower_id = $2 WHERE id = $3 RETURNING *',
      [status, borrowerId, id]
    );
    return result.rows[0];
  },

  // Delete book - ADD THIS
  delete: async (id) => {
    const result = await pool.query('DELETE FROM books WHERE id = $1 RETURNING *', [id]);
    return result.rows[0];
  }
};

module.exports = Book;