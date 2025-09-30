const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { body, validationResult } = require('express-validator');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Register
router.post('/register', [
  body('firstName').notEmpty().withMessage('First name is required'),
  body('lastName').notEmpty().withMessage('Last name is required'),
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('phone').notEmpty().withMessage('Phone number is required'),
  body('dateOfBirth').isISO8601().withMessage('Please provide a valid date of birth'),
  body('gender').isIn(['male', 'female', 'other']).withMessage('Please select a valid gender')
], (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { firstName, lastName, email, password, phone, dateOfBirth, gender, address, role } = req.body;
    const db = req.app.locals.db;

    // Check if user already exists
    db.get('SELECT id FROM users WHERE email = ?', [email], (err, existingUser) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ message: 'Server error during registration' });
      }

      if (existingUser) {
        return res.status(400).json({ message: 'User already exists with this email' });
      }

      // Hash password
      const hashedPassword = bcrypt.hashSync(password, 10);

      // Create new user
      const stmt = db.prepare(`
        INSERT INTO users (firstName, lastName, email, password, phone, dateOfBirth, gender, address, role)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      stmt.run([firstName, lastName, email, hashedPassword, phone, dateOfBirth, gender, 
                address ? JSON.stringify(address) : null, role || 'patient'], function(err) {
        if (err) {
          console.error('Database error:', err);
          return res.status(500).json({ message: 'Server error during registration' });
        }

        // Generate JWT token
        const token = jwt.sign(
          { userId: this.lastID },
          process.env.JWT_SECRET || 'your-secret-key',
          { expiresIn: '7d' }
        );

        res.status(201).json({
          message: 'User registered successfully',
          token,
          user: {
            id: this.lastID,
            firstName,
            lastName,
            email,
            role: role || 'patient'
          }
        });
      });

      stmt.finalize();
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
});

// Login
router.post('/login', [
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password').notEmpty().withMessage('Password is required')
], (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;
    const db = req.app.locals.db;

    // Find user
    db.get('SELECT * FROM users WHERE email = ? AND isActive = 1', [email], (err, user) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ message: 'Server error during login' });
      }

      if (!user) {
        return res.status(400).json({ message: 'Invalid credentials' });
      }

      // Check password
      const isMatch = bcrypt.compareSync(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ message: 'Invalid credentials' });
      }

      // Generate JWT token
      const token = jwt.sign(
        { userId: user.id },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '7d' }
      );

      res.json({
        message: 'Login successful',
        token,
        user: {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role
        }
      });
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
});

// Get current user
router.get('/me', auth, (req, res) => {
  try {
    const db = req.app.locals.db;
    
    db.get('SELECT * FROM users WHERE id = ?', [req.user.id], (err, user) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ message: 'Server error' });
      }

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      res.json({
        user: {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phone: user.phone,
          dateOfBirth: user.dateOfBirth,
          gender: user.gender,
          address: user.address ? JSON.parse(user.address) : null,
          role: user.role
        }
      });
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
