const pool = require('../config/database');

const Book = {
  // Get all books
  getAll: async (category = null) => {
    let query = 'SELECT *, COALESCE(section, \'Uncategorized\') as section FROM books ORDER BY id DESC';
    let params = [];
    
    if (category && category !== 'All') {
      query = 'SELECT *, COALESCE(section, \'Uncategorized\') as section FROM books WHERE LOWER(section) = LOWER($1) ORDER BY id DESC';
      params = [category];
    }
    
    const result = await pool.query(query, params);
    return result.rows;
  },

  // Get book by id
  getById: async (id) => {
    const result = await pool.query('SELECT *, COALESCE(section, \'Uncategorized\') as section FROM books WHERE id = $1', [id]);
    return result.rows[0];
  },

  // Create book - FIXED to accept section
  create: async (title, author, img, description, year, section = 'Uncategorized') => {
    console.log("📝 Creating book with section:", section);
    
    const result = await pool.query(
      'INSERT INTO books (title, author, img, description, year, status, section) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [title, author, img, description, year, 'available', section]
    );
    
    console.log("✅ Book created. Section saved:", result.rows[0].section);
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

  // Delete book
  delete: async (id) => {
    const result = await pool.query('DELETE FROM books WHERE id = $1 RETURNING *', [id]);
    return result.rows[0];
  }
};

module.exports = Book;