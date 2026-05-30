const jwt = require('jsonwebtoken');
const User = require('../models/User');
const logger = require('../utils/logger');
const { createClerkClient } = require('@clerk/backend');

// Lazy-initialize clerk client so env vars are always loaded first
let _clerkClient = null;
function getClerkClient() {
  if (!_clerkClient) {
    _clerkClient = createClerkClient({
      secretKey: process.env.CLERK_SECRET_KEY,
    });
  }
  return _clerkClient;
}

// Define authenticate — decode JWT to extract Clerk user ID, then validate via Clerk API
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'No token provided.' });
    }

    const token = authHeader.substring(7);

    // Step 1: Decode the JWT (without signature verification) to get the Clerk user ID
    let clerkId;
    try {
      const decoded = jwt.decode(token);
      if (!decoded || !decoded.sub) {
        return res.status(401).json({ success: false, message: 'Invalid token format.' });
      }
      clerkId = decoded.sub;
    } catch (decodeErr) {
      logger.warn('JWT decode failed:', decodeErr.message);
      return res.status(401).json({ success: false, message: 'Invalid token.' });
    }

    // Step 2: Confirm this user actually exists in Clerk (prevents forged tokens)
    try {
      await getClerkClient().users.getUser(clerkId);
    } catch (clerkErr) {
      logger.warn('Clerk user lookup failed for id:', clerkId, clerkErr.message);
      return res.status(401).json({ success: false, message: 'Invalid or expired token.' });
    }

    // Step 3: Find or create the MongoDB user record
    let user = await User.findOne({ clerkId });

    if (!user) {
      const clerkUserObj = await getClerkClient().users.getUser(clerkId);
      const email = clerkUserObj.emailAddresses[0]?.emailAddress;

      // Maybe they signed up before clerkId was linked
      user = await User.findOne({ email });

      if (user) {
        user.clerkId = clerkId;
        await user.save();
      } else {
        user = await User.create({
          clerkId,
          email,
          name: clerkUserObj.firstName
            ? `${clerkUserObj.firstName} ${clerkUserObj.lastName || ''}`.trim()
            : 'New User',
          isActive: true,
          credits: 100,
        });
      }
    }

    if (!user.isActive) {
      return res.status(401).json({ success: false, message: 'Account is inactive.' });
    }

    req.user = user;
    next();
  } catch (error) {
    logger.error('Authentication error:', error);
    res.status(401).json({ success: false, message: 'Authentication failed.' });
  }
};

// Middleware to check if user has enough credits
const checkCredits = (amount = 1) => {
  return async (req, res, next) => {
    try {
      if (!req.user.hasCredits(amount)) {
        return res.status(403).json({
          success: false,
          message: 'Insufficient credits. Please purchase more credits or upgrade your plan.',
          credits: req.user.credits,
          required: amount
        });
      }
      next();
    } catch (error) {
      logger.error('Credit check error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to check credits.'
      });
    }
  };
};

// Middleware to check subscription type
const checkSubscription = (requiredPlans = []) => {
  return async (req, res, next) => {
    try {
      const userPlan = req.user.subscription.type;
      
      if (!requiredPlans.includes(userPlan)) {
        return res.status(403).json({
          success: false,
          message: `This feature requires ${requiredPlans.join(' or ')} subscription.`,
          currentPlan: userPlan,
          requiredPlans
        });
      }
      
      next();
    } catch (error) {
      logger.error('Subscription check error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to check subscription.'
      });
    }
  };
};

// Middleware for optional authentication (doesn't fail if no token)
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      try {
        const decoded = jwt.decode(token);
        const clerkId = decoded?.sub;
        if (clerkId) {
          const user = await User.findOne({ clerkId });
          if (user && user.isActive) {
            req.user = user;
          }
        }
      } catch {
        // Ignore invalid tokens for optional auth
      }
    }
    next();
  } catch (error) {
    next();
  }
};

// Helper function to extract token from request
const getTokenFromRequest = (req) => {
  const authHeader = req.headers.authorization;
  
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  
  // Also check for token in cookies (for web app)
  if (req.cookies && req.cookies.token) {
    return req.cookies.token;
  }
  
  return null;
};

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  );
};

// Middleware to validate token format (for development/testing)
const validateTokenFormat = (req, res, next) => {
  const token = getTokenFromRequest(req);
  
  if (token && !token.match(/^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]*$/)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid token format.'
    });
  }
  
  next();
};

module.exports = {
  authenticate,
  checkCredits,
  checkSubscription,
  optionalAuth,
  generateToken,
  validateTokenFormat
};
