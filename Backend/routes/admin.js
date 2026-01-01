const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');

const { authorizeAdmin } = require('../middleware/auth');
const User = require('../models/User');
const Admin = require('../models/Admin');
const ClientRequirement = require('../models/ClientRequirement');

const router = express.Router();
console.log('🛡️ Admin router initialized');

// Admin login
router.post(
  '/login',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').exists(),
  ],
  async (req, res) => {
    console.log('🔑 Admin login request:', req.body.email);
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { email, password } = req.body;

      // Find admin
      const admin = await Admin.findOne({ email });
      if (!admin) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      // Check password
      const isMatch = await bcrypt.compare(password, admin.password);
      if (!isMatch) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      // Generate JWT
      const token = jwt.sign(
        { id: admin._id, email: admin.email, isAdmin: true },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '24h' }
      );

      res.json({
        message: 'Admin login successful',
        token,
        admin: { id: admin._id, email: admin.email, name: admin.name },
      });
    } catch (error) {
      console.error('Admin login error:', error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
);

// Admin signup
router.post(
  '/signup',
  [
    body('name').trim().notEmpty(),
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 6 }),
  ],
  async (req, res) => {
    console.log('📝 Admin signup request:', req.body.email);
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { name, email, password } = req.body;

      const existingAdmin = await Admin.findOne({ email });
      if (existingAdmin) {
        return res.status(400).json({ message: 'Admin account already exists' });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const admin = new Admin({
        name,
        email,
        password: hashedPassword,
      });

      await admin.save();

      res.status(201).json({
        message: 'Admin account created successfully',
        admin: { id: admin._id, email: admin.email, name: admin.name },
      });
    } catch (error) {
      console.error('Admin signup error:', error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
);

// Get all users (admin only)
router.get('/users', authorizeAdmin, async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get dashboard stats (admin only)
router.get('/stats', authorizeAdmin, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalRequirements = await ClientRequirement.countDocuments();
    const pendingRequirements = await ClientRequirement.countDocuments({ status: 'New' });

    res.json({
      totalUsers,
      totalRequirements,
      pendingRequirements,
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get client requirements (admin only)
router.get('/client-requirements', authorizeAdmin, async (req, res) => {
  try {
    const requirements = await ClientRequirement.find().sort({ createdAt: -1 });
    res.json(requirements);
  } catch (error) {
    console.error('Get client requirements error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
