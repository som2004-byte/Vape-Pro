const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const mongoose = require('mongoose');
const nodemailer = require('nodemailer');
require('dotenv').config();

const User = require('./models/User');
const EmailOtp = require('./models/EmailOtp');

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
mongoose.connect(MONGODB_URI)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch((err) => console.error('❌ MongoDB connection error:', err));

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

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
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