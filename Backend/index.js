const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const mongoose = require('mongoose');
const nodemailer = require('nodemailer');
require('dotenv').config();

const User = require('./models/User');
const EmailOtp = require('./models/EmailOtp');
const Admin = require('./models/Admin');
const adminRoutes = require('./routes/admin');

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
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Configure CORS (Temporarily permissive for debugging)
app.use(cors({
  origin: true, // Allow all origins
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Log requests for debugging
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url} - Origin: ${req.headers.origin}`);
  next();
});

// Use Admin Routes
console.log('📡 Registering admin routes...');
app.use('/api/admin', adminRoutes);
console.log('✅ Admin routes registered');

// Route inspection helper
app.get('/api/debug-routes', (req, res) => {
  const routes = [];
  app._router.stack.forEach((middleware) => {
    if (middleware.route) {
      routes.push(`${Object.keys(middleware.route.methods).join(',').toUpperCase()} ${middleware.route.path}`);
    } else if (middleware.name === 'router') {
      middleware.handle.stack.forEach((handler) => {
        if (handler.route) {
          const path = middleware.regexp.source.replace('\\/?(?=\\/|$)', '').replace('^\\/', '/') + handler.route.path;
          routes.push(`${Object.keys(handler.route.methods).join(',').toUpperCase()} ${path}`);
        }
      });
    }
  });
  res.json(routes);
});

// MongoDB Connection
if (typeof MONGODB_URI === 'string' && MONGODB_URI.trim()) {
  mongoose
    .connect(MONGODB_URI.trim())
    .then(() => console.log('✅ Connected to MongoDB'))
    .catch((err) => console.error('❌ MongoDB connection error:', err));
}

// Mail transporter
let mailTransporter = null;
if (SMTP_HOST && SMTP_USER && SMTP_PASS) {
  const fromEmail = SMTP_FROM || SMTP_USER; // Fallback to user email if FROM is not set

  mailTransporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT || (SMTP_SECURE ? 465 : 587),
    secure: SMTP_SECURE, // true for 465, false for other ports
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS
    }
  });

  // Verify connection configuration
  console.log(`[SMTP] Attempting to connect to ${SMTP_HOST}:${SMTP_PORT || (SMTP_SECURE ? 465 : 587)}...`);
  mailTransporter.verify((error, success) => {
    if (error) {
      console.error('❌ SMTP Connection Error:', error);
      console.error('   Hint: If using Gmail, use port 465 with SMTP_SECURE=true. If using port 587, set SMTP_SECURE=false.');
    } else {
      console.log('✅ SMTP Server is ready to take our messages');
    }
  });
} else {
  const missing = [];
  if (!SMTP_HOST) missing.push('SMTP_HOST');
  if (!SMTP_USER) missing.push('SMTP_USER');
  if (!SMTP_PASS) missing.push('SMTP_PASS');
  if (missing.length > 0) {
    console.warn(`⚠️ SMTP is not fully configured. Missing: ${missing.join(', ')}. Email features will be disabled.`);
  }
}

const sendOtpEmail = async (toEmail, code) => {
  if (!mailTransporter) throw new Error('Mail transport not configured');
  const html = `
    <div style="font-family: Arial, sans-serif; color: #111;">
      <h2>Your Verification Code</h2>
      <p>Use the following code to verify your email:</p>
      <div style="font-size: 24px; font-weight: bold; letter-spacing: 4px;">${code}</div>
      <p>This code expires in 10 minutes.</p>
    </div>
  `;
  const fromEmail = SMTP_FROM || SMTP_USER;
  try {
    await mailTransporter.sendMail({
      from: fromEmail,
      to: toEmail,
      subject: 'Your verification code',
      html
    });
  } catch (error) {
    console.error('❌ Failed to send OTP email:', error);
    throw error;
  }
};

const isValidEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

// User Signup
app.post('/api/signup', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ name, email, password: hashedPassword });
    await user.save();

    const token = jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, { expiresIn: '24h' });
    res.status(201).json({ message: 'User created', token, user: { id: user._id, name: user.name, email: user.email } });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// User Login
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, { expiresIn: '24h' });
    res.json({ message: 'Login successful', token, user: { id: user._id, name: user.name, email: user.email } });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Authentication Middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ message: 'Access token required' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: 'Invalid or expired token' });
    req.user = user;
    next();
  });
};

// Routes
app.get('/', (req, res) => {
  res.send('Backend is running!');
});

app.get('/api/profile', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
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
    const { name, phoneNumber, address, emailVerified, phoneVerified } = req.body || {};
    const updates = {};
    if (typeof name === 'string' && name.trim()) updates.name = name.trim();
    if (typeof phoneNumber === 'string') updates.phoneNumber = phoneNumber.trim();
    if (typeof address === 'string') updates.address = address.trim();
    if (typeof emailVerified === 'boolean') updates.emailVerified = emailVerified;
    if (typeof phoneVerified === 'boolean') updates.phoneVerified = phoneVerified;

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
    if (!mailTransporter) return res.status(500).json({ message: 'Email service not configured' });

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const codeHash = await bcrypt.hash(code, 10);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await EmailOtp.findOneAndUpdate(
      { email },
      { codeHash, expiresAt, attempts: 0, requestedAt: new Date(), purpose },
      { upsert: true, new: true, setDefaultsOnInsert: true, runValidators: true }
    );

    await sendOtpEmail(email, code);
    res.json({ message: 'OTP sent to email' });
  } catch (error) {
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
    if (!record) return res.status(400).json({ message: 'No OTP found for this email' });
    if (record.expiresAt.getTime() < Date.now()) return res.status(400).json({ message: 'OTP expired' });

    const ok = await bcrypt.compare(otp, record.codeHash);
    if (!ok) {
      record.attempts += 1;
      await record.save();
      return res.status(401).json({ message: 'Invalid OTP' });
    }

    await EmailOtp.deleteOne({ _id: record._id });

    const user = await User.findOne({ email });
    if (user) {
      if (!user.emailVerified) {
        user.emailVerified = true;
        await user.save();
      }
      const token = jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, { expiresIn: '24h' });
      return res.json({ message: 'OTP verified', verified: true, token, user: { id: user._id, email: user.email, name: user.name } });
    }

    res.json({ message: 'OTP verified', verified: true });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});


// Optional seed admin on startup
const seedAdminIfNeeded = async () => {
  if (!ADMIN_EMAIL || !ADMIN_PASSWORD) return; // skip when not configured
  const existing = await Admin.findOne({ email: ADMIN_EMAIL });
  if (existing) return;
  const hashed = await bcrypt.hash(ADMIN_PASSWORD, 10);
  await new Admin({ email: ADMIN_EMAIL, name: 'Administrator', password: hashed }).save();
  console.log('✅ Seeded default admin from env');
};

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ message: `Route ${req.method} ${req.url} not found` });
});

app.listen(PORT, async () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  await seedAdminIfNeeded().catch((e) => console.warn('Admin seed skipped:', e.message));
});
