const express = require('express');
const pool = require('../config/database');
const Borrow = require('../models/Borrow');
const Book = require('../models/Book');
const { authMiddleware, isLibrarian } = require('../middleware/auth');
const router = express.Router();
const { sendApprovalEmail, sendRejectionEmail } = require('../services/emailService');
const { createApprovalNotification, createRejectionNotification } = require('../services/notificationService');

// Request to borrow (student)
router.post('/request', authMiddleware, async (req, res) => {
  try {
    const { bookId } = req.body;
    const userId = req.user.id;
    
    const book = await Book.getById(bookId);
    if (!book) {
      return res.status(404).json({ error: 'Book not found' });
    }
    if (book.status !== 'available') {
      return res.status(400).json({ error: 'Book not available - Already borrowed' });
    }
    
    // Check if user has pending or active request for this book
    const existingRequest = await pool.query(
      `SELECT status FROM borrows 
       WHERE user_id = $1 AND book_id = $2 
       AND status IN ('pending', 'active')
       LIMIT 1`,
      [userId, bookId]
    );
    
    if (existingRequest.rows.length > 0) {
      const existingStatus = existingRequest.rows[0].status;
      if (existingStatus === 'pending') {
        return res.status(400).json({ error: 'You already requested this book. Please wait for admin approval.' });
      } else if (existingStatus === 'active') {
        return res.status(400).json({ error: 'You are already borrowing this book. Return it first to request again.' });
      }
    }
    
    const request = await Borrow.request(userId, bookId);
    res.json({ message: 'Request sent successfully', request });
  } catch (error) {
    console.error('Request error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Check if user has pending or active request for a book
router.get('/check-status/:bookId', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const { bookId } = req.params;
    
    const result = await pool.query(
      `SELECT status FROM borrows 
       WHERE user_id = $1 AND book_id = $2 
       AND status IN ('pending', 'active')
       LIMIT 1`,
      [userId, bookId]
    );
    
    if (result.rows.length === 0) {
      return res.json({ status: null });
    }
    
    res.json({ status: result.rows[0].status });
  } catch (error) {
    console.error('Check status error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get pending requests (librarian)
router.get('/pending', authMiddleware, isLibrarian, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT 
        b.id, 
        b.user_id, 
        b.book_id, 
        b.status, 
        b.request_date,
        u.name as user_name, 
        bk.title as book_title, 
        bk.img,
        bk.author as book_author
       FROM borrows b 
       JOIN users u ON b.user_id = u.id 
       JOIN books bk ON b.book_id = bk.id 
       WHERE b.status = 'pending'
       ORDER BY b.request_date DESC`
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Pending requests error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Approve request (librarian) with custom dates
router.put('/approve/:id', authMiddleware, isLibrarian, async (req, res) => {
  try {
    const requestId = req.params.id;
    const librarianId = req.user.id;
    const { issueDate, dueDate } = req.body;
    
    // Get the borrow request details
    const borrowRequest = await pool.query(
      `SELECT b.*, bk.title as book_title, u.name as user_name, u.email as user_email, u.id as user_id
       FROM borrows b
       JOIN books bk ON b.book_id = bk.id
       JOIN users u ON b.user_id = u.id
       WHERE b.id = $1`,
      [requestId]
    );
    
    if (borrowRequest.rows.length === 0) {
      return res.status(404).json({ error: 'Request not found' });
    }
    
    const request = borrowRequest.rows[0];
    
    // Use provided dates or default dates
    const useIssueDate = issueDate || new Date().toISOString().split('T')[0];
    const useDueDate = dueDate || (() => {
      const defaultDue = new Date();
      defaultDue.setDate(defaultDue.getDate() + 14);
      return defaultDue.toISOString().split('T')[0];
    })();
    
    console.log('Approving with dates:', { useIssueDate, useDueDate });
    
    // Update borrow record
    await pool.query(
      `UPDATE borrows 
       SET status = 'active', issue_date = $1, due_date = $2, approved_by = $3 
       WHERE id = $4`,
      [useIssueDate, useDueDate, librarianId, requestId]
    );
    
    // Update book status
    await Book.updateStatus(request.book_id, 'borrowed', request.user_id);
    
    // Send email notification
    await sendApprovalEmail(request.user_email, request.user_name, request.book_title, useIssueDate, useDueDate);
    
    // Create in-app notification
    await createApprovalNotification(request.user_id, request.book_title, useIssueDate, useDueDate);
    
    res.json({ message: 'Request approved successfully', issue_date: useIssueDate, due_date: useDueDate });
  } catch (error) {
    console.error('Approve error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get my active borrows (student)
router.get('/my-borrows', authMiddleware, async (req, res) => {
  try {
    const borrows = await Borrow.getUserActiveBorrows(req.user.id);
    res.json(borrows);
  } catch (error) {
    console.error('My borrows error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Admin: Get all borrows (for stats)
router.get('/all', authMiddleware, isLibrarian, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT 
        b.*, 
        u.name as student_name, 
        bk.title as book_title,
        bk.img,
        b.issue_date,
        b.due_date
       FROM borrows b 
       JOIN users u ON b.user_id = u.id 
       JOIN books bk ON b.book_id = bk.id 
       ORDER BY b.created_at DESC`
    );
    res.json(result.rows);
  } catch (error) {
    console.error('All borrows error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get active borrows (for admin dashboard)
router.get('/active', authMiddleware, isLibrarian, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT 
        b.id,
        b.book_id,
        b.user_id,
        u.id as student_id,
        u.name as student_name,
        bk.title as book_name,
        bk.img,
        TO_CHAR(b.issue_date, 'YYYY-MM-DD') as issued_date,
        TO_CHAR(b.due_date, 'YYYY-MM-DD') as deadline,
        b.status
       FROM borrows b 
       JOIN users u ON b.user_id = u.id 
       JOIN books bk ON b.book_id = bk.id 
       WHERE b.status = 'active'
       ORDER BY b.issue_date DESC`
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Active borrows error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Return a book
router.put('/return/:id', authMiddleware, isLibrarian, async (req, res) => {
  try {
    const borrowId = req.params.id;
    
    const borrow = await pool.query(
      `SELECT b.*, u.name as student_name, bk.title as book_name 
       FROM borrows b 
       JOIN users u ON b.user_id = u.id 
       JOIN books bk ON b.book_id = bk.id 
       WHERE b.id = $1`,
      [borrowId]
    );
    
    if (borrow.rows.length === 0) {
      return res.status(404).json({ error: 'Borrow record not found' });
    }
    
    const borrowRecord = borrow.rows[0];
    
    await pool.query(
      `UPDATE borrows 
       SET status = 'returned', return_date = CURRENT_DATE 
       WHERE id = $1`,
      [borrowId]
    );
    
    await pool.query(
      'UPDATE books SET status = $1 WHERE id = $2',
      ['available', borrowRecord.book_id]
    );
    
    res.json({ 
      message: `✅ "${borrowRecord.book_name}" returned by ${borrowRecord.student_name}`,
      book_name: borrowRecord.book_name,
      student_name: borrowRecord.student_name
    });
  } catch (error) {
    console.error('Return error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Reject request (librarian)
router.put('/reject/:id', authMiddleware, isLibrarian, async (req, res) => {
  try {
    const { reason } = req.body;
    const requestId = req.params.id;
    
    const request = await pool.query(
      `SELECT b.*, u.name as user_name, u.email as user_email, bk.title as book_title
       FROM borrows b
       JOIN users u ON b.user_id = u.id
       JOIN books bk ON b.book_id = bk.id
       WHERE b.id = $1`,
      [requestId]
    );
    
    if (request.rows.length === 0) {
      return res.status(404).json({ error: 'Request not found' });
    }
    
    const borrowRequest = request.rows[0];
    
    // Update status to rejected
    await pool.query('UPDATE borrows SET status = $1 WHERE id = $2', ['rejected', requestId]);
    
    // Send rejection email
    await sendRejectionEmail(borrowRequest.user_email, borrowRequest.user_name, borrowRequest.book_title, reason || 'Not specified');
    
    // Create in-app notification
    await createRejectionNotification(borrowRequest.user_id, borrowRequest.book_title, reason);
    
    res.json({ message: 'Request rejected successfully' });
  } catch (error) {
    console.error('Reject error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;