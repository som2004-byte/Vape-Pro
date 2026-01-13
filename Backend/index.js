// Vape-Pro Backend - Fixed orders endpoint - Triggering redeploy
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
const { authenticateToken } = require('./middleware/auth');
const adminRoutes = require('./routes/admin');
const orderRoutes = require('./routes/order');
const cartRoutes = require('./routes/cart');

const app = express();

const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
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

// Configure CORS
app.use(cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Log requests
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
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
  mailTransporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT || (SMTP_SECURE ? 465 : 587),
    secure: SMTP_SECURE,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
    connectionTimeout: 5000,
    greetingTimeout: 5000,
    socketTimeout: 8000,
  });
}

// Helpers
const sendOtpEmail = async (toEmail, code) => {
  if (!mailTransporter) throw new Error('Mail transport not configured');
  const html = `<div style="font-family: Arial; color: #111;"><h2>Your Verification Code</h2><div style="font-size: 24px; font-weight: bold;">${code}</div></div>`;
  await Promise.race([
    mailTransporter.sendMail({ from: SMTP_FROM || SMTP_USER, to: toEmail, subject: 'Your verification code', html }),
    new Promise((_, reject) => setTimeout(() => reject(new Error('Email send timeout')), 15000)),
  ]);
};

// --- ROUTES ---

app.get('/api/im-alive', (req, res) => res.json({ message: 'Server is updated and routes are ready' }));

app.post('/api/signup', async (req, res) => {
  try {
    const { email, password, name } = req.body;
    if (!email || !password || !name) return res.status(400).json({ message: 'All fields required' });
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'User already exists' });
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ email, name, password: hashedPassword });
    await user.save();
    const token = jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, { expiresIn: '24h' });
    res.status(201).json({ token, user: { id: user._id, email: user.email, name: user.name } });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) return res.status(401).json({ message: 'Invalid credentials' });
    const token = jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, { expiresIn: '24h' });
    res.json({ token, user: { id: user._id, email: user.email, name: user.name } });
  } catch (error) { res.status(500).json({ error: error.message }); }
});



// Use order routes
app.use('/api/orders', orderRoutes);

// Use cart routes
app.use('/api/cart', cartRoutes);

app.get('/api/account', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ id: user._id, name: user.name, email: user.email, address: user.address || '' });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

app.put('/api/account', authenticateToken, async (req, res) => {
  try {
    const { name, address, phoneNumber } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (name) user.name = name;
    if (address !== undefined) user.address = address;
    if (phoneNumber !== undefined) user.phoneNumber = phoneNumber;
    if (req.body.emailVerified !== undefined) user.emailVerified = req.body.emailVerified;
    if (req.body.phoneVerified !== undefined) user.phoneVerified = req.body.phoneVerified;
    if (req.body.password) {
      if (req.body.password.length < 6) return res.status(400).json({ message: 'Password must be at least 6 characters' });
      user.password = await bcrypt.hash(req.body.password, 10);
    }

    await user.save();

    res.json({
      message: 'Profile updated',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        address: user.address,
        phoneNumber: user.phoneNumber,
        emailVerified: user.emailVerified,
        phoneVerified: user.phoneVerified
      }
    });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// Alias for user profile (used by some frontends)
app.get('/api/user/profile', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id || req.user._id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ id: user._id, name: user.name, email: user.email, address: user.address || '' });
  } catch (error) { res.status(500).json({ error: error.message }); }
});
app.use('/api/admin', adminRoutes);

// OTP Routes
app.post('/api/request-email-otp', async (req, res) => {
  try {
    const { email } = req.body;
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
    await EmailOtp.findOneAndUpdate({ email }, { codeHash: await bcrypt.hash(code, 10), expiresAt }, { upsert: true });
    try {
      console.log(`Attempting to send OTP to ${email}...`);
      await sendOtpEmail(email, code);
      console.log(`OTP sent successfully to ${email}`);
      res.json({ message: 'OTP sent' });
    } catch (emailError) {
      console.error('Email Send Error:', emailError);
      res.status(503).json({ message: 'Email service unavailable. Please try again later.', error: emailError.message, dev_otp: code });
    }
  } catch (error) { res.status(500).json({ error: error.message }); }
});

app.post('/api/verify-email-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;
    const record = await EmailOtp.findOne({ email });
    if (!record || record.expiresAt < Date.now() || !(await bcrypt.compare(otp, record.codeHash))) return res.status(400).json({ message: 'Invalid/Expired OTP' });
    await EmailOtp.deleteOne({ email });
    const user = await User.findOne({ email });
    if (user) {
      user.emailVerified = true; await user.save();
      const token = jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, { expiresIn: '24h' });
      return res.json({ verified: true, token, user: { id: user._id, email: user.email, name: user.name } });
    }
    res.json({ verified: true });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

const seedAdminIfNeeded = async () => {
  if (!ADMIN_EMAIL || !ADMIN_PASSWORD) return;
  const existing = await Admin.findOne({ email: ADMIN_EMAIL });
  if (!existing) await new Admin({ email: ADMIN_EMAIL, name: 'Admin', password: await bcrypt.hash(ADMIN_PASSWORD, 10) }).save();
};

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: 'Server error', error: err.message });
});

app.use((req, res) => res.status(404).json({ message: `Route ${req.method} ${req.url} not found` }));

app.listen(PORT, async () => {
  console.log(`🚀 Server running on port ${PORT}`);
  await seedAdminIfNeeded();
});
