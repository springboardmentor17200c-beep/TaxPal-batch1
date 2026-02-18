const admin = require('../config/firebase');

const protect = async (req, res, next) => {
  let token;
  
  // Check if Firebase is properly initialized
  if (!admin) {
    return res.status(500).json({ message: 'Firebase authentication not configured properly' });
  }
  
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decodedToken = await admin.auth().verifyIdToken(token);
      req.user = { uid: decodedToken.uid }; 
      next();
    } catch (error) {
      console.error('Auth error:', error.message);
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }
  
  if (!token) {
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};

module.exports = { protect };