const express = require('express');
const { body, validationResult } = require('express-validator');
const { auth, requireRole } = require('../middleware/auth');

const router = express.Router();

// Get all users
router.get('/', auth, (req, res) => {
  try {
    const db = req.app.locals.db;
    const { role, search } = req.query;
    
    let query = 'SELECT id, firstName, lastName, email, phone, dateOfBirth, gender, role, isActive, createdAt FROM users WHERE 1=1';
    const params = [];
    
    if (role) {
      query += ' AND role = ?';
      params.push(role);
    }
    
    if (search) {
      query += ' AND (firstName LIKE ? OR lastName LIKE ? OR email LIKE ?)';
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }
    
    query += ' ORDER BY lastName, firstName';
    
    db.all(query, params, (err, users) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ message: 'Server error' });
      }
      
      res.json({ users });
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user by ID
router.get('/:id', auth, (req, res) => {
  try {
    const { id } = req.params;
    const db = req.app.locals.db;
    
    db.get('SELECT id, firstName, lastName, email, phone, dateOfBirth, gender, address, role, isActive, createdAt FROM users WHERE id = ?', [id], (err, user) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ message: 'Server error' });
      }
      
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      if (user.address) {
        user.address = JSON.parse(user.address);
      }
      
      res.json({ user });
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update user
router.put('/:id', [
  auth,
  body('firstName').optional().notEmpty().withMessage('First name cannot be empty'),
  body('lastName').optional().notEmpty().withMessage('Last name cannot be empty'),
  body('email').optional().isEmail().withMessage('Please provide a valid email'),
  body('phone').optional().notEmpty().withMessage('Phone number cannot be empty'),
  body('role').optional().isIn(['patient', 'personnel', 'admin']).withMessage('Invalid role')
], (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const updates = req.body;
    const db = req.app.locals.db;

    // Check if user can update this profile
    if (req.user.role !== 'admin' && req.user.id !== parseInt(id)) {
      return res.status(403).json({ message: 'Insufficient permissions' });
    }

    // Build dynamic update query
    const fields = [];
    const values = [];
    
    Object.keys(updates).forEach(key => {
      if (updates[key] !== undefined) {
        if (key === 'address') {
          fields.push(`${key} = ?`);
          values.push(JSON.stringify(updates[key]));
        } else {
          fields.push(`${key} = ?`);
          values.push(updates[key]);
        }
      }
    });

    if (fields.length === 0) {
      return res.status(400).json({ message: 'No valid fields to update' });
    }

    values.push(id);
    const query = `UPDATE users SET ${fields.join(', ')}, updatedAt = CURRENT_TIMESTAMP WHERE id = ?`;

    db.run(query, values, function(err) {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ message: 'Server error updating user' });
      }

      if (this.changes === 0) {
        return res.status(404).json({ message: 'User not found' });
      }

      res.json({ message: 'User updated successfully' });
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Deactivate user (admin only)
router.put('/:id/deactivate', [auth, requireRole(['admin'])], (req, res) => {
  try {
    const { id } = req.params;
    const db = req.app.locals.db;

    db.run('UPDATE users SET isActive = 0, updatedAt = CURRENT_TIMESTAMP WHERE id = ?', [id], function(err) {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ message: 'Server error deactivating user' });
      }

      if (this.changes === 0) {
        return res.status(404).json({ message: 'User not found' });
      }

      res.json({ message: 'User deactivated successfully' });
    });
  } catch (error) {
    console.error('Deactivate user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user appointments
router.get('/:id/appointments', auth, (req, res) => {
  try {
    const { id } = req.params;
    const db = req.app.locals.db;
    
    // Check if user can view these appointments
    if (req.user.role !== 'admin' && req.user.role !== 'personnel' && req.user.id !== parseInt(id)) {
      return res.status(403).json({ message: 'Insufficient permissions' });
    }
    
    db.all(`
      SELECT a.*, 
             p.firstName as patientFirstName, p.lastName as patientLastName,
             per.firstName as personnelFirstName, per.lastName as personnelLastName
      FROM appointments a
      LEFT JOIN users p ON a.patientId = p.id
      LEFT JOIN users per ON a.personnelId = per.id
      WHERE a.patientId = ?
      ORDER BY a.scheduledDate DESC, a.scheduledTime DESC
    `, [id], (err, appointments) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ message: 'Server error' });
      }
      
      res.json({ appointments });
    });
  } catch (error) {
    console.error('Get user appointments error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
