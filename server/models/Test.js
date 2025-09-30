const mongoose = require('mongoose');

const testSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    required: true,
    enum: ['microbiology', 'vitamin', 'biochemistry', 'hematology', 'immunology']
  },
  description: {
    type: String,
    required: true
  },
  preparationInstructions: {
    type: String,
    required: true
  },
  normalRange: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  estimatedDuration: {
    type: Number, // in hours
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Test', testSchema);
