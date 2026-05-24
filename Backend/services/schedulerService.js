// Backend/services/schedulerService.js
const cron = require('node-cron');
const pool = require('../config/database');
const { sendDueReminderEmail, sendOverdueEmail } = require('./emailService');
const { createDueReminderNotification, createOverdueNotification } = require('./notificationService');

// Run every day at 9:00 AM
const startScheduler = () => {
  cron.schedule('0 9 * * *', async () => {
    console.log('🕐 Running due date check scheduler...', new Date().toLocaleString());
    
    await checkDueDates();
    await checkOverdueBooks();
  });
  
  console.log('✅ Due date reminder scheduler started (runs daily at 9:00 AM)');
};

// Check for books due in 3 days, 1 day, and today
const checkDueDates = async () => {
  try {
    const today = new Date();
    const threeDaysLater = new Date();
    threeDaysLater.setDate(today.getDate() + 3);
    
    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);
    
    // Format dates for comparison
    const todayStr = today.toISOString().split('T')[0];
    const tomorrowStr = tomorrow.toISOString().split('T')[0];
    const threeDaysStr = threeDaysLater.toISOString().split('T')[0];
    
    // Get all active borrows with user and book details
    const result = await pool.query(
      `SELECT 
        b.id,
        b.due_date,
        b.user_id,
        u.name as user_name,
        u.email as user_email,
        bk.title as book_title
       FROM borrows b
       JOIN users u ON b.user_id = u.id
       JOIN books bk ON b.book_id = bk.id
       WHERE b.status = 'active'
       AND b.due_date IS NOT NULL`
    );
    
    for (const borrow of result.rows) {
      const dueDateStr = new Date(borrow.due_date).toISOString().split('T')[0];
      
      // Calculate days left
      const dueDate = new Date(borrow.due_date);
      const daysLeft = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));
      
      // Due in 3 days
      if (dueDateStr === threeDaysStr) {
        console.log(`📧 Sending 3-day reminder to ${borrow.user_email} for "${borrow.book_title}"`);
        
        // Send email
        await sendDueReminderEmail(borrow.user_email, borrow.user_name, borrow.book_title, dueDateStr, 3);
        
        // Create in-app notification
        await createDueReminderNotification(borrow.user_id, borrow.book_title, dueDateStr, 3);
      }
      
      // Due tomorrow (1 day left)
      if (dueDateStr === tomorrowStr) {
        console.log(`📧 Sending 1-day reminder to ${borrow.user_email} for "${borrow.book_title}"`);
        
        await sendDueReminderEmail(borrow.user_email, borrow.user_name, borrow.book_title, dueDateStr, 1);
        await createDueReminderNotification(borrow.user_id, borrow.book_title, dueDateStr, 1);
      }
      
      // Due today
      if (dueDateStr === todayStr) {
        console.log(`📧 Sending last day reminder to ${borrow.user_email} for "${borrow.book_title}"`);
        
        await sendDueReminderEmail(borrow.user_email, borrow.user_name, borrow.book_title, dueDateStr, 0);
        await createDueReminderNotification(borrow.user_id, borrow.book_title, dueDateStr, 0);
      }
    }
    
    console.log('✅ Due date check completed');
  } catch (error) {
    console.error('Error checking due dates:', error);
  }
};

// Check for overdue books
const checkOverdueBooks = async () => {
  try {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    
    // Get all overdue active borrows
    const result = await pool.query(
      `SELECT 
        b.id,
        b.due_date,
        b.user_id,
        u.name as user_name,
        u.email as user_email,
        bk.title as book_title
       FROM borrows b
       JOIN users u ON b.user_id = u.id
       JOIN books bk ON b.book_id = bk.id
       WHERE b.status = 'active'
       AND b.due_date < $1`,
      [today]
    );
    
    for (const borrow of result.rows) {
      const dueDate = new Date(borrow.due_date);
      const daysOverdue = Math.ceil((today - dueDate) / (1000 * 60 * 60 * 24));
      
      console.log(`⚠️ Overdue book: "${borrow.book_title}" borrowed by ${borrow.user_email} (${daysOverdue} days overdue)`);
      
      // Send overdue email
      await sendOverdueEmail(borrow.user_email, borrow.user_name, borrow.book_title, borrow.due_date, daysOverdue);
      
      // Create in-app notification
      await createOverdueNotification(borrow.user_id, borrow.book_title, borrow.due_date, daysOverdue);
    }
    
    if (result.rows.length > 0) {
      console.log(`⚠️ Sent ${result.rows.length} overdue notification(s)`);
    }
  } catch (error) {
    console.error('Error checking overdue books:', error);
  }
};

// Manual trigger function (for testing)
const runManualCheck = async () => {
  console.log('🔄 Running manual due date check...');
  await checkDueDates();
  await checkOverdueBooks();
  console.log('✅ Manual check completed');
};

module.exports = { startScheduler, runManualCheck };