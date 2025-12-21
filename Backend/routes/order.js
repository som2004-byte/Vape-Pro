const express = require('express');
const { body, param } = require('express-validator');
const { authenticateToken, getOrCreateCart } = require('../middleware/auth');
const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const { sendOrderConfirmationEmail } = require('../utils/email');

const router = express.Router();

// Create a new order
router.post(
  '/',
  authenticateToken,
  getOrCreateCart,
  [
    body('shippingAddress').optional().trim(),
    body('paymentMethod').isIn(['cod', 'card']).withMessage('Invalid payment method'),
    body('paymentResult').optional().isObject(),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { shippingAddress, paymentMethod, paymentResult } = req.body;
      const cart = req.cart;
      const user = req.user;

      // Check if cart is empty
      if (cart.items.length === 0) {
        return res.status(400).json({ message: 'Cart is empty' });
      }

      // Verify product availability and calculate total
      let total = 0;
      const orderItems = [];
      
      for (const item of cart.items) {
        const product = await Product.findById(item.product);
        
        if (!product) {
          return res.status(400).json({ 
            message: `Product ${item.product} not found` 
          });
        }
        
        if (product.stock < item.quantity) {
          return res.status(400).json({ 
            message: `Not enough stock for ${product.name}. Only ${product.stock} available.`
          });
        }
        
        orderItems.push({
          product: product._id,
          name: product.name,
          image: product.images?.[0] || null,
          price: product.price,
          quantity: item.quantity,
        });
        
        total += product.price * item.quantity;
        
        // Reduce product stock
        product.stock -= item.quantity;
        await product.save();
      }

      // Apply discount if any
      let finalTotal = total;
      let discountAmount = 0;
      
      if (cart.discount) {
        if (cart.discount.type === 'percentage') {
          discountAmount = (total * cart.discount.value) / 100;
        } else if (cart.discount.type === 'fixed') {
          discountAmount = cart.discount.value;
        }
        
        finalTotal = Math.max(0, total - discountAmount);
      }

      // Create order
      const order = new Order({
        user: user._id,
        items: orderItems,
        shippingAddress: shippingAddress || user.address,
        paymentMethod,
        paymentResult,
        itemsPrice: total,
        taxPrice: 0, // You can calculate tax if needed
        shippingPrice: 0, // You can calculate shipping if needed
        discount: cart.discount ? {
          code: cart.discount.code,
          amount: discountAmount,
          type: cart.discount.type,
          value: cart.discount.value,
        } : null,
        totalPrice: finalTotal,
        isPaid: paymentMethod === 'card' && paymentResult?.status === 'succeeded',
        paidAt: paymentMethod === 'card' && paymentResult?.status === 'succeeded' 
          ? new Date() 
          : null,
      });

      const createdOrder = await order.save();
      
      // Clear the cart
      cart.items = [];
      cart.total = 0;
      cart.discount = undefined;
      cart.totalAfterDiscount = undefined;
      await cart.save();
      
      // Send order confirmation email
      try {
        await sendOrderConfirmationEmail(user.email, createdOrder);
      } catch (emailError) {
        console.error('Error sending order confirmation email:', emailError);
        // Don't fail the request if email fails
      }
      
      res.status(201).json({
        message: 'Order created successfully',
        order: createdOrder,
      });
    } catch (error) {
      console.error('Create order error:', error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
);

// Get all orders for logged in user
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    
    const orders = await Order.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('items.product', 'name price image');

    const count = await Order.countDocuments({ user: req.user._id });

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

// Get order by ID
router.get(
  '/:orderId',
  authenticateToken,
  [
    param('orderId').isMongoId().withMessage('Valid order ID is required'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const order = await Order.findOne({
        _id: req.params.orderId,
        user: req.user._id,
      }).populate('items.product', 'name price image');

      if (!order) {
        return res.status(404).json({ message: 'Order not found' });
      }

      res.json(order);
    } catch (error) {
      console.error('Get order error:', error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
);

// Update order to paid
router.put(
  '/:orderId/pay',
  authenticateToken,
  [
    param('orderId').isMongoId().withMessage('Valid order ID is required'),
    body('paymentResult').isObject().withMessage('Payment result is required'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { paymentResult } = req.body;
      
      const order = await Order.findOne({
        _id: req.params.orderId,
        user: req.user._id,
      });

      if (!order) {
        return res.status(404).json({ message: 'Order not found' });
      }

      if (order.isPaid) {
        return res.status(400).json({ message: 'Order is already paid' });
      }

      order.isPaid = true;
      order.paidAt = new Date();
      order.paymentResult = paymentResult;
      
      const updatedOrder = await order.save();
      
      res.json({
        message: 'Order paid successfully',
        order: updatedOrder,
      });
    } catch (error) {
      console.error('Update order to paid error:', error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
);

// Update order to delivered (admin only)
router.put(
  '/:orderId/deliver',
  authenticateToken,
  [
    param('orderId').isMongoId().withMessage('Valid order ID is required'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      
      // Check if user is admin
      const user = await User.findById(req.user._id);
      if (!user.isAdmin) {
        return res.status(403).json({ message: 'Admin access required' });
      }

      const order = await Order.findById(req.params.orderId);

      if (!order) {
        return res.status(404).json({ message: 'Order not found' });
      }

      if (!order.isPaid) {
        return res.status(400).json({ message: 'Order is not paid' });
      }

      if (order.isDelivered) {
        return res.status(400).json({ message: 'Order is already delivered' });
      }

      order.isDelivered = true;
      order.deliveredAt = new Date();
      
      const updatedOrder = await order.save();
      
      // Send delivery confirmation email
      try {
        const user = await User.findById(order.user);
        if (user) {
          await sendOrderDeliveredEmail(user.email, updatedOrder);
        }
      } catch (emailError) {
        console.error('Error sending delivery confirmation email:', emailError);
        // Don't fail the request if email fails
      }
      
      res.json({
        message: 'Order marked as delivered',
        order: updatedOrder,
      });
    } catch (error) {
      console.error('Update order to delivered error:', error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
);

// Cancel order
router.post(
  '/:orderId/cancel',
  authenticateToken,
  [
    param('orderId').isMongoId().withMessage('Valid order ID is required'),
    body('reason').optional().trim(),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { reason } = req.body;
      
      const order = await Order.findOne({
        _id: req.params.orderId,
        user: req.user._id,
      });

      if (!order) {
        return res.status(404).json({ message: 'Order not found' });
      }

      // Check if order can be cancelled
      if (order.status === 'cancelled') {
        return res.status(400).json({ message: 'Order is already cancelled' });
      }
      
      if (order.status === 'delivered') {
        return res.status(400).json({ 
          message: 'Cannot cancel an order that has been delivered' 
        });
      }

      // Update order status
      order.status = 'cancelled';
      order.cancellationReason = reason || 'Cancelled by user';
      order.cancelledAt = new Date();
      
      // If order was paid, process refund (in a real app, you would integrate with payment provider)
      if (order.isPaid) {
        // Process refund logic here
        order.refund = {
          amount: order.totalPrice,
          status: 'pending',
          requestedAt: new Date(),
        };
      }
      
      // Restore product stock
      for (const item of order.items) {
        await Product.updateOne(
          { _id: item.product },
          { $inc: { stock: item.quantity } }
        );
      }
      
      const updatedOrder = await order.save();
      
      // Send cancellation confirmation email
      try {
        const user = await User.findById(order.user);
        if (user) {
          await sendOrderCancellationEmail(user.email, updatedOrder, reason);
        }
      } catch (emailError) {
        console.error('Error sending cancellation email:', emailError);
        // Don't fail the request if email fails
      }
      
      res.json({
        message: 'Order cancelled successfully',
        order: updatedOrder,
      });
    } catch (error) {
      console.error('Cancel order error:', error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
);

// Get checkout session (for Stripe or other payment processors)
router.post(
  '/create-checkout-session',
  authenticateToken,
  getOrCreateCart,
  async (req, res) => {
    try {
      const cart = req.cart;
      
      if (cart.items.length === 0) {
        return res.status(400).json({ message: 'Cart is empty' });
      }
      
      // In a real app, you would integrate with Stripe or another payment processor here
      // This is a simplified example
      
      const lineItems = await Promise.all(cart.items.map(async (item) => {
        const product = await Product.findById(item.product);
        
        return {
          price_data: {
            currency: 'usd',
            product_data: {
              name: product.name,
              description: product.description,
              images: product.images,
            },
            unit_amount: Math.round(product.price * 100), // Convert to cents
          },
          quantity: item.quantity,
        };
      }));
      
      // Add shipping if needed
      if (cart.shippingPrice > 0) {
        lineItems.push({
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'Shipping',
              description: 'Shipping fee',
            },
            unit_amount: Math.round(cart.shippingPrice * 100),
          },
          quantity: 1,
        });
      }
      
      // Add discount if any
      if (cart.discount) {
        lineItems.push({
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'Discount',
              description: `Discount (${cart.discount.code})`,
            },
            unit_amount: -Math.round(cart.discount.amount * 100), // Negative amount for discount
          },
          quantity: 1,
        });
      }
      
      // In a real app, you would create a Stripe session here
      const session = {
        id: 'mock_session_id_' + Math.random().toString(36).substr(2, 9),
        url: 'https://checkout.stripe.com/pay/mock_payment_intent',
      };
      
      res.json({
        sessionId: session.id,
        url: session.url,
      });
    } catch (error) {
      console.error('Create checkout session error:', error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
);

// Webhook for payment confirmation (for Stripe or other payment processors)
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  try {
    // In a real app, you would verify the webhook signature here
    // and process the payment confirmation
    
    const sig = req.headers['stripe-signature'];
    let event;
    
    try {
      // Verify webhook signature (example for Stripe)
      // event = stripe.webhooks.constructEvent(
      //   req.body,
      //   sig,
      //   process.env.STRIPE_WEBHOOK_SECRET
      // );
      
      // For now, just parse the request body
      event = req.body;
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }
    
    // Handle the event
    switch (event.type) {
      case 'payment_intent.succeeded':
        // Update order status to paid
        const paymentIntent = event.data.object;
        const orderId = paymentIntent.metadata.orderId;
        
        if (orderId) {
          await Order.findByIdAndUpdate(orderId, {
            isPaid: true,
            paidAt: new Date(),
            'paymentResult': {
              id: paymentIntent.id,
              status: paymentIntent.status,
              update_time: new Date().toISOString(),
              email_address: paymentIntent.receipt_email,
            },
          });
        }
        break;
        
      // Handle other event types as needed
      
      default:
        console.log(`Unhandled event type ${event.type}`);
    }
    
    // Return a 200 response to acknowledge receipt of the event
    res.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ message: 'Webhook error', error: error.message });
  }
});

module.exports = router;
