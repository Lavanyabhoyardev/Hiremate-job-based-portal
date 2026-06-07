const jwt = require('jsonwebtoken');
const User = require('../models/User');
const logger = require('../utils/logger');
const { createClerkClient, verifyToken } = require('@clerk/backend');

// Lazy-initialize clerk client so env vars are always loaded first.
// NOTE: this client is now only used on the rare one-time path of creating
// a brand-new MongoDB record for a first-seen user (to fetch their email/name).
// Normal authenticated requests never call the Clerk API anymore.
let _clerkClient = null;
function getClerkClient() {
  if (!_clerkClient) {
    _clerkClient = createClerkClient({
      secretKey: process.env.CLERK_SECRET_KEY,
    });
  }
  return _clerkClient;
}

// Verify a Clerk session token LOCALLY (cryptographic signature check, no API call).
// Returns the decoded JWT claims, or throws if the token is invalid/expired.
function verifyClerkToken(token) {
  return verifyToken(token, {
    secretKey: process.env.CLERK_SECRET_KEY,
    // Tolerate small clock differences between Clerk and the Render instance.
    clockSkewInMs: 10000,
  });
}

// Define authenticate — verify the Clerk JWT locally, then load the MongoDB user.
// No per-request Clerk API call, so health checks and high request volume can
// never exhaust the Clerk instance rate limit.
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'No token provided.' });
    }

    const token = authHeader.substring(7);

    // Step 1: Verify the token's signature locally and extract claims.
    // This replaces the old jwt.decode() + Clerk getUser() API round-trip:
    // a forged token now fails here because it isn't signed by Clerk.
    let claims;
    try {
      claims = await verifyClerkToken(token);
    } catch (verifyErr) {
      logger.warn('Clerk token verification failed:', verifyErr.message);
      return res.status(401).json({ success: false, message: 'Invalid or expired token.' });
    }

    const clerkId = claims?.sub;
    if (!clerkId) {
      return res.status(401).json({ success: false, message: 'Invalid token format.' });
    }

    // Step 2: Find or create the MongoDB user record.
    // (A DB lookup — not a Clerk API call — so it does not affect Clerk limits.)
    let user = await User.findOne({ clerkId });

    if (!user) {
      // First time we've seen this Clerk user: we need their email/name.
      // Verified session tokens don't always carry email, so fall back to the
      // Clerk API ONCE, only at account-creation time (never on hot paths).
      let email = claims.email || claims.email_address || null;
      let firstName;
      let lastName;

      if (!email) {
        const clerkUserObj = await getClerkClient().users.getUser(clerkId);
        email = clerkUserObj.emailAddresses[0]?.emailAddress;
        firstName = clerkUserObj.firstName;
        lastName = clerkUserObj.lastName;
      }

      // Maybe they signed up before clerkId was linked
      user = await User.findOne({ email });

      if (user) {
        user.clerkId = clerkId;
        await user.save();
      } else {
        user = await User.create({
          clerkId,
          email,
          name: firstName
            ? `${firstName} ${lastName || ''}`.trim()
            : (claims.name || 'New User'),
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
        // Verify locally (no Clerk API call); silently ignore invalid tokens.
        const claims = await verifyClerkToken(token);
        const clerkId = claims?.sub;
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
