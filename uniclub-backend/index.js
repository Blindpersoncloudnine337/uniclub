require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const User = require('./models/User');
const EnrolledUser = require('./models/EnrolledUser');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const path = require('path');
const authenticateToken = require('./middleware/auth');

const app = express();

// IMPORTANT: Set body parser limits for Base64 images
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Serve uploads as static files
app.use('/uploads', express.static(path.join(__dirname, 'public', 'uploads')));
// Specifically serve avatar files (ensure avatars subdirectory is accessible)
app.use('/uploads/avatars', express.static(path.join(__dirname, 'public', 'uploads', 'avatars')));

// Log only important requests (disable body logging for performance)
app.use((req, res, next) => {
  // Only log in development, and skip body to improve performance
  if (process.env.NODE_ENV === 'development' && !req.url.includes('/api/')) {
    console.log(`[REQUEST] ${req.method} ${req.url}`);
  }
  next();
});

const PORT = process.env.PORT || 5000;

// CORS configuration with Vercel support
app.use(cors({
  origin: function (origin, callback) {
    const allowedOrigins = [
      'http://localhost:8080', 'http://127.0.0.1:8080', 'http://192.168.1.191:8080',
      'http://localhost:8081', 'http://127.0.0.1:8081', 'http://192.168.1.191:8081',
      'http://localhost:8082', 'http://127.0.0.1:8082', 'http://192.168.1.191:8082'
    ];
    
    // Allow all Vercel preview and production URLs
    const isVercelDomain = origin && origin.includes('vercel.app');
    
    if (!origin || allowedOrigins.includes(origin) || isVercelDomain) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  preflightContinue: false,
  optionsSuccessStatus: 204
}));

// Connect to MongoDB using environment variable
const mongoUri = process.env.MONGODB_URI;
if (!mongoUri) {
  console.error('❌ MONGODB_URI environment variable is not set!');
  process.exit(1);
}
console.log('🔗 Connecting to MongoDB...');

// Configure MongoDB connection with performance optimizations
const mongoOptions = {
  maxPoolSize: 10, // Connection pool size
  minPoolSize: 2,
  serverSelectionTimeoutMS: 5000, // Faster timeout
  socketTimeoutMS: 45000,
  connectTimeoutMS: 10000
};

mongoose.connect(mongoUri, mongoOptions)
  .then(async () => {
    console.log('✅ Connected to MongoDB');
    console.log('📂 Database name:', mongoose.connection.db?.databaseName || 'connected');
    
    // Skip heavy queries on startup - just test connectivity
    try {
      const testCount = await EnrolledUser.countDocuments();
      console.log(`📊 EnrolledUser collection: ${testCount} users`);
    } catch (error) {
      console.error('❌ Error accessing EnrolledUser:', error);
    }
  })
  .catch((err) => {
    console.error('❌ Failed to connect to MongoDB:', err);
    process.exit(1);
  });

const authRouter = express.Router();

// Step 1: Check UTD email validity
// POST /api/auth/signup-step1 { email }
authRouter.post('/signup-step1', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email || !email.endsWith('@utdallas.edu')) {
      return res.status(400).json({ error: 'Please use a valid UTDallas email address.' });
    }
    // Check if already registered
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered. Please sign in.' });
    }
    res.json({ success: true, message: 'UTD email valid.' });
  } catch (error) {
    console.error('❌ Error in signup-step1:', error);
    res.status(500).json({ error: 'Server error. Please try again.' });
  }
});

// Step 2: Verify unique club ID and email
// POST /api/auth/signup-step2 { email, uniqueId }
authRouter.post('/signup-step2', async (req, res) => {
  try {
    const { email, uniqueId } = req.body;
    if (!email || !uniqueId) {
      return res.status(400).json({ error: 'Email and unique ID are required.' });
    }
    // Debug: log all enrolled users and the query
    console.log("Looking for:", { email, uniqueId });
    const allEnrolled = await EnrolledUser.find({});
    console.log("All enrolled users:", allEnrolled);

    // Check if this email and uniqueId exist in EnrolledUser
    const enrolled = await EnrolledUser.findOne({ email, uniqueId });
    console.log("Enrolled found:", enrolled);
    if (!enrolled) {
      // Show all emails and uniqueIds for easier debugging
      const allEmails = allEnrolled.map(u => u.email);
      const allUniqueIds = allEnrolled.map(u => u.uniqueId);
      console.log("All emails:", allEmails);
      console.log("All uniqueIds:", allUniqueIds);
      return res.status(400).json({ error: 'Sorry, user authentication not confirmed. Please try again or contact the admins of your club.' });
    }
    res.json({ success: true, name: enrolled.name, message: 'Unique ID verified.' });
  } catch (error) {
    console.error('❌ Error in signup-step2:', error);
    res.status(500).json({ error: 'Server error. Please try again.' });
  }
});

// Step 3: Set password and complete registration
// POST /api/auth/signup-step3 { email, uniqueId, password }
authRouter.post('/signup-step3', async (req, res) => {
  try {
    const { email, uniqueId, password } = req.body;
    if (!email || !uniqueId || !password) {
      return res.status(400).json({ error: 'All fields are required.' });
    }
    // Check if already registered
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered. Please sign in.' });
    }
    // Check enrolled user
    const enrolled = await EnrolledUser.findOne({ email, uniqueId });
    if (!enrolled) {
      return res.status(400).json({ error: 'User not found in enrolled users.' });
    }
    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);
    // Create user
    const user = new User({
      email,
      name: enrolled.name,
      uniqueId,
      passwordHash,
      isEnrolled: true,
    });
    await user.save();
    res.json({ success: true, message: 'Registration complete. Please sign in.' });
  } catch (error) {
    console.error('❌ Error in signup-step3:', error);
    res.status(500).json({ error: 'Server error. Please try again.' });
  }
});

// Login endpoint
// POST /api/auth/login { email, password }
authRouter.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: 'Invalid email or password.' });
    }
    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      return res.status(400).json({ error: 'Invalid email or password.' });
    }
    // Create JWT
    const token = jwt.sign({ userId: user._id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ success: true, token, user: { email: user.email, name: user.name, uniqueId: user.uniqueId } });
  } catch (error) {
    console.error('❌ Error in login:', error);
    res.status(500).json({ error: 'Server error. Please try again.' });
  }
});

// Token validation endpoint
// GET /api/auth/validate
authRouter.get('/validate', authenticateToken, async (req, res) => {
  try {
    res.json({ valid: true, user: req.user });
  } catch (error) {
    console.error('❌ Error in token validation:', error);
    res.status(500).json({ error: 'Server error during validation.' });
  }
});

// Get current user profile
// GET /api/auth/me
authRouter.get('/me', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        uniqueId: user.uniqueId,
        avatar: user.profile?.avatar || null
      }
    });
  } catch (error) {
    console.error('❌ Error fetching user profile:', error);
    res.status(500).json({ error: 'Server error. Please try again.' });
  }
});

// Import routers
console.log('🔄 Loading routers...');
const newsRouter = require('./routes/newsRouter');
console.log('✅ News router loaded');
const userRouter = require('./routes/userRouter');
console.log('✅ User router loaded');

let chatRouter;
try {
  chatRouter = require('./routes/chatRouter');
  console.log('✅ Chat router loaded successfully');
} catch (error) {
  console.error('❌ Error loading chat router:', error.message);
  console.error('Stack:', error.stack);
}

let commentRouter;
try {
  commentRouter = require('./routes/commentRouter');
  console.log('✅ Comment router loaded successfully');
} catch (error) {
  console.error('❌ Error loading comment router:', error.message);
  console.error('Stack:', error.stack);
}

const socialRouter = require('./routes/socialRouter');
console.log('✅ Social router loaded');

const engagementRouter = require('./routes/engagementRouter');
console.log('✅ Engagement router loaded');

const eventRouter = require('./routes/eventRouter');
console.log('✅ Event router loaded');

const curationRouter = require('./routes/curationRouter');
console.log('✅ Curation router loaded');

const resourceRouter = require('./routes/resourceRouter');
console.log('✅ Resource router loaded');

const notificationRouter = require('./routes/notificationRouter');
console.log('✅ Notification router loaded');

const pastEventRouter = require('./routes/pastEventRouter');
console.log('✅ Past Event router loaded');


// Mount routers
console.log('🔗 Mounting routers...');
app.use('/api/auth', authRouter);
console.log('✅ Auth router mounted at /api/auth');
app.use('/api/news', newsRouter);
console.log('✅ News router mounted at /api/news');
app.use('/api/users', userRouter);
console.log('✅ User router mounted at /api/users');

if (chatRouter) {
  app.use('/api/chat', chatRouter);
  console.log('✅ Chat router mounted at /api/chat');
} else {
  console.error('❌ Chat router not mounted due to loading error');
}

if (commentRouter) {
  app.use('/api/comments', commentRouter);
  console.log('✅ Comment router mounted at /api/comments');
} else {
  console.error('❌ Comment router not mounted due to loading error');
}

app.use('/api/social', socialRouter);
console.log('✅ Social router mounted at /api/social');

app.use('/api/engagement', engagementRouter);
console.log('✅ Engagement router mounted at /api/engagement');

// Deprecation warning for legacy engagement endpoints
console.warn('⚠️  DEPRECATION NOTICE: Legacy engagement endpoints (/api/news/:id/like, /api/social/posts/:id/like, etc.) are deprecated');
console.warn('    Use unified engagement API: /api/engagement/* instead');

app.use('/api/events', eventRouter);
console.log('✅ Event router mounted at /api/events');

app.use('/api/curation', curationRouter);
console.log('✅ Curation router mounted at /api/curation');

app.use('/api/resources', resourceRouter);
console.log('✅ Resource router mounted at /api/resources');

app.use('/api/notifications', notificationRouter);
console.log('✅ Notification router mounted at /api/notifications');

app.use('/api/past-events', pastEventRouter);
console.log('✅ Past Event router mounted at /api/past-events');

// Featured router
const featuredRouter = require('./routes/featuredRouter');
app.use('/api/featured', featuredRouter);
console.log('✅ Featured router mounted at /api/featured');

// Search router
const searchRouter = require('./routes/searchRouter');
app.use('/api/search', searchRouter);
console.log('✅ Search router mounted at /api/search');

// Debug endpoint to see what's actually in the database
app.get('/api/debug/enrolled', async (req, res) => {
  try {
    const allUsers = await EnrolledUser.find({});
    console.log('=== DEBUG: All enrolled users ===');
    console.log(JSON.stringify(allUsers, null, 2));
    res.json({ 
      count: allUsers.length, 
      users: allUsers,
      collectionName: EnrolledUser.collection.name
    });
  } catch (error) {
    console.error('Debug error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Uniclub backend is running!' });
});

// Only start server in local development (not on Vercel)
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`🚀 Backend API running at: http://localhost:${PORT}`);
    console.log('🚀 Available endpoints:');
    console.log('   🔐 Authentication: /api/auth/*');
    console.log('   📰 News: /api/news');
    console.log('   👥 Users: /api/users/*');
    console.log('   🎯 Engagement: /api/engagement/*');
    console.log('   📅 Events: /api/events/*');
    console.log('   📱 Social: /api/social/*');
    console.log('   💬 Comments: /api/comments/*');
    console.log('   🎨 Curation: /api/curation/*');
    console.log('   📚 Resources: /api/resources/*');
    console.log('   📜 Past Events: /api/past-events/*');
    console.log('   🔍 Debug: /api/debug/enrolled');
    console.log('   ❤️ Health: /api/health');
  });
}

// Cron endpoint for automated news curation (called by Vercel Cron)
app.get('/api/cron/news-curation', async (req, res) => {
  // Verify this is called by Vercel Cron (using authorization header)
  const authHeader = req.headers.authorization;
  
  // In production, verify it's from Vercel (you can add CRON_SECRET to env)
  if (process.env.NODE_ENV === 'production' && process.env.CRON_SECRET) {
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
  }
  
  console.log('🌙 Midnight News Curation triggered by Vercel Cron');
  console.log('🕐 Server Time:', new Date().toISOString());
  console.log('🕐 Dallas Time:', new Date().toLocaleString('en-US', {
    timeZone: 'America/Chicago',
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  }));
  
  try {
    const NewsCurationService = require('./services/NewsCurationService');
    const curationService = new NewsCurationService();
    
    await curationService.runMidnightCuration();
    
    console.log('✅ Midnight news curation completed successfully');
    res.status(200).json({ 
      success: true, 
      message: 'News curation completed',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Midnight news curation failed:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Export for Vercel serverless functions
module.exports = app; 