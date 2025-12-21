const express = require('express');
const bcrypt = require('bcryptjs');
const { body, validationResult } = require('express-validator');
const { authenticateToken, getOrCreateCart } = require('../middleware/auth');
const User = require('../models/User');
const Cart = require('../models/Cart');
const Order = require('../models/Order');

const router = express.Router();

// Get user profile
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    // We already have the user from the auth middleware
    const user = await User.findById(req.user._id).select('-password');
    res.json(user);
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update user profile
router.put(
  '/profile',
  authenticateToken,
  [
    body('name').optional().trim().notEmpty(),
    body('phone').optional().trim(),
    body('address').optional().trim(),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const updates = {};
      const { name, phone, address } = req.body;

      if (name) updates.name = name;
      if (phone) updates.phone = phone;
      if (address) updates.address = address;

      const user = await User.findByIdAndUpdate(
        req.user._id,
        { $set: updates },
        { new: true, runValidators: true }
      ).select('-password');

      res.json({
        message: 'Profile updated successfully',
        user,
      });
    } catch (error) {
      console.error('Profile update error:', error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
);

// Change password
router.put(
  '/change-password',
  authenticateToken,
  [
    body('currentPassword').exists(),
    body('newPassword').isLength({ min: 6 }),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { currentPassword, newPassword } = req.body;
      const user = await User.findById(req.user._id);

      // Verify current password
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return res.status(400).json({ message: 'Current password is incorrect' });
      }

      // Update password
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      user.password = hashedPassword;
      await user.save();

      res.json({ message: 'Password updated successfully' });
    } catch (error) {
      console.error('Password change error:', error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
);

// Get user's cart
router.get('/cart', authenticateToken, getOrCreateCart, async (req, res) => {
  try {
    await req.cart.populate('items.product');
    res.json(req.cart);
  } catch (error) {
    console.error('Get cart error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Add item to cart
router.post(
  '/cart/items',
  authenticateToken,
  getOrCreateCart,
  [
    body('productId').isMongoId(),
    body('quantity').isInt({ min: 1 }),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { productId, quantity } = req.body;
      const cart = req.cart;
      
      // Check if item already exists in cart
      const existingItem = cart.items.find(
        item => item.product.toString() === productId
      );

      if (existingItem) {
        // Update quantity if item exists
        existingItem.quantity += quantity;
      } else {
        // Add new item to cart
        cart.items.push({ product: productId, quantity });
      }

      // Recalculate total (simplified - in a real app, you'd get the price from the product)
      cart.total = cart.items.reduce((total, item) => {
        return total + (item.quantity * (item.product?.price || 0));
      }, 0);

      await cart.save();
      await cart.populate('items.product');
      
      res.status(201).json({
        message: 'Item added to cart',
        cart,
      });
    } catch (error) {
      console.error('Add to cart error:', error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
);

// Remove item from cart
router.delete(
  '/cart/items/:itemId',
  authenticateToken,
  getOrCreateCart,
  async (req, res) => {
    try {
      const { itemId } = req.params;
      const cart = req.cart;

      // Find and remove the item
      const itemIndex = cart.items.findIndex(
        item => item._id.toString() === itemId
      );

      if (itemIndex === -1) {
        return res.status(404).json({ message: 'Item not found in cart' });
      }

      cart.items.splice(itemIndex, 1);
      
      // Recalculate total
      cart.total = cart.items.reduce((total, item) => {
        return total + (item.quantity * (item.product?.price || 0));
      }, 0);

      await cart.save();
      await cart.populate('items.product');
      
      res.json({
        message: 'Item removed from cart',
        cart,
      });
    } catch (error) {
      console.error('Remove from cart error:', error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
);

// Get user's orders
router.get('/orders', authenticateToken, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .populate('items.product');
    
    res.json(orders);
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create a new order
router.post(
  '/orders',
  authenticateToken,
  getOrCreateCart,
  [
    body('shippingAddress').optional().trim(),
    body('paymentMethod').isIn(['cod', 'card']),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { shippingAddress, paymentMethod } = req.body;
      const cart = req.cart;

      if (cart.items.length === 0) {
        return res.status(400).json({ message: 'Cart is empty' });
      }

      // Create order
      const order = new Order({
        user: req.user._id,
        items: cart.items.map(item => ({
          product: item.product,
          quantity: item.quantity,
          price: item.product?.price || 0,
        })),
        total: cart.total,
        shippingAddress: shippingAddress || req.user.address,
        paymentMethod,
        status: paymentMethod === 'cod' ? 'pending' : 'processing',
      });

      await order.save();
      
      // Clear the cart
      cart.items = [];
      cart.total = 0;
      await cart.save();

      res.status(201).json({
        message: 'Order created successfully',
        order,
      });
    } catch (error) {
      console.error('Create order error:', error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
);

// Get order details
router.get('/orders/:orderId', authenticateToken, async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.orderId,
      user: req.user._id,
    }).populate('items.product');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json(order);
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
