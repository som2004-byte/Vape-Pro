const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, param, validationResult } = require('express-validator');

const { authorizeAdmin } = require('../middleware/auth');
const User = require('../models/User');
const Admin = require('../models/Admin');
const ClientRequirement = require('../models/ClientRequirement');
const Order = require('../models/Order');
const Product = require('../models/Product');
const Cart = require('../models/Cart');

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
    const user = await User.findByIdAndDelete(req.params.userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Optionally, you might want to delete associated data like cart, orders, etc.
    await Cart.deleteMany({ userId: user._id });
    await Order.updateMany(
      { user: user._id },
      { $set: { user: null } } // Or delete orders: await Order.deleteMany({ user: user._id });
    );

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Get client requirements error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get all orders (admin only)
router.get('/orders', authorizeAdmin, async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const query = {};

    if (status) {
      query.status = status;
    }

    const orders = await Order.find(query)
      .populate('userId', 'name email')
      .populate('items.product')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await Order.countDocuments(query);

    res.json({
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      totalOrders: count,
      orders,
    });
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get order by ID (admin only)
router.get('/orders/:id', authorizeAdmin, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('userId', 'name email phoneNumber address');
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    res.json(order);
  } catch (error) {
    console.error('Get order by ID error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update order status (admin only)
router.patch('/orders/:id/status', authorizeAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).populate('userId', 'name email phoneNumber address');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    res.json(order);
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get all products (admin only) for stock management
router.get('/products', authorizeAdmin, async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update product stock (admin only)
router.patch('/products/:id/stock', authorizeAdmin, async (req, res) => {
  try {
    const { stock } = req.body;
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { stock },
      { new: true }
    );
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    console.error('Update product stock error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
