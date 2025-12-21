const express = require('express');
const { body, param } = require('express-validator');
const { authenticateToken, getOrCreateCart } = require('../middleware/auth');
const Cart = require('../models/Cart');
const Product = require('../models/Product');

const router = express.Router();

// Get cart
router.get('/', authenticateToken, getOrCreateCart, async (req, res) => {
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
  '/items',
  authenticateToken,
  getOrCreateCart,
  [
    body('productId').isMongoId().withMessage('Valid product ID is required'),
    body('quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { productId, quantity } = req.body;
      const cart = req.cart;
      
      // Check if product exists and is in stock
      const product = await Product.findById(productId);
      if (!product) {
        return res.status(404).json({ message: 'Product not found' });
      }
      
      if (product.stock < quantity) {
        return res.status(400).json({ 
          message: `Only ${product.stock} items available in stock` 
        });
      }

      // Check if item already exists in cart
      const existingItem = cart.items.find(
        item => item.product.toString() === productId
      );

      if (existingItem) {
        // Check if adding more than available stock
        if (product.stock < existingItem.quantity + quantity) {
          return res.status(400).json({ 
            message: `Cannot add ${quantity} more items. Only ${product.stock - existingItem.quantity} available.`
          });
        }
        
        // Update quantity if item exists
        existingItem.quantity += quantity;
      } else {
        // Add new item to cart
        cart.items.push({ 
          product: productId, 
          quantity,
          price: product.price // Store price at time of adding to cart
        });
      }

      // Recalculate total
      await cart.calculateTotal();
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

// Update cart item quantity
router.put(
  '/items/:itemId',
  authenticateToken,
  getOrCreateCart,
  [
    param('itemId').isMongoId().withMessage('Valid item ID is required'),
    body('quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { itemId } = req.params;
      const { quantity } = req.body;
      const cart = req.cart;

      // Find the item in cart
      const item = cart.items.id(itemId);
      if (!item) {
        return res.status(404).json({ message: 'Item not found in cart' });
      }
      
      // Check if product is still available
      const product = await Product.findById(item.product);
      if (!product) {
        return res.status(404).json({ message: 'Product not found' });
      }
      
      // Check if requested quantity is available in stock
      if (product.stock < quantity) {
        return res.status(400).json({ 
          message: `Only ${product.stock} items available in stock` 
        });
      }

      // Update quantity
      item.quantity = quantity;
      
      // Recalculate total
      await cart.calculateTotal();
      await cart.save();
      
      await cart.populate('items.product');
      
      res.json({
        message: 'Cart updated',
        cart,
      });
    } catch (error) {
      console.error('Update cart error:', error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
);

// Remove item from cart
router.delete(
  '/items/:itemId',
  authenticateToken,
  getOrCreateCart,
  [
    param('itemId').isMongoId().withMessage('Valid item ID is required'),
  ],
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
      await cart.calculateTotal();
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

// Clear cart
router.delete('/', authenticateToken, getOrCreateCart, async (req, res) => {
  try {
    const cart = req.cart;
    
    cart.items = [];
    cart.total = 0;
    
    await cart.save();
    
    res.json({
      message: 'Cart cleared',
      cart,
    });
  } catch (error) {
    console.error('Clear cart error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Apply coupon code (placeholder implementation)
router.post(
  '/apply-coupon',
  authenticateToken,
  getOrCreateCart,
  [
    body('code').trim().notEmpty().withMessage('Coupon code is required'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { code } = req.body;
      const cart = req.cart;

      // In a real app, you would validate the coupon code against a database
      // and apply the appropriate discount
      // This is a simplified example
      
      if (code === 'DISCOUNT10') {
        cart.discount = {
          code: 'DISCOUNT10',
          amount: (cart.total * 0.1).toFixed(2), // 10% discount
          type: 'percentage',
          value: 10
        };
        cart.totalAfterDiscount = (cart.total - cart.discount.amount).toFixed(2);
        
        await cart.save();
        
        return res.json({
          message: 'Coupon applied successfully',
          cart,
        });
      } else {
        return res.status(400).json({ 
          message: 'Invalid or expired coupon code' 
        });
      }
    } catch (error) {
      console.error('Apply coupon error:', error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
);

// Remove coupon
router.delete('/remove-coupon', authenticateToken, getOrCreateCart, async (req, res) => {
  try {
    const cart = req.cart;
    
    if (!cart.discount) {
      return res.status(400).json({ message: 'No coupon applied' });
    }
    
    cart.discount = undefined;
    cart.totalAfterDiscount = undefined;
    
    await cart.save();
    
    res.json({
      message: 'Coupon removed',
      cart,
    });
  } catch (error) {
    console.error('Remove coupon error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get cart count (number of items)
router.get('/count', authenticateToken, getOrCreateCart, async (req, res) => {
  try {
    const itemCount = req.cart.items.reduce(
      (total, item) => total + item.quantity, 
      0
    );
    
    res.json({ count: itemCount });
  } catch (error) {
    console.error('Get cart count error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
