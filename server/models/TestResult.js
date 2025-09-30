const mongoose = require('mongoose');

const testResultSchema = new mongoose.Schema({
  appointment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment',
    required: true
  },
  test: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Test',
    required: true
  },
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  technician: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  resultValue: {
    type: String,
    required: true
  },
  unit: String,
  normalRange: String,
  status: {
    type: String,
    enum: ['normal', 'abnormal', 'critical'],
    required: true
  },
  comments: String,
  attachments: [{
    filename: String,
    filePath: String,
    fileType: String
  }],
  completedAt: {
    type: Date,
    default: Date.now
  },
  isApproved: {
    type: Boolean,
    default: false
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  approvedAt: Date
}, {
  timestamps: true
});

module.exports = mongoose.model('TestResult', testResultSchema);
