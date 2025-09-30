const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'No token, authorization denied' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    const db = req.app.locals.db;
    
    db.get('SELECT * FROM users WHERE id = ? AND isActive = 1', [decoded.userId], (err, user) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ message: 'Server error' });
      }
      
      if (!user) {
        return res.status(401).json({ message: 'Token is not valid' });
      }

      req.user = user;
      next();
    });
  } catch (error) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};

const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Insufficient permissions' });
    }
    
    next();
  };
};

module.exports = { auth, requireRole };
