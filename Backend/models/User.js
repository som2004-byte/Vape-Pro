const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: false // Optional for Google users
  },
  googleId: {
    type: String,
    unique: true,
    sparse: true // Only required if logging in via Google
  },
  // Optional fields for future email verification state
  emailVerified: {
    type: Boolean,
    default: false
  },
  phoneNumber: {
    type: String,
    default: ''
  },
  phoneVerified: {
    type: Boolean,
    default: false
  },
  address: {
    type: String,
    default: ''
  },
  addresses: [{
    label: String, // Home, Work, Other
    houseNo: String,
    building: String,
    landmark: String,
    receiverName: String,
    receiverPhone: String,
    isDefault: {
      type: Boolean,
      default: false
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('User', userSchema);
