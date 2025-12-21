<<<<<<< Updated upstream
<<<<<<< Updated upstream
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const mongoose = require('mongoose');
const nodemailer = require('nodemailer');
require('dotenv').config();

const User = require('./models/User');
const EmailOtp = require('./models/EmailOtp');
const Cart = require('./models/Cart');
const Order = require('./models/Order');
const Admin = require('./models/Admin');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const MONGODB_URI = process.env.MONGODB_URI;
const SMTP_HOST = process.env.SMTP_HOST;
const SMTP_PORT = parseInt(process.env.SMTP_PORT || '0', 10) || undefined;
const SMTP_SECURE = String(process.env.SMTP_SECURE || '').toLowerCase() === 'true';
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;
const SMTP_FROM = process.env.SMTP_FROM;
const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

// Middleware
app.use(express.json());
app.use(cors());

// MongoDB Connection
if (typeof MONGODB_URI === 'string' && MONGODB_URI.trim()) {
  mongoose
    .connect(MONGODB_URI.trim())
    .then(() => console.log('✅ Connected to MongoDB'))
    .catch((err) => console.error('❌ MongoDB connection error:', err));
} else {
  console.warn('⚠️ MONGODB_URI is not set. Skipping MongoDB connection.');
}

// Mail transporter (configured via env)
let mailTransporter = null;
if (SMTP_HOST && SMTP_USER && SMTP_PASS && SMTP_FROM) {
  mailTransporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT || (SMTP_SECURE ? 465 : 587),
    secure: SMTP_SECURE || false,
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS
    }
  });
}

const sendOtpEmail = async (toEmail, code) => {
  if (!mailTransporter) throw new Error('Mail transport not configured');
  const html = `
    <div style="font-family: Arial, sans-serif; color: #111;">
      <h2>Your Verification Code</h2>
      <p>Use the following code to verify your email:</p>
      <div style="font-size: 24px; font-weight: bold; letter-spacing: 4px;">${code}</div>
      <p>This code expires in 10 minutes.</p>
      <p>If you did not request this, you can ignore this email.</p>
    </div>
  `;
  await mailTransporter.sendMail({
    from: SMTP_FROM,
    to: toEmail,
    subject: 'Your verification code',
    html
  });
};

const isValidEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

// Signup endpoint
app.post('/api/signup', async (req, res) => {
  try {
    const { email, password, name } = req.body;

    // Validation
    if (!email || !password || !name) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = new User({
      email,
      name,
      password: hashedPassword
    });

    await user.save();

    // Generate token
    const token = jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, {
      expiresIn: '24h'
    });

    res.status(201).json({
      message: 'User created successfully',
      token,
      user: { id: user._id, email: user.email, name: user.name }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Login endpoint
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate token
    const token = jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, {
      expiresIn: '24h'
    });

    res.json({
      message: 'Login successful',
      token,
      user: { id: user._id, email: user.email, name: user.name }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Middleware to verify token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// Admin-only middleware
const authenticateAdmin = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Access token required' });
  jwt.verify(token, JWT_SECRET, (err, payload) => {
    if (err) return res.status(403).json({ message: 'Invalid or expired token' });
    if (payload.role !== 'admin' || !payload.adminId) {
      return res.status(403).json({ message: 'Admin access required' });
    }
    req.admin = { id: payload.adminId, email: payload.email };
    next();
  });
};

// Protected route example
app.get('/api/profile', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ id: user._id, email: user.email, name: user.name });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.get('/', (req, res) => {
  res.send('Backend is running!');
});

// -----------------------------
// Admin auth
// -----------------------------

// Optional seed admin on startup
const seedAdminIfNeeded = async () => {
  if (!ADMIN_EMAIL || !ADMIN_PASSWORD) return; // skip when not configured
  const existing = await Admin.findOne({ email: ADMIN_EMAIL });
  if (existing) return;
  const hashed = await bcrypt.hash(ADMIN_PASSWORD, 10);
  await new Admin({ email: ADMIN_EMAIL, name: 'Administrator', password: hashed }).save();
  console.log('✅ Seeded default admin from env');
};
seedAdminIfNeeded().catch((e) => console.warn('Admin seed skipped:', e.message));

// Admin signup
app.post('/api/admin/signup', async (req, res) => {
  try {
    const { name, email, password } = req.body || {};
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email and password are required' });
    }
    const exists = await Admin.findOne({ email });
    if (exists) return res.status(400).json({ message: 'Admin already exists' });
    const hashed = await bcrypt.hash(password, 10);
    const admin = await new Admin({ name, email, password: hashed }).save();
    const token = jwt.sign({ adminId: admin._id, email: admin.email, role: 'admin' }, JWT_SECRET, { expiresIn: '24h' });
    res.status(201).json({ message: 'Admin created', token, admin: { id: admin._id, name: admin.name, email: admin.email } });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Admin login
app.post('/api/admin/login', async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) return res.status(400).json({ message: 'Email and password are required' });
    const admin = await Admin.findOne({ email });
    if (!admin) return res.status(401).json({ message: 'Invalid credentials' });
    const ok = await bcrypt.compare(password, admin.password);
    if (!ok) return res.status(401).json({ message: 'Invalid credentials' });
    const token = jwt.sign({ adminId: admin._id, email: admin.email, role: 'admin' }, JWT_SECRET, { expiresIn: '24h' });
    res.json({ message: 'Login successful', token, admin: { id: admin._id, name: admin.name, email: admin.email } });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Admin profile
app.get('/api/admin/me', authenticateAdmin, async (req, res) => {
  try {
    const admin = await Admin.findById(req.admin.id).select('-password');
    if (!admin) return res.status(404).json({ message: 'Admin not found' });
    res.json({ id: admin._id, name: admin.name, email: admin.email });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// -----------------------------
// Cart endpoints (JWT required)
// -----------------------------

// Helper to find or create a cart
const getOrCreateCart = async (userId) => {
  let cart = await Cart.findOne({ userId });
  if (!cart) {
    cart = new Cart({ userId, items: [] });
    await cart.save();
  }
  return cart;
};

// Get current user's cart
app.get('/api/cart', authenticateToken, async (req, res) => {
  try {
    const cart = await getOrCreateCart(req.user.id);
    res.json({ items: cart.items, count: cart.items.reduce((s, i) => s + i.quantity, 0) });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Add item to cart (or increase quantity if same product/variant exists)
app.post('/api/cart', authenticateToken, async (req, res) => {
  try {
    const { productId, name, price, image, flavor = '', series = '', quantity = 1 } = req.body || {};
    if (!productId || typeof price !== 'number') {
      return res.status(400).json({ message: 'productId and numeric price are required' });
    }
    const qty = Math.max(1, parseInt(quantity, 10) || 1);
    const cart = await getOrCreateCart(req.user.id);

    const idx = cart.items.findIndex(
      (it) => it.productId === productId && it.flavor === flavor && it.series === series
    );
    if (idx >= 0) {
      cart.items[idx].quantity += qty;
    } else {
      cart.items.push({ productId, name, price, image, flavor, series, quantity: qty });
    }
    cart.updatedAt = new Date();
    await cart.save();
    res.json({ message: 'Added to cart', items: cart.items });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update quantity of an item
app.put('/api/cart', authenticateToken, async (req, res) => {
  try {
    const { productId, flavor = '', series = '', quantity } = req.body || {};
    const qty = parseInt(quantity, 10);
    if (!productId || !Number.isInteger(qty) || qty < 1) {
      return res.status(400).json({ message: 'productId and quantity >= 1 are required' });
    }
    const cart = await getOrCreateCart(req.user.id);
    const idx = cart.items.findIndex(
      (it) => it.productId === productId && it.flavor === flavor && it.series === series
    );
    if (idx === -1) return res.status(404).json({ message: 'Item not found' });
    cart.items[idx].quantity = qty;
    cart.updatedAt = new Date();
    await cart.save();
    res.json({ message: 'Quantity updated', items: cart.items });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Remove an item from cart
app.delete('/api/cart/item', authenticateToken, async (req, res) => {
  try {
    const { productId, flavor = '', series = '' } = req.body || {};
    if (!productId) return res.status(400).json({ message: 'productId required' });
    const cart = await getOrCreateCart(req.user.id);
    const before = cart.items.length;
    cart.items = cart.items.filter(
      (it) => !(it.productId === productId && it.flavor === flavor && it.series === series)
    );
    if (cart.items.length === before) return res.status(404).json({ message: 'Item not found' });
    cart.updatedAt = new Date();
    await cart.save();
    res.json({ message: 'Item removed', items: cart.items });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Clear the cart
app.delete('/api/cart', authenticateToken, async (req, res) => {
  try {
    const cart = await getOrCreateCart(req.user.id);
    cart.items = [];
    cart.updatedAt = new Date();
    await cart.save();
    res.json({ message: 'Cart cleared', items: cart.items });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

// Account details
app.get('/api/account', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      emailVerified: user.emailVerified,
      phoneNumber: user.phoneNumber || '',
      phoneVerified: user.phoneVerified || false,
      address: user.address || ''
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// -----------------------------
// Orders (user)
// -----------------------------

// Create order from cart and clear cart
app.post('/api/orders/checkout', authenticateToken, async (req, res) => {
  try {
    const { shippingAddress } = req.body || {};
    const cart = await getOrCreateCart(req.user.id);
    if (!cart.items.length) return res.status(400).json({ message: 'Cart is empty' });

    const total = cart.items.reduce((s, it) => s + (it.price || 0) * (it.quantity || 1), 0);

    let addressToUse = shippingAddress;
    if (!addressToUse) {
      const u = await User.findById(req.user.id);
      addressToUse = u?.address || '';
    }

    const order = await new Order({
      userId: req.user.id,
      items: cart.items.map(i => ({ ...i.toObject?.() || i })),
      total,
      status: 'processing',
      paymentStatus: 'cod',
      paymentMethod: 'cod',
      shippingAddress: addressToUse,
      createdAt: new Date(),
      updatedAt: new Date()
    }).save();

    // Clear cart after order
    cart.items = [];
    cart.updatedAt = new Date();
    await cart.save();

    res.status(201).json({ message: 'Order placed', orderId: order._id, total, status: order.status, payment: { method: 'cod', status: 'cod' } });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// List current user's orders
app.get('/api/orders', authenticateToken, async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json({ orders });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.put('/api/account', authenticateToken, async (req, res) => {
  try {
    const { name, phoneNumber, address } = req.body || {};
    const updates = {};
    if (typeof name === 'string' && name.trim()) updates.name = name.trim();
    if (typeof phoneNumber === 'string') updates.phoneNumber = phoneNumber.trim();
    if (typeof address === 'string') updates.address = address.trim();

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: updates },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      emailVerified: user.emailVerified,
      phoneNumber: user.phoneNumber || '',
      phoneVerified: user.phoneVerified || false,
      address: user.address || ''
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Request Email OTP
app.post('/api/request-email-otp', async (req, res) => {
  try {
    const { email, purpose = 'generic' } = req.body;
    if (!email || !isValidEmail(email)) {
      return res.status(400).json({ message: 'Valid email is required' });
    }

    if (!mailTransporter) {
      return res.status(500).json({ message: 'Email service not configured' });
    }

    // Basic rate limit: allow new OTP every 60s
    const existing = await EmailOtp.findOne({ email }).sort({ requestedAt: -1 });
    const now = Date.now();
    if (existing && existing.requestedAt && now - existing.requestedAt.getTime() < 60 * 1000) {
      return res.status(429).json({ message: 'Please wait before requesting another code' });
    }

    // Create 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const codeHash = await bcrypt.hash(code, 10);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Upsert OTP doc
    await EmailOtp.findOneAndUpdate(
      { email },
      { codeHash, expiresAt, attempts: 0, requestedAt: new Date(), purpose },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    // Send email
    await sendOtpEmail(email, code);

    res.json({ message: 'OTP sent to email' });
  } catch (error) {
    console.error('OTP request error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Verify Email OTP
app.post('/api/verify-email-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !isValidEmail(email) || !otp) {
      return res.status(400).json({ message: 'Email and OTP are required' });
    }

    const record = await EmailOtp.findOne({ email });
    if (!record) {
      return res.status(400).json({ message: 'No OTP found for this email' });
    }

    if (record.expiresAt.getTime() < Date.now()) {
      return res.status(400).json({ message: 'OTP expired' });
    }

    if (record.attempts >= 5) {
      return res.status(429).json({ message: 'Too many attempts' });
    }

    const ok = await bcrypt.compare(otp, record.codeHash);
    if (!ok) {
      record.attempts += 1;
      await record.save();
      return res.status(401).json({ message: 'Invalid OTP' });
    }

    // Successful verification: cleanup OTP
    await EmailOtp.deleteOne({ _id: record._id });

    // If user exists, issue JWT (useful for login by OTP)
    const user = await User.findOne({ email });
    if (user) {
      if (!user.emailVerified) {
        user.emailVerified = true;
        await user.save();
      }
      const token = jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, { expiresIn: '24h' });
      return res.json({ message: 'OTP verified', verified: true, token, user: { id: user._id, email: user.email, name: user.name } });
    }

    // Otherwise just confirm verification (useful for signup verification)
    res.json({ message: 'OTP verified', verified: true });
  } catch (error) {
    console.error('OTP verify error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// -----------------------------
// Orders (admin)
// -----------------------------
app.get('/api/admin/orders', authenticateAdmin, async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 }).lean();
    // Attach user summary (name, email, address)
    const userIds = [...new Set(orders.map(o => String(o.userId)).filter(Boolean))];
    const users = await User.find({ _id: { $in: userIds } }, { name: 1, email: 1, address: 1, phoneNumber: 1 }).lean();
    const userMap = new Map(users.map(u => [String(u._id), u]));
    const enriched = orders.map(o => ({
      ...o,
      user: userMap.get(String(o.userId)) || null
    }));
    res.json({ orders: enriched });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.patch('/api/admin/orders/:id', authenticateAdmin, async (req, res) => {
  try {
    const { status, paymentStatus } = req.body || {};
    const updates = { updatedAt: new Date() };
    if (status) updates.status = status;
    if (paymentStatus) updates.paymentStatus = paymentStatus;
    const order = await Order.findByIdAndUpdate(req.params.id, { $set: updates }, { new: true });
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json({ message: 'Order updated', order });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
=======
=======
>>>>>>> Stashed changes
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const mongoose = require('mongoose');
const nodemailer = require('nodemailer');
require('dotenv').config();

const User = require('./models/User');
const EmailOtp = require('./models/EmailOtp');
const Admin = require('./models/Admin'); // Import Admin model
const Cart = require('./models/Cart');
const Order = require('./models/Order'); // Import Order model

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const MONGODB_URI = process.env.MONGODB_URI;
const SMTP_HOST = process.env.SMTP_HOST;
const SMTP_PORT = parseInt(process.env.SMTP_PORT || '0', 10) || undefined;
const SMTP_SECURE = String(process.env.SMTP_SECURE || '').toLowerCase() === 'true';
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;
const SMTP_FROM = process.env.SMTP_FROM;

// Middleware
app.use(express.json());
app.use(cors());

// MongoDB Connection
if (typeof MONGODB_URI === 'string' && MONGODB_URI.trim()) {
  mongoose
    .connect(MONGODB_URI.trim())
    .then(() => console.log('✅ Connected to MongoDB'))
    .catch((err) => console.error('❌ MongoDB connection error:', err));
} else {
  console.warn('⚠️ MONGODB_URI is not set. Skipping MongoDB connection.');
}

// Mail transporter (configured via env)
let mailTransporter = null;
if (SMTP_HOST && SMTP_USER && SMTP_PASS && SMTP_FROM) {
  mailTransporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT || (SMTP_SECURE ? 465 : 587),
    secure: SMTP_SECURE || false,
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS
    }
  });
}

const sendOtpEmail = async (toEmail, code) => {
  if (!mailTransporter) throw new Error('Mail transport not configured');
  const html = `
    <div style="font-family: Arial, sans-serif; color: #111;">
      <h2>Your Verification Code</h2>
      <p>Use the following code to verify your email:</p>
      <div style="font-size: 24px; font-weight: bold; letter-spacing: 4px;">${code}</div>
      <p>This code expires in 10 minutes.</p>
      <p>If you did not request this, you can ignore this email.</p>
    </div>
  `;
  await mailTransporter.sendMail({
    from: SMTP_FROM,
    to: toEmail,
    subject: 'Your verification code',
    html
  });
};

const isValidEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

// Signup endpoint
app.post('/api/signup', async (req, res) => {
  try {
    const { email, password, name } = req.body;

    // Validation
    if (!email || !password || !name) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = new User({
      email,
      name,
      password: hashedPassword
    });

    await user.save();

    // Generate token
    const token = jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, {
      expiresIn: '24h'
    });

    res.status(201).json({
      message: 'User created successfully',
      token,
      user: { id: user._id, email: user.email, name: user.name }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Login endpoint
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate token
    const token = jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, {
      expiresIn: '24h'
    });

    res.json({
      message: 'Login successful',
      token,
      user: { id: user._id, email: user.email, name: user.name }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Admin Login endpoint
app.post('/api/admin/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required' });
    }

    const admin = await Admin.findOne({ username });
    if (!admin) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isValidPassword = await admin.matchPassword(password);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: admin._id, username: admin.username, role: admin.role, isAdmin: true }, JWT_SECRET, {
      expiresIn: '24h'
    });

    res.json({
      message: 'Admin login successful',
      token,
      admin: { id: admin._id, username: admin.username, role: admin.role }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Middleware to verify token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// Middleware to verify admin token and role
const authorizeAdmin = (req, res, next) => {
  if (!req.user || !req.user.isAdmin) {
    return res.status(403).json({ message: 'Access denied: Admin privileges required' });
  }
  next();
};

// Protected route example
app.get('/api/profile', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ id: user._id, email: user.email, name: user.name });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Admin - Get all users
app.get('/api/admin/users', authenticateToken, authorizeAdmin, async (req, res) => {
  try {
    const users = await User.find({}).select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Admin - Get user by ID
app.get('/api/admin/users/:id', authenticateToken, authorizeAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Admin - Get all orders
app.get('/api/admin/orders', authenticateToken, authorizeAdmin, async (req, res) => {
  try {
    const orders = await Order.find({}).populate('userId', 'name email');
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Admin - Get order by ID
app.get('/api/admin/orders/:id', authenticateToken, authorizeAdmin, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('userId', 'name email');
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Admin - Update order status and transit info
app.put('/api/admin/orders/:id', authenticateToken, authorizeAdmin, async (req, res) => {
  try {
    const { orderStatus, transitInfo } = req.body;

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (orderStatus) {
      order.orderStatus = orderStatus;
    }
    // Assuming transitInfo is an array of updates or a string description
    // For now, let's update a simple transitInfo field
    if (transitInfo) {
      order.transitInfo = transitInfo; // Add transitInfo field to Order model later if not existing
    }
    order.updatedAt = new Date();
    await order.save();
    res.json({ message: 'Order updated successfully', order });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Admin - Get Client Requirements (placeholder)
app.get('/api/admin/client-requirements', authenticateToken, authorizeAdmin, async (req, res) => {
  try {
    // In a real application, this would fetch from a database or a configuration file.
    const requirements = [
      { id: 'req1', title: 'Feature X', description: 'Implement a new feature for product recommendations.', status: 'pending' },
      { id: 'req2', title: 'Bug Fix Y', description: 'Fix the cart calculation error.', status: 'in progress' }
    ];
    res.json(requirements);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.get('/', (req, res) => {
  res.send('Backend is running!');
});

// -----------------------------
// Cart endpoints (JWT required)
// -----------------------------

// Helper to find or create a cart
const getOrCreateCart = async (userId) => {
  let cart = await Cart.findOne({ userId });
  if (!cart) {
    cart = new Cart({ userId, items: [] });
    await cart.save();
  }
  return cart;
};

// Get current user's cart
app.get('/api/cart', authenticateToken, async (req, res) => {
  try {
    const cart = await getOrCreateCart(req.user.id);
    res.json({ items: cart.items, count: cart.items.reduce((s, i) => s + i.quantity, 0) });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Add item to cart (or increase quantity if same product/variant exists)
app.post('/api/cart', authenticateToken, async (req, res) => {
  try {
    const { productId, name, price, image, flavor = '', series = '', quantity = 1 } = req.body || {};
    if (!productId || typeof price !== 'number') {
      return res.status(400).json({ message: 'productId and numeric price are required' });
    }
    const qty = Math.max(1, parseInt(quantity, 10) || 1);
    const cart = await getOrCreateCart(req.user.id);

    const idx = cart.items.findIndex(
      (it) => it.productId === productId && it.flavor === flavor && it.series === series
    );
    if (idx >= 0) {
      cart.items[idx].quantity += qty;
    } else {
      cart.items.push({ productId, name, price, image, flavor, series, quantity: qty });
    }
    cart.updatedAt = new Date();
    await cart.save();
    res.json({ message: 'Added to cart', items: cart.items });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update quantity of an item
app.put('/api/cart', authenticateToken, async (req, res) => {
  try {
    const { productId, flavor = '', series = '', quantity } = req.body || {};
    const qty = parseInt(quantity, 10);
    if (!productId || !Number.isInteger(qty) || qty < 1) {
      return res.status(400).json({ message: 'productId and quantity >= 1 are required' });
    }
    const cart = await getOrCreateCart(req.user.id);
    const idx = cart.items.findIndex(
      (it) => it.productId === productId && it.flavor === flavor && it.series === series
    );
    if (idx === -1) return res.status(404).json({ message: 'Item not found' });
    cart.items[idx].quantity = qty;
    cart.updatedAt = new Date();
    await cart.save();
    res.json({ message: 'Quantity updated', items: cart.items });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Remove an item from cart
app.delete('/api/cart/item', authenticateToken, async (req, res) => {
  try {
    const { productId, flavor = '', series = '' } = req.body || {};
    if (!productId) return res.status(400).json({ message: 'productId required' });
    const cart = await getOrCreateCart(req.user.id);
    const before = cart.items.length;
    cart.items = cart.items.filter(
      (it) => !(it.productId === productId && it.flavor === flavor && it.series === series)
    );
    if (cart.items.length === before) return res.status(404).json({ message: 'Item not found' });
    cart.updatedAt = new Date();
    await cart.save();
    res.json({ message: 'Item removed', items: cart.items });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Clear the cart
app.delete('/api/cart', authenticateToken, async (req, res) => {
  try {
    const cart = await getOrCreateCart(req.user.id);
    cart.items = [];
    cart.updatedAt = new Date();
    await cart.save();
    res.json({ message: 'Cart cleared', items: cart.items });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

// TEMPORARY ADMIN CREATION ROUTE (REMOVE AFTER USE)
app.post('/api/create-admin', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required' });
    }

    const existingAdmin = await Admin.findOne({ username });
    if (existingAdmin) {
      return res.status(400).json({ message: 'Admin user already exists' });
    }

    const admin = new Admin({ username, password });
    await admin.save();
    res.status(201).json({ message: 'Admin user created successfully', admin: { id: admin._id, username: admin.username } });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Account details
app.get('/api/account', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      emailVerified: user.emailVerified,
      phoneNumber: user.phoneNumber || '',
      phoneVerified: user.phoneVerified || false,
      address: user.address || ''
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.put('/api/account', authenticateToken, async (req, res) => {
  try {
    const { name, phoneNumber, address } = req.body || {};
    const updates = {};
    if (typeof name === 'string' && name.trim()) updates.name = name.trim();
    if (typeof phoneNumber === 'string') updates.phoneNumber = phoneNumber.trim();
    if (typeof address === 'string') updates.address = address.trim();

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: updates },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      emailVerified: user.emailVerified,
      phoneNumber: user.phoneNumber || '',
      phoneVerified: user.phoneVerified || false,
      address: user.address || ''
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Request Email OTP
app.post('/api/request-email-otp', async (req, res) => {
  try {
    const { email, purpose = 'generic' } = req.body;
    if (!email || !isValidEmail(email)) {
      return res.status(400).json({ message: 'Valid email is required' });
    }

    if (!mailTransporter) {
      return res.status(500).json({ message: 'Email service not configured' });
    }

    // Basic rate limit: allow new OTP every 60s
    const existing = await EmailOtp.findOne({ email }).sort({ requestedAt: -1 });
    const now = Date.now();
    if (existing && existing.requestedAt && now - existing.requestedAt.getTime() < 60 * 1000) {
      return res.status(429).json({ message: 'Please wait before requesting another code' });
    }

    // Create 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const codeHash = await bcrypt.hash(code, 10);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Upsert OTP doc
    await EmailOtp.findOneAndUpdate(
      { email },
      { codeHash, expiresAt, attempts: 0, requestedAt: new Date(), purpose },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    // Send email
    await sendOtpEmail(email, code);

    res.json({ message: 'OTP sent to email' });
  } catch (error) {
    console.error('OTP request error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Verify Email OTP
app.post('/api/verify-email-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !isValidEmail(email) || !otp) {
      return res.status(400).json({ message: 'Email and OTP are required' });
    }

    const record = await EmailOtp.findOne({ email });
    if (!record) {
      return res.status(400).json({ message: 'No OTP found for this email' });
    }

    if (record.expiresAt.getTime() < Date.now()) {
      return res.status(400).json({ message: 'OTP expired' });
    }

    if (record.attempts >= 5) {
      return res.status(429).json({ message: 'Too many attempts' });
    }

    const ok = await bcrypt.compare(otp, record.codeHash);
    if (!ok) {
      record.attempts += 1;
      await record.save();
      return res.status(401).json({ message: 'Invalid OTP' });
    }

    // Successful verification: cleanup OTP
    await EmailOtp.deleteOne({ _id: record._id });

    // If user exists, issue JWT (useful for login by OTP)
    const user = await User.findOne({ email });
    if (user) {
      if (!user.emailVerified) {
        user.emailVerified = true;
        await user.save();
      }
      const token = jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, { expiresIn: '24h' });
      return res.json({ message: 'OTP verified', verified: true, token, user: { id: user._id, email: user.email, name: user.name } });
    }

    // Otherwise just confirm verification (useful for signup verification)
    res.json({ message: 'OTP verified', verified: true });
  } catch (error) {
    console.error('OTP verify error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
<<<<<<< Updated upstream
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
});