const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { startScheduler } = require('./services/schedulerService');
const { authMiddleware, isLibrarian } = require('./middleware/auth');
const wishlistRoutes = require('./routes/wishlist');

const app = express();

// ✅ FIXED CORS - No '*' wildcard routes
const allowedOrigins = [
  'https://bookflow-frontend.onrender.com',
  'http://localhost:3000',
  'http://localhost:5000'
];

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// ❌ REMOVE these lines if they exist:
// app.options('*', cors());
// app.use('*', ...)

// Middleware
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

// Manual trigger for testing
app.post('/api/admin/check-due-dates', authMiddleware, isLibrarian, async (req, res) => {
  try {
    const { runManualCheck } = require('./services/schedulerService');
    await runManualCheck();
    res.json({ message: 'Due date check completed successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Start scheduler
startScheduler();

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Server running on port ${PORT}`);
});