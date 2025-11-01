const jwt = require('jsonwebtoken');

if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is not set');
}

const authenticateToken = (req, res, next) => {
  // Allow OPTIONS requests to pass through without authentication (for CORS preflight)
  if (req.method === 'OPTIONS') {
    return next();
  }

  // Reduced logging for production
  if (process.env.NODE_ENV === 'development') {
    console.log('🔐 AUTH:', req.method, req.url);
  }

  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    console.log('❌ No token provided');
    return res.status(401).json({ error: 'Authentication required' });
  }

  try {
    // Portfolio Demo Mode: Allow demo token for public access
    // This enables visitors to use the app without authentication
    if (token === 'portfolio-demo-token') {
      req.user = {
        userId: '683b6a7623a3da40933f7e24',
        email: 'ashwin.thomas@utdallas.edu',
        name: 'Ashwin Thomas',
        uniqueId: 'UTDAIC1',
        isPortfolioDemo: true
      };
      console.log('🎨 Portfolio demo mode active');
      return next();
    }
    
    // Handle regular JWT tokens
    const user = jwt.verify(token, process.env.JWT_SECRET);
    req.user = user;
    next();
  } catch (error) {
    console.log('❌ Token validation failed:', error.message);
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
};

module.exports = authenticateToken; 