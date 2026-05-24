const express = require('express');
const Book = require('../models/Book');
const { authMiddleware, isLibrarian } = require('../middleware/auth');
const router = express.Router();

// Get all books (anyone)
router.get('/', async (req, res) => {
  try {
    const { category } = req.query;
    const books = await Book.getAll(category);
    res.json(books);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single book
router.get('/:id', async (req, res) => {
  try {
    const book = await Book.getById(req.params.id);
    if (!book) return res.status(404).json({ error: 'Book not found' });
    res.json(book);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add book (librarian only)
router.post('/', authMiddleware, isLibrarian, async (req, res) => {
  try {
    const { title, author, img, description, year, category } = req.body;
    const book = await Book.create(title, author, img, description, year, category);
    res.json(book);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete book (librarian only) - ADD THIS
router.delete('/:id', authMiddleware, isLibrarian, async (req, res) => {
  try {
    const bookId = req.params.id;
    
    const book = await Book.getById(bookId);
    if (!book) {
      return res.status(404).json({ error: 'Book not found' });
    }
    
    await Book.delete(bookId);
    res.json({ message: 'Book deleted successfully' });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;