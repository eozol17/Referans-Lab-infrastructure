const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  personnel: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  scheduledDate: {
    type: Date,
    required: true
  },
  scheduledTime: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['scheduled', 'in-progress', 'completed', 'cancelled'],
    default: 'scheduled'
  },
  tests: [{
    test: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Test',
      required: true
    },
    status: {
      type: String,
      enum: ['pending', 'in-progress', 'completed'],
      default: 'pending'
    },
    notes: String
  }],
  totalAmount: {
    type: Number,
    required: true
  },
  notes: String
}, {
  timestamps: true
});

module.exports = mongoose.model('Appointment', appointmentSchema);
