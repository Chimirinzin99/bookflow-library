// Backend/services/notificationService.js
const pool = require('../config/database');

// Create a notification for a user
const createNotification = async (userId, type, title, message, relatedId = null) => {
  try {
    const result = await pool.query(
      `INSERT INTO notifications (user_id, type, title, message, related_id, created_at) 
       VALUES ($1, $2, $3, $4, $5, NOW()) 
       RETURNING *`,
      [userId, type, title, message, relatedId]
    );
    return result.rows[0];
  } catch (error) {
    console.error('Create notification error:', error);
    return null;
  }
};

// Create welcome notification
const createWelcomeNotification = async (userId, name) => {
  return createNotification(
    userId,
    'welcome',
    '🎉 Welcome to BookFlow!',
    `Welcome ${name}! Start exploring our library and borrow your first book today.`
  );
};

// Create approval notification
const createApprovalNotification = async (userId, bookTitle, issueDate, dueDate) => {
  return createNotification(
    userId,
    'approval',
    '✅ Book Request Approved!',
    `Your request for "${bookTitle}" has been approved. Issued: ${issueDate} | Due: ${dueDate}`
  );
};

// Create rejection notification
const createRejectionNotification = async (userId, bookTitle, reason) => {
  return createNotification(
    userId,
    'rejection',
    '❌ Book Request Rejected',
    `Your request for "${bookTitle}" was rejected. Reason: ${reason || 'Not specified'}`
  );
};

// Create due reminder notification
const createDueReminderNotification = async (userId, bookTitle, dueDate, daysLeft) => {
  const isLastDay = daysLeft === 0;
  const title = isLastDay ? '⏰ LAST DAY to Return Book!' : `📚 Book Due in ${daysLeft} Days`;
  const message = isLastDay 
    ? `"${bookTitle}" is due TODAY! Please return it by the end of the day.`
    : `"${bookTitle}" is due in ${daysLeft} days on ${dueDate}. Please return it on time.`;
  
  return createNotification(userId, 'due_reminder', title, message);
};

// Create overdue notification
const createOverdueNotification = async (userId, bookTitle, dueDate, daysOverdue) => {
  return createNotification(
    userId,
    'overdue',
    '⚠️ OVERDUE Book Alert!',
    `"${bookTitle}" is ${daysOverdue} days overdue. Please return it immediately. Due was: ${dueDate}`
  );
};

// Create reservation available notification
const createReservationAvailableNotification = async (userId, bookTitle) => {
  return createNotification(
    userId,
    'reservation_available',
    '📖 Book Available!',
    `The book "${bookTitle}" you reserved is now available. Please collect it within 3 days.`
  );
};

module.exports = {
  createNotification,
  createWelcomeNotification,
  createApprovalNotification,
  createRejectionNotification,
  createDueReminderNotification,
  createOverdueNotification,
  createReservationAvailableNotification,
};