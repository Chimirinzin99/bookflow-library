// Backend/services/emailService.js
const nodemailer = require('nodemailer');

// Create transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Welcome email on registration
const sendWelcomeEmail = async (email, name) => {
  const mailOptions = {
    from: `"BookFlow Library" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: '📚 Welcome to BookFlow Library!',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #0f766e, #14b8a6); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0;">📚 BookFlow</h1>
        </div>
        <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e5e7eb;">
          <h2 style="color: #1f2937;">Hello ${name}!</h2>
          <p style="color: #4b5563; line-height: 1.6;">Welcome to BookFlow Library Management System. You can now browse, request, and borrow books from our library.</p>
          
          <div style="background: #e6f7f5; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0; color: #0f766e;"><strong>📖 Your Account Details:</strong></p>
            <p style="margin: 5px 0; color: #4b5563;">Email: ${email}</p>
            <p style="margin: 5px 0; color: #4b5563;">Role: Student</p>
          </div>
          
          <a href="http://localhost:3000" style="display: inline-block; background: #0f766e; color: white; padding: 12px 25px; text-decoration: none; border-radius: 8px; margin-top: 10px;">Start Exploring →</a>
          
          <hr style="margin: 25px 0; border-color: #e5e7eb;">
          <p style="color: #9ca3af; font-size: 12px; text-align: center;">© 2026 BookFlow Library. All rights reserved.</p>
        </div>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`📧 Welcome email sent to ${email}`);
  } catch (error) {
    console.error('Welcome email error:', error);
  }
};

// Request approved email
const sendApprovalEmail = async (email, name, bookTitle, issueDate, dueDate) => {
  const mailOptions = {
    from: `"BookFlow Library" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: '✅ Book Request Approved!',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #0f766e, #14b8a6); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0;">✅ Request Approved!</h1>
        </div>
        <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e5e7eb;">
          <h2 style="color: #1f2937;">Dear ${name},</h2>
          <p style="color: #4b5563; line-height: 1.6;">Your request for <strong>"${bookTitle}"</strong> has been approved by the librarian.</p>
          
          <div style="background: #e6f7f5; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0; color: #0f766e;"><strong>📅 Borrowing Details:</strong></p>
            <p style="margin: 5px 0; color: #4b5563;">📖 Book: ${bookTitle}</p>
            <p style="margin: 5px 0; color: #4b5563;">📅 Issued Date: ${issueDate}</p>
            <p style="margin: 5px 0; color: #4b5563;">⏰ Due Date: ${dueDate}</p>
          </div>
          
          <p style="color: #4b5563;">Please return the book on or before the due date to avoid any late fees.</p>
          
          <a href="http://localhost:3000" style="display: inline-block; background: #0f766e; color: white; padding: 12px 25px; text-decoration: none; border-radius: 8px; margin-top: 10px;">View My Shelf →</a>
          
          <hr style="margin: 25px 0; border-color: #e5e7eb;">
          <p style="color: #9ca3af; font-size: 12px; text-align: center;">© 2026 BookFlow Library. All rights reserved.</p>
        </div>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`📧 Approval email sent to ${email}`);
  } catch (error) {
    console.error('Approval email error:', error);
  }
};

// Request rejected email
const sendRejectionEmail = async (email, name, bookTitle, reason = 'Not specified') => {
  const mailOptions = {
    from: `"BookFlow Library" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: '❌ Book Request Rejected',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #ef4444; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0;">❌ Request Rejected</h1>
        </div>
        <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e5e7eb;">
          <h2 style="color: #1f2937;">Dear ${name},</h2>
          <p style="color: #4b5563; line-height: 1.6;">Your request for <strong>"${bookTitle}"</strong> has been rejected.</p>
          
          <div style="background: #fee2e2; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0; color: #dc2626;"><strong>Reason:</strong></p>
            <p style="margin: 5px 0; color: #4b5563;">${reason}</p>
          </div>
          
          <p style="color: #4b5563;">Please contact the librarian for more information or try requesting a different book.</p>
          
          <a href="http://localhost:3000" style="display: inline-block; background: #0f766e; color: white; padding: 12px 25px; text-decoration: none; border-radius: 8px; margin-top: 10px;">Browse Books →</a>
          
          <hr style="margin: 25px 0; border-color: #e5e7eb;">
          <p style="color: #9ca3af; font-size: 12px; text-align: center;">© 2026 BookFlow Library. All rights reserved.</p>
        </div>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`📧 Rejection email sent to ${email}`);
  } catch (error) {
    console.error('Rejection email error:', error);
  }
};

// Due reminder email
const sendDueReminderEmail = async (email, name, bookTitle, dueDate, daysLeft) => {
  const isLastDay = daysLeft === 0;
  const subject = isLastDay ? '⏰ LAST DAY to Return Book!' : `📚 Book Due in ${daysLeft} Days`;
  const color = isLastDay ? '#ef4444' : '#f59e0b';
  
  const mailOptions = {
    from: `"BookFlow Library" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: subject,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: ${color}; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0;">${isLastDay ? '⏰ LAST DAY!' : '📚 Reminder'}</h1>
        </div>
        <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e5e7eb;">
          <h2 style="color: #1f2937;">Dear ${name},</h2>
          <p style="color: #4b5563; line-height: 1.6;">This is a reminder that your borrowed book is due <strong>${isLastDay ? 'TODAY' : `in ${daysLeft} days`}</strong>.</p>
          
          <div style="background: ${isLastDay ? '#fee2e2' : '#fef3c7'}; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0; color: ${color};"><strong>📖 Book Details:</strong></p>
            <p style="margin: 5px 0; color: #4b5563;">Book: ${bookTitle}</p>
            <p style="margin: 5px 0; color: #4b5563;">Due Date: ${dueDate}</p>
            ${isLastDay ? '<p style="margin: 5px 0; color: #dc2626; font-weight: bold;">⚠️ Please return today to avoid late fees!</p>' : ''}
          </div>
          
          <a href="http://localhost:3000" style="display: inline-block; background: ${color}; color: white; padding: 12px 25px; text-decoration: none; border-radius: 8px; margin-top: 10px;">Go to My Shelf →</a>
          
          <hr style="margin: 25px 0; border-color: #e5e7eb;">
          <p style="color: #9ca3af; font-size: 12px; text-align: center;">© 2026 BookFlow Library. All rights reserved.</p>
        </div>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`📧 Due reminder email sent to ${email} (${daysLeft} days left)`);
  } catch (error) {
    console.error('Due reminder email error:', error);
  }
};

// Overdue email
const sendOverdueEmail = async (email, name, bookTitle, dueDate, daysOverdue) => {
  const mailOptions = {
    from: `"BookFlow Library" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: '⚠️ OVERDUE BOOK - Action Required!',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #dc2626; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0;">⚠️ OVERDUE BOOK</h1>
        </div>
        <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e5e7eb;">
          <h2 style="color: #1f2937;">Dear ${name},</h2>
          <p style="color: #4b5563; line-height: 1.6;">Your borrowed book is <strong style="color: #dc2626;">${daysOverdue} days overdue</strong>. Please return it immediately.</p>
          
          <div style="background: #fee2e2; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0; color: #dc2626;"><strong>📖 Overdue Book:</strong></p>
            <p style="margin: 5px 0; color: #4b5563;">Book: ${bookTitle}</p>
            <p style="margin: 5px 0; color: #4b5563;">Due Date: ${dueDate}</p>
            <p style="margin: 5px 0; color: #dc2626; font-weight: bold;">Overdue by: ${daysOverdue} days</p>
          </div>
          
          <p style="color: #4b5563;">Late fees may apply. Please return the book as soon as possible.</p>
          
          <a href="http://localhost:3000" style="display: inline-block; background: #dc2626; color: white; padding: 12px 25px; text-decoration: none; border-radius: 8px; margin-top: 10px;">Return Book →</a>
          
          <hr style="margin: 25px 0; border-color: #e5e7eb;">
          <p style="color: #9ca3af; font-size: 12px; text-align: center;">© 2026 BookFlow Library. All rights reserved.</p>
        </div>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`📧 Overdue email sent to ${email} (${daysOverdue} days overdue)`);
  } catch (error) {
    console.error('Overdue email error:', error);
  }
};

// Reset password email
const sendResetEmail = async (email, name, resetToken) => {
  const resetLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;
  
  const mailOptions = {
    from: `"BookFlow Library" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Reset Your Password - BookFlow',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #0f766e, #14b8a6); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0;">🔐 Reset Password</h1>
        </div>
        <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e5e7eb;">
          <h2 style="color: #1f2937;">Hello ${name},</h2>
          <p style="color: #4b5563; line-height: 1.6;">We received a request to reset your password. Click the button below to create a new password.</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetLink}" style="display: inline-block; background: #0f766e; color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px;">Reset Password</a>
          </div>
          
          <p style="color: #4b5563; font-size: 14px;">This link will expire in 1 hour. If you didn't request this, please ignore this email.</p>
          
          <hr style="margin: 25px 0; border-color: #e5e7eb;">
          <p style="color: #9ca3af; font-size: 12px; text-align: center;">© 2026 BookFlow Library. All rights reserved.</p>
        </div>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`📧 Reset email sent to ${email}`);
  } catch (error) {
    console.error('Reset email error:', error);
  }
};

module.exports = {
  sendWelcomeEmail,
  sendApprovalEmail,
  sendRejectionEmail,
  sendDueReminderEmail,
  sendOverdueEmail,
  sendResetEmail,
};