// Vape-Pro Backend - Triggering redeploy for missing products route
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const mongoose = require('mongoose');
const nodemailer = require('nodemailer');

const { OAuth2Client } = require('google-auth-library');
require('dotenv').config();

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

if (!process.env.GOOGLE_CLIENT_ID) {
  console.error("❌ GOOGLE_CLIENT_ID is missing in Backend/.env! Google Login will fail.");
}

const User = require('./models/User');
const EmailOtp = require('./models/EmailOtp');
const Admin = require('./models/Admin');
const { authenticateToken } = require('./middleware/auth');
const adminRoutes = require('./routes/admin');
const orderRoutes = require('./routes/order');
const cartRoutes = require('./routes/cart');
const productRoutes = require('./routes/product');
const notificationRoutes = require('./routes/notification.js');
const Notification = require('./models/Notification.js');

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

// Telegram Configuration
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

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

const { sendTelegramNotification } = require('./utils/telegram');
const { sendOtpEmail, sendAdminNewUserEmail, sendWelcomeEmail } = require('./utils/email');

// --- ROUTES ---

app.get('/api/im-alive', (req, res) => res.json({ message: 'Server is updated (v2) and routes are ready', timestamp: new Date() }));

app.get('/api/debug-email', async (req, res) => {
  const logs = [];
  const log = (msg) => logs.push(`[${new Date().toISOString()}] ${msg}`);

  try {
    log('--- STARTING EMAIL DEBUG ---');
    log(`ADMIN_EMAIL: ${process.env.ADMIN_EMAIL || 'MISSING'}`);
    log(`SMTP_HOST: ${process.env.SMTP_HOST || 'MISSING'}`);
    log(`SMTP_PORT: ${process.env.SMTP_PORT || 'MISSING'}`);
    log(`SMTP_USER: ${process.env.SMTP_USER || 'MISSING'}`);
    log(`SMTP_PASS: ${process.env.SMTP_PASS ? 'PRESENT (First 3 chars: ' + process.env.SMTP_PASS.substring(0, 3) + '...)' : 'MISSING'}`);
    log(`SMTP_SECURE: ${process.env.SMTP_SECURE}`);

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '465'),
      secure: process.env.SMTP_SECURE === 'true' || parseInt(process.env.SMTP_PORT || '465') === 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
      tls: {
        rejectUnauthorized: false
      },
      family: 4, // Force IPv4
      connectionTimeout: 10000,
      debug: true,
      logger: true
    });

    log('Transporter created. Verifying connection...');
    await new Promise((resolve, reject) => {
      transporter.verify((error, success) => {
        if (error) {
          log(`❌ Verify Error: ${error.message}`);
          reject(error);
        } else {
          log('✅ Server is ready to take our messages');
          resolve(success);
        }
      });
    });

    log('Attempting to send test email...');
    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: process.env.ADMIN_EMAIL || process.env.SMTP_USER,
      subject: 'Debug Email Test from VapeSmart',
      text: 'If you are reading this, your email configuration is WORKING!',
      html: '<h1>Success!</h1><p>Your email configuration is working correctly.</p>'
    });

    log(`✅ Email sent: ${info.messageId}`);
    log(`Response: ${info.response}`);

    res.json({ success: true, logs });
  } catch (error) {
    log(`❌ CRITICAL FAILURE: ${error.message}`);
    res.status(500).json({ success: false, error: error.message, logs });
  }
});

app.post('/api/signup', async (req, res) => {
  try {
    const { email, password, name } = req.body;
    if (!email || !password || !name) return res.status(400).json({ message: 'All fields required' });
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'User already exists' });
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ email, name, password: hashedPassword });
    await user.save();

    // Notify Admin of new user
    sendTelegramNotification(`👤 *New User Signed Up*\nName: ${name}\nEmail: \`${email}\``);
    sendAdminNewUserEmail(user).catch(err => console.error('Failed to send admin signup email', err));
    sendWelcomeEmail(user.email, user.name).catch(err => console.error('Failed to send welcome email', err));

    // Get all admins
    const admins = await Admin.find({});
    for (const admin of admins) {
      await Notification.create({
        recipient: admin._id,
        recipientModel: 'Admin',
        type: 'system',
        title: 'New User Signup',
        message: `${name} (${email}) has just created an account.`,
        link: `/users/${user._id}`
      });
    }

    // Welcome Notification for User
    await Notification.create({
      recipient: user._id,
      recipientModel: 'User',
      type: 'info',
      title: 'Welcome to VapePro!',
      message: 'Thank you for creating an account. Happy shopping!',
      link: '/products'
    });

    const token = jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({ token, user: { id: user._id, email: user.email, name: user.name } });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !user.password || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    const token = jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user._id, email: user.email, name: user.name } });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

app.post('/api/google-login', async (req, res) => {
  try {
    const { credential } = req.body;
    if (!credential) return res.status(400).json({ message: 'ID Token required' });

    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { sub: googleId, email, name, picture, email_verified } = payload;

    let user = await User.findOne({
      $or: [
        { googleId },
        { email: email.toLowerCase() }
      ]
    });

    let isNewUser = false;
    if (!user) {
      isNewUser = true;
      // Create new user if doesn't exist
      user = new User({
        googleId,
        email: email.toLowerCase(),
        name: name,
        emailVerified: email_verified || true,
      });
      await user.save();
      sendTelegramNotification(`👤 *New Google Sign Up*\nName: ${name}\nEmail: \`${email}\``);
    } else {
      // Update existing user with googleId if they didn't have it
      if (!user.googleId) {
        user.googleId = googleId;
        user.emailVerified = true;
        await user.save();
      }
    }

    // If it's a new user (created above), notify admins
    if (isNewUser) {
      // Get all admins
      const admins = await Admin.find({});
      for (const admin of admins) {
        await Notification.create({
          recipient: admin._id,
          recipientModel: 'Admin',
          type: 'system',
          title: 'New User Signup (Google)',
          message: `${name} (${email}) has joined via Google.`,
          link: `/users/${user._id}`
        });
      }

      sendAdminNewUserEmail(user).catch(err => console.error('Failed to send admin google signup email', err));
      sendWelcomeEmail(user.email, user.name).catch(err => console.error('Failed to send welcome email', err));

      // Welcome Notification
      await Notification.create({
        recipient: user._id,
        recipientModel: 'User',
        type: 'info',
        title: 'Welcome to VapePro!',
        message: 'Thank you for joining us using Google.',
        link: '/products'
      });
    }

    const token = jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
    res.json({
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        picture
      }
    });
  } catch (error) {
    console.error('Google Login Error:', error);
    res.status(500).json({ message: 'Google authentication failed', error: error.message });
  }
});



// Use order routes
app.use('/api/orders', orderRoutes);

// Use cart routes
app.use('/api/cart', cartRoutes);

// Use product routes
console.log('Mounting /api/products route...');
app.use('/api/products', productRoutes);
app.use('/api/notifications', notificationRoutes);
app.get('/api/test-products', (req, res) => res.json({ message: 'Product test route working' }));

app.get('/api/account', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      address: user.address || '',
      phoneNumber: user.phoneNumber || '',
      emailVerified: user.emailVerified,
      phoneVerified: user.phoneVerified
    });
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
    res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      address: user.address || '',
      phoneNumber: user.phoneNumber || '',
      emailVerified: user.emailVerified,
      phoneVerified: user.phoneVerified
    });
  } catch (error) { res.status(500).json({ error: error.message }); }
});
app.use('/api/admin', adminRoutes);

// OTP Routes
app.post('/api/request-email-otp', async (req, res) => {
  try {
    const email = req.body.email.toLowerCase().trim();
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
    await EmailOtp.findOneAndUpdate({ email }, { codeHash: await bcrypt.hash(code, 10), expiresAt }, { upsert: true, new: true });
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
    const email = req.body.email.toLowerCase().trim();
    const { otp } = req.body;
    console.log(`Verifying OTP for ${email}...`);

    const record = await EmailOtp.findOne({ email });

    if (!record) {
      console.warn(`OTP Verification Failed: No record found for ${email}`);
      return res.status(400).json({ message: 'Invalid/Expired OTP (No record)' });
    }

    if (record.expiresAt < Date.now()) {
      console.warn(`OTP Verification Failed: OTP expired for ${email}`);
      return res.status(400).json({ message: 'OTP has expired' });
    }

    const isValid = await bcrypt.compare(otp, record.codeHash);
    if (!isValid) {
      console.warn(`OTP Verification Failed: Hash mismatch for ${email}`);
      return res.status(400).json({ message: 'Incorrect OTP' });
    }
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

// Health Checks
app.get('/', (req, res) => res.status(200).json({ status: 'UP', message: 'Vape-Pro Backend is operational', version: '2.1.0' }));
app.get('/health', (req, res) => res.status(200).json({ status: 'UP' }));
app.get('/api/im-alive', (req, res) => res.json({ message: 'Server is updated and registry-ready', timestamp: new Date() }));

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error(`[ERROR] ${new Date().toISOString()}:`, err);
  res.status(500).json({ message: 'Internal Server Error', error: err.message });
});

// 404 Handler
app.use((req, res) => {
  console.log(`[404] ${req.method} ${req.url}`);
  res.status(404).json({ message: `Route ${req.method} ${req.url} not found` });
});

const seedAdminIfNeeded = async () => {
  try {
    if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
      console.log('Skipping admin seed: No credentials provided in .env');
      return;
    }
    const existing = await Admin.findOne({ email: ADMIN_EMAIL });
    if (!existing) {
      await new Admin({
        email: ADMIN_EMAIL,
        name: 'Admin',
        password: await bcrypt.hash(ADMIN_PASSWORD, 10)
      }).save();
      console.log('✅ Default admin account seeded successfully');
    }
  } catch (err) {
    console.error('❌ Admin seed failed:', err.message);
  }
};

// Start Server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`
  🚀 ==========================================
  🚀 VAPE-PRO BACKEND // OPERATIONAL
  🚀 ==========================================
  🚀 Environment: Production / Render
  🚀 API Port:    ${PORT}
  🚀 Frontend:     https://vapesmart.co.in
  🚀 Registry:     Frontend-First Dynamic Mode
  🚀 ==========================================
  `);

  console.log('--- ENV VARIABLE CHECK ---');
  console.log('ADMIN_EMAIL:', process.env.ADMIN_EMAIL ? `SET (${process.env.ADMIN_EMAIL})` : '❌ MISSING');
  console.log('SMTP_PASS:', process.env.SMTP_PASS ? '✅ SET' : '❌ MISSING');
  console.log('TELEGRAM_BOT_TOKEN:', process.env.TELEGRAM_BOT_TOKEN ? '✅ SET' : '❌ MISSING');
  console.log('TELEGRAM_CHAT_ID:', process.env.TELEGRAM_CHAT_ID ? '✅ SET' : '❌ MISSING');
  console.log('--------------------------');

  // Connect to DB after starting server to avoid binding timeouts
  if (typeof MONGODB_URI === 'string' && MONGODB_URI.trim()) {
    console.log('Connecting to MongoDB...');
    mongoose
      .connect(MONGODB_URI.trim())
      .then(async () => {
        console.log('✅ Connected to MongoDB');
        await seedAdminIfNeeded();
      })
      .catch((err) => {
        console.error('❌ MongoDB connection error:', err);
        console.warn('⚠️ Server is running without Database connection. Stock tracking will fail.');
      });
  } else {
    console.warn('⚠️ MONGODB_URI missing. Running in memory-only mode (No stock persistence).');
  }
});
