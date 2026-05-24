// In routes/borrow.js or routes/admin.js
router.get('/pending', authMiddleware, isLibrarian, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT b.*, u.name as user_name, bk.title as book_title, bk.img 
       FROM borrows b 
       JOIN users u ON b.user_id = u.id 
       JOIN books bk ON b.book_id = bk.id 
       WHERE b.status = 'pending'`
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});