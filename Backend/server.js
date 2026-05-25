const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { startScheduler } = require('./services/schedulerService');
const { authMiddleware, isLibrarian } = require('./middleware/auth');
const wishlistRoutes = require('./routes/wishlist');

const app = express();

// ✅ FIXED CORS Configuration - No wildcard issues
const allowedOrigins = [
  'https://bookflow-frontend.onrender.com',
  'http://localhost:3000',
  'http://localhost:5000'
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.warn(`CORS blocked origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// ✅ Handle preflight requests - CORRECT WAY (no bare '*')
app.options('/*', (req, res) => {
  res.header('Access-Control-Allow-Origin', req.headers.origin);
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.sendStatus(200);
});

// Middleware - ADD PAYLOAD SIZE LIMITS
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Routes
const categoriesRoutes = require('./routes/categories');
app.use('/api/categories', categoriesRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/auth', require('./routes/auth'));
app.use('/api/books', require('./routes/books'));
app.use('/api/borrow', require('./routes/borrow'));
app.use('/api/users', require('./routes/users'));
app.use('/api/quotes', require('./routes/quotes'));
app.use('/api/notifications', require('./routes/notifications'));

// Test route
app.get('/', (req, res) => {
  res.json({ message: 'Library API is running!' });
});

// Manual trigger for testing (librarian only)
app.post('/api/admin/check-due-dates', authMiddleware, isLibrarian, async (req, res) => {
  try {
    const { runManualCheck } = require('./services/schedulerService');
    await runManualCheck();
    res.json({ message: 'Due date check completed successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Start the notification scheduler (after app is defined)
startScheduler();

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`📚 API available at http://localhost:${PORT}`);
  console.log(`🔗 CORS enabled for: ${allowedOrigins.join(', ')}`);
});