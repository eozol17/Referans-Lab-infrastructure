const express = require('express');
const { body, validationResult } = require('express-validator');
const { auth, requireRole } = require('../middleware/auth');

const router = express.Router();

// Get all appointments
router.get('/', auth, (req, res) => {
  try {
    const db = req.app.locals.db;
    const { status, patientId, personnelId } = req.query;
    
    let query = `
      SELECT a.*, 
             p.firstName as patientFirstName, p.lastName as patientLastName, p.email as patientEmail,
             per.firstName as personnelFirstName, per.lastName as personnelLastName
      FROM appointments a
      LEFT JOIN users p ON a.patientId = p.id
      LEFT JOIN users per ON a.personnelId = per.id
      WHERE 1=1
    `;
    
    const params = [];
    
    if (status) {
      query += ' AND a.status = ?';
      params.push(status);
    }
    
    if (patientId) {
      query += ' AND a.patientId = ?';
      params.push(patientId);
    }
    
    if (personnelId) {
      query += ' AND a.personnelId = ?';
      params.push(personnelId);
    }
    
    query += ' ORDER BY a.scheduledDate DESC, a.scheduledTime DESC';
    
    db.all(query, params, (err, appointments) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ message: 'Server error' });
      }
      
      res.json({ appointments });
    });
  } catch (error) {
    console.error('Get appointments error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get appointment by ID
router.get('/:id', auth, (req, res) => {
  try {
    const { id } = req.params;
    const db = req.app.locals.db;
    
    db.get(`
      SELECT a.*, 
             p.firstName as patientFirstName, p.lastName as patientLastName, p.email as patientEmail, p.phone as patientPhone,
             per.firstName as personnelFirstName, per.lastName as personnelLastName
      FROM appointments a
      LEFT JOIN users p ON a.patientId = p.id
      LEFT JOIN users per ON a.personnelId = per.id
      WHERE a.id = ?
    `, [id], (err, appointment) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ message: 'Server error' });
      }
      
      if (!appointment) {
        return res.status(404).json({ message: 'Appointment not found' });
      }
      
      // Get tests for this appointment
      db.all(`
        SELECT at.*, t.name as testName, t.category, t.price, t.description
        FROM appointment_tests at
        LEFT JOIN tests t ON at.testId = t.id
        WHERE at.appointmentId = ?
      `, [id], (err, tests) => {
        if (err) {
          console.error('Database error:', err);
          return res.status(500).json({ message: 'Server error' });
        }
        
        appointment.tests = tests;
        res.json({ appointment });
      });
    });
  } catch (error) {
    console.error('Get appointment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create new appointment
router.post('/', [
  auth,
  requireRole(['personnel', 'admin']),
  body('patientId').isNumeric().withMessage('Patient ID is required'),
  body('scheduledDate').isISO8601().withMessage('Valid scheduled date is required'),
  body('scheduledTime').notEmpty().withMessage('Scheduled time is required'),
  body('tests').isArray({ min: 1 }).withMessage('At least one test is required'),
  body('tests.*.testId').isNumeric().withMessage('Test ID is required')
], (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { patientId, scheduledDate, scheduledTime, tests, notes } = req.body;
    const db = req.app.locals.db;

    // Calculate total amount
    const testIds = tests.map(t => t.testId);
    const placeholders = testIds.map(() => '?').join(',');
    
    db.all(`SELECT price FROM tests WHERE id IN (${placeholders})`, testIds, (err, testPrices) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ message: 'Server error calculating total' });
      }
      
      const totalAmount = testPrices.reduce((sum, test) => sum + test.price, 0);
      
      // Create appointment
      const stmt = db.prepare(`
        INSERT INTO appointments (patientId, personnelId, scheduledDate, scheduledTime, totalAmount, notes)
        VALUES (?, ?, ?, ?, ?, ?)
      `);

      stmt.run([patientId, req.user.id, scheduledDate, scheduledTime, totalAmount, notes], function(err) {
        if (err) {
          console.error('Database error:', err);
          return res.status(500).json({ message: 'Server error creating appointment' });
        }

        const appointmentId = this.lastID;

        // Add tests to appointment
        const testStmt = db.prepare(`
          INSERT INTO appointment_tests (appointmentId, testId, notes)
          VALUES (?, ?, ?)
        `);

        let completedTests = 0;
        tests.forEach(test => {
          testStmt.run([appointmentId, test.testId, test.notes || null], (err) => {
            if (err) {
              console.error('Database error adding test:', err);
            }
            completedTests++;
            
            if (completedTests === tests.length) {
              testStmt.finalize();
              res.status(201).json({
                message: 'Appointment created successfully',
                appointment: {
                  id: appointmentId,
                  patientId,
                  personnelId: req.user.id,
                  scheduledDate,
                  scheduledTime,
                  totalAmount,
                  notes
                }
              });
            }
          });
        });
      });

      stmt.finalize();
    });
  } catch (error) {
    console.error('Create appointment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update appointment status
router.put('/:id/status', [
  auth,
  requireRole(['personnel', 'admin']),
  body('status').isIn(['scheduled', 'in-progress', 'completed', 'cancelled']).withMessage('Invalid status')
], (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { status } = req.body;
    const db = req.app.locals.db;

    db.run('UPDATE appointments SET status = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?', [status, id], function(err) {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ message: 'Server error updating appointment' });
      }

      if (this.changes === 0) {
        return res.status(404).json({ message: 'Appointment not found' });
      }

      res.json({ message: 'Appointment status updated successfully' });
    });
  } catch (error) {
    console.error('Update appointment status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update appointment
router.put('/:id', [
  auth,
  requireRole(['personnel', 'admin']),
  body('scheduledDate').optional().isISO8601().withMessage('Valid scheduled date is required'),
  body('scheduledTime').optional().notEmpty().withMessage('Scheduled time is required')
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
      if (updates[key] !== undefined && key !== 'tests') {
        fields.push(`${key} = ?`);
        values.push(updates[key]);
      }
    });

    if (fields.length === 0) {
      return res.status(400).json({ message: 'No valid fields to update' });
    }

    values.push(id);
    const query = `UPDATE appointments SET ${fields.join(', ')}, updatedAt = CURRENT_TIMESTAMP WHERE id = ?`;

    db.run(query, values, function(err) {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ message: 'Server error updating appointment' });
      }

      if (this.changes === 0) {
        return res.status(404).json({ message: 'Appointment not found' });
      }

      res.json({ message: 'Appointment updated successfully' });
    });
  } catch (error) {
    console.error('Update appointment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
