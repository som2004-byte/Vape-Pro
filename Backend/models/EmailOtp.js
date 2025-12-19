const mongoose = require('mongoose');

const emailOtpSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
    index: true
  },
  codeHash: {
    type: String,
    required: true
  },
  expiresAt: {
    type: Date,
    required: true
  },
  attempts: {
    type: Number,
    default: 0
  },
  requestedAt: {
    type: Date,
    default: Date.now
  },
  purpose: {
    type: String,
    enum: ['login', 'signup', 'generic'],
    default: 'generic'
  }
});

module.exports = mongoose.model('EmailOtp', emailOtpSchema);
