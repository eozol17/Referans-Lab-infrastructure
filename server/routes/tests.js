const express = require('express');
const { body, validationResult } = require('express-validator');
const { auth, requireRole } = require('../middleware/auth');

const router = express.Router();

// Get all tests
router.get('/', auth, (req, res) => {
  try {
    const db = req.app.locals.db;
    
    db.all('SELECT * FROM tests WHERE isActive = 1 ORDER BY category, name', (err, tests) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ message: 'Server error' });
      }
      
      res.json({ tests });
    });
  } catch (error) {
    console.error('Get tests error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get tests by category
router.get('/category/:category', auth, (req, res) => {
  try {
    const { category } = req.params;
    const db = req.app.locals.db;
    
    db.all('SELECT * FROM tests WHERE category = ? AND isActive = 1 ORDER BY name', [category], (err, tests) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ message: 'Server error' });
      }
      
      res.json({ tests });
    });
  } catch (error) {
    console.error('Get tests by category error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create new test (admin/personnel only)
router.post('/', [
  auth,
  requireRole(['admin', 'personnel']),
  body('name').notEmpty().withMessage('Test name is required'),
  body('category').isIn(['microbiology', 'vitamin', 'biochemistry', 'hematology', 'immunology']).withMessage('Invalid category'),
  body('description').notEmpty().withMessage('Description is required'),
  body('preparationInstructions').notEmpty().withMessage('Preparation instructions are required'),
  body('normalRange').notEmpty().withMessage('Normal range is required'),
  body('price').isNumeric().withMessage('Price must be a number'),
  body('estimatedDuration').isNumeric().withMessage('Estimated duration must be a number')
], (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, category, description, preparationInstructions, normalRange, price, estimatedDuration } = req.body;
    const db = req.app.locals.db;

    const stmt = db.prepare(`
      INSERT INTO tests (name, category, description, preparationInstructions, normalRange, price, estimatedDuration)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run([name, category, description, preparationInstructions, normalRange, price, estimatedDuration], function(err) {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ message: 'Server error creating test' });
      }

      res.status(201).json({
        message: 'Test created successfully',
        test: {
          id: this.lastID,
          name,
          category,
          description,
          preparationInstructions,
          normalRange,
          price,
          estimatedDuration
        }
      });
    });

    stmt.finalize();
  } catch (error) {
    console.error('Create test error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update test (admin/personnel only)
router.put('/:id', [
  auth,
  requireRole(['admin', 'personnel']),
  body('name').optional().notEmpty().withMessage('Test name cannot be empty'),
  body('category').optional().isIn(['microbiology', 'vitamin', 'biochemistry', 'hematology', 'immunology']).withMessage('Invalid category'),
  body('price').optional().isNumeric().withMessage('Price must be a number'),
  body('estimatedDuration').optional().isNumeric().withMessage('Estimated duration must be a number')
], (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const updates = req.body;
    const db = req.app.locals.db;

    // Build dynamic update query
    const fields = [];
    const values = [];
    
    Object.keys(updates).forEach(key => {
      if (updates[key] !== undefined) {
        fields.push(`${key} = ?`);
        values.push(updates[key]);
      }
    });

    if (fields.length === 0) {
      return res.status(400).json({ message: 'No valid fields to update' });
    }

    values.push(id);
    const query = `UPDATE tests SET ${fields.join(', ')}, updatedAt = CURRENT_TIMESTAMP WHERE id = ?`;

    db.run(query, values, function(err) {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ message: 'Server error updating test' });
      }

      if (this.changes === 0) {
        return res.status(404).json({ message: 'Test not found' });
      }

      res.json({ message: 'Test updated successfully' });
    });
  } catch (error) {
    console.error('Update test error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete test (admin only)
router.delete('/:id', [auth, requireRole(['admin'])], (req, res) => {
  try {
    const { id } = req.params;
    const db = req.app.locals.db;

    db.run('UPDATE tests SET isActive = 0, updatedAt = CURRENT_TIMESTAMP WHERE id = ?', [id], function(err) {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ message: 'Server error deleting test' });
      }

      if (this.changes === 0) {
        return res.status(404).json({ message: 'Test not found' });
      }

      res.json({ message: 'Test deleted successfully' });
    });
  } catch (error) {
    console.error('Delete test error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
