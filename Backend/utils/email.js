const nodemailer = require('nodemailer');

// Configure SMTP transport with pooling and better timeout management
console.log('--- SMTP DIAGNOSTICS ---');
console.log('SMTP_HOST:', process.env.SMTP_HOST ? '✅ SET' : '❌ MISSING (Defaulting to smtp.gmail.com)');
console.log('SMTP_USER:', process.env.SMTP_USER ? '✅ SET' : '❌ MISSING');
console.log('SMTP_PASS:', process.env.SMTP_PASS ? '✅ SET' : '❌ MISSING');
console.log('SMTP_PORT:', process.env.SMTP_PORT || 'Default (465)');
console.log('------------------------');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '465'),
  // Auto-set secure if using port 465
  secure: process.env.SMTP_SECURE === 'true' || (process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT) === 465 : true),
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  pool: true,
  maxConnections: 3,
  maxMessages: 50,
  connectionTimeout: 20000, // Increased to 20s for Render
  greetingTimeout: 20000,
  socketTimeout: 30000,
});

// Verify connection on startup
transporter.verify((error, success) => {
  if (error) {
    console.error('📧 SMTP Verification Failed:', error.message);
    console.error('📧 FULL ERROR:', JSON.stringify(error));
  } else {
    console.log('✅ SMTP Connection ready to send emails');
  }
});

// Email validation helper
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Helper to get consistent sender address
const getSender = () => {
  return process.env.SMTP_FROM || process.env.SMTP_USER || 'VapePro Support <noreply@vapepro.com>';
};

// Send OTP email
const sendOtpEmail = async (to, otp) => {
  try {
    const mailOptions = {
      from: getSender(),
      to,
      subject: 'Verify your VapePro login',
      text: `Your verification code is: ${otp}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; padding: 20px; border: 1px solid #eee;">
          <h2 style="color: #333;">Email Verification</h2>
          <p>Your verification code for VapePro is:</p>
          <div style="background: #f4f4f4; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #000;">
            ${otp}
          </div>
          <p style="color: #666; margin-top: 20px;">This code will expire in 10 minutes.</p>
          <hr style="margin-top: 30px; border: none; border-top: 1px solid #eee;">
          <p style="font-size: 12px; color: #999;">If you didn't request this, please ignore this email.</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('❌ Error sending OTP email:', error.message);
    return false;
  }
};

// Send order confirmation email
const sendOrderConfirmationEmail = async (toEmail, order) => {
  try {
    const mailOptions = {
      from: getSender(),
      to: toEmail,
      subject: `Order Confirmed - #${order._id}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #ddd; padding: 20px;">
          <div style="text-align: center; border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 20px;">
            <h1 style="margin: 0; color: #000;">VAPESMART</h1>
            <p style="margin: 0; font-size: 12px; color: #666;">Thank you for your order!</p>
          </div>
          
          <h2 style="color: #333;">Order Details</h2>
          <p><strong>Order ID:</strong> ${order._id}</p>
          <p><strong>Payment Status:</strong> ${order.paymentStatus || order.status}</p>
          
          <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
            <thead>
              <tr style="background: #f8f8f8;">
                <th style="padding: 10px; text-align: left; border-bottom: 1px solid #ddd;">Item</th>
                <th style="padding: 10px; text-align: center; border-bottom: 1px solid #ddd;">Qty</th>
                <th style="padding: 10px; text-align: right; border-bottom: 1px solid #ddd;">Price</th>
              </tr>
            </thead>
            <tbody>
              ${order.items.map(item => `
                <tr>
                  <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.name}</td>
                  <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
                  <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">₹${item.price}</td>
                </tr>
              `).join('')}
            </tbody>
            <tfoot>
              <tr>
                <td colspan="2" style="padding: 15px 10px; text-align: right; font-weight: bold;">Grand Total:</td>
                <td style="padding: 15px 10px; text-align: right; font-weight: bold; color: #e44d26; font-size: 18px;">₹${order.total || order.totalPrice || 0}</td>
              </tr>
            </tfoot>
          </table>

          <div style="margin-top: 30px; background: #fff8f0; padding: 15px; border-radius: 8px;">
            <p style="margin: 0; font-size: 14px;"><strong>Shipping Address:</strong><br>${order.shippingAddress || 'Saved Address'}</p>
          </div>

          <p style="color: #888; font-size: 12px; margin-top: 30px; text-align: center; border-top: 1px solid #eee; padding-top: 10px;">
            This is an automated message. For support, reply to this email our visit our website.
          </p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('❌ Error sending order confirmation email:', error.message);
    return false;
  }
};

// Send order delivered email
const sendOrderDeliveredEmail = async (toEmail, order) => {
  try {
    const mailOptions = {
      from: getSender(),
      to: toEmail,
      subject: `Order Delivered! - #${order._id}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #ddd; padding: 20px;">
          <h2 style="color: #27ae60;">Delivered Successfully! 📦</h2>
          <p>Great news! Your order <strong>#${order._id}</strong> has been delivered.</p>
           <p><strong>Total Amount:</strong> ₹${order.total || order.totalPrice || 0}</p>
          <p>We hope you enjoy your purchase. Thank you for shopping with VapeSmart!</p>
          <div style="text-align: center; margin-top: 20px;">
            <a href="https://vapesmart.co.in" style="background: #000; color: #fff; padding: 10px 20px; text-decoration: none; border-radius: 4px;">Visit Shop</a>
          </div>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('❌ Error sending delivery email:', error.message);
    return false;
  }
};

// Send order cancellation email
const sendOrderCancellationEmail = async (toEmail, order, reason) => {
  try {
    const mailOptions = {
      from: getSender(),
      to: toEmail,
      subject: `Order Cancelled - #${order._id}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #ddd; padding: 20px;">
          <h2 style="color: #e44d26;">Order Cancelled</h2>
          <p>Your order <strong>#${order._id}</strong> has been cancelled.</p>
          <p><strong>Reason:</strong> ${reason || 'Cancelled by customer'}</p>
          <p>If this was a mistake, please reach out to our support team.</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('❌ Error sending cancellation email:', error.message);
    return false;
  }
};

// Send welcome email
const sendWelcomeEmail = async (toEmail, name) => {
  try {
    const mailOptions = {
      from: getSender(),
      to: toEmail,
      subject: 'Welcome to VapePro! 🌬️',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #ddd; padding: 20px; text-align: center;">
          <h1 style="color: #000;">Welcome, ${name}!</h1>
          <p>We're thrilled to have you join the VapeSmart community.</p>
          <div style="margin: 30px 0;">
            <img src="https://vapesmart.co.in/images/vapesmart-logo-removebg-preview.jpg" alt="VapeSmart" style="width: 150px;">
          </div>
          <p>You can now browse our premium selection and enjoy members-only benefits.</p>
          <a href="https://vapesmart.co.in/products" style="display: inline-block; background: #000; color: #fff; padding: 15px 30px; text-decoration: none; font-weight: bold; border-radius: 50px;">Start Shopping</a>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('❌ Error sending welcome email:', error.message);
    return false;
  }
};

// Send admin new order email
// Send admin new order email
const sendAdminNewOrderEmail = async (order, customer = null) => {
  const orderId = order?._id?.toString() || 'UNKNOWN';
  console.log(`[EMAIL] 🔔 Triggering admin notification for order: ${orderId}`);

  if (!process.env.ADMIN_EMAIL) {
    console.warn('[EMAIL] ⚠️ ADMIN_EMAIL environment variable is missing. Cannot send admin alert.');
    return false;
  }

  try {
    const totalAmount = order.total || order.totalPrice || 0;
    const customerName = customer?.name || 'A Customer';

    const targetEmail = process.env.ADMIN_EMAIL.trim();
    console.log(`[EMAIL] 📧 Sending admin alert to: ${targetEmail}`);

    const mailOptions = {
      from: getSender(),
      to: targetEmail,
      subject: `🚨 NEW ORDER RECEIVED: #${orderId} (₹${totalAmount})`,
      html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f4; padding: 20px;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.1);">
            <div style="background-color: #000000; color: #ffffff; padding: 20px; text-align: center;">
              <h1 style="margin: 0; font-size: 24px; text-transform: uppercase; letter-spacing: 2px;">New Order Alert</h1>
            </div>
            
            <div style="padding: 30px;">
              <div style="background-color: #e8f5e9; border-left: 4px solid #4caf50; padding: 15px; margin-bottom: 25px;">
                <p style="margin: 0; font-weight: bold; color: #2e7d32;">A new order was just placed on VapeSmart.</p>
              </div>

              <table style="width: 100%; border-collapse: collapse; margin-bottom: 25px;">
                <tr>
                  <td style="padding: 10px; border-bottom: 1px solid #eee; color: #666; width: 140px;">Order ID</td>
                  <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold;">#${orderId}</td>
                </tr>
                <tr>
                  <td style="padding: 10px; border-bottom: 1px solid #eee; color: #666;">Amount</td>
                  <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold; color: #e44d26; font-size: 18px;">₹${totalAmount}</td>
                </tr>
                <tr>
                  <td style="padding: 10px; border-bottom: 1px solid #eee; color: #666;">Customer</td>
                  <td style="padding: 10px; border-bottom: 1px solid #eee;">${customerName}</td>
                </tr>
                <tr>
                  <td style="padding: 10px; border-bottom: 1px solid #eee; color: #666;">Payment</td>
                  <td style="padding: 10px; border-bottom: 1px solid #eee; text-transform: uppercase; font-size: 12px; background: #eee; display: inline-block; padding: 2px 8px; border-radius: 4px; margin-top: 5px;">${order.paymentMethod || 'COD'}</td>
                </tr>
              </table>

              <h3 style="border-bottom: 2px solid #333; padding-bottom: 5px;">Items Summary</h3>
              <ul style="padding-left: 20px; color: #333;">
                ${order.items && order.items.length > 0
          ? order.items.map(item => `<li>${item.name} (x${item.quantity}) - ₹${item.price}</li>`).join('')
          : '<li>No items recorded</li>'
        }
              </ul>

              ${order.note ? `
                <div style="margin-top: 25px; padding: 15px; background: #fffde7; border: 1px solid #fff59d;">
                  <strong style="color: #f57f17;">Customer Note:</strong><br>
                  <p style="margin: 5px 0; font-style: italic;">${order.note}</p>
                </div>
              ` : ''}

              <div style="margin-top: 35px; text-align: center;">
                <a href="https://vapesmart.co.in/admin" style="background-color: #000000; color: #ffffff; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">Manage Order on Dashboard</a>
              </div>
            </div>
            
            <div style="background-color: #f9f9f9; padding: 15px; text-align: center; font-size: 12px; color: #999; border-top: 1px solid #eee;">
              This is an automated operational alert from VapeSmart.co.in
            </div>
          </div>
        </div>
      `,
    };

    const sent = await transporter.sendMail(mailOptions);
    console.log(`[EMAIL] ✅ Admin notification successfully DELIVERED to ${process.env.ADMIN_EMAIL}. Message ID: ${sent.messageId}`);
    return true;
  } catch (error) {
    console.error(`[EMAIL] ❌ FAILED to send admin alert for order ${orderId}:`, error.message);
    if (error.code === 'EAUTH') {
      console.error('[EMAIL] 🔑 AUTHENTICATION ERROR: Check your SMTP password / App Password.');
    }
    return false;
  }
};

// Send admin new user email
const sendAdminNewUserEmail = async (user) => {
  if (!process.env.ADMIN_EMAIL) return false;
  try {
    const mailOptions = {
      from: getSender(),
      to: process.env.ADMIN_EMAIL,
      subject: `👤 NEW USER SIGNUP: ${user.name}`,
      html: `
        <div style="font-family: Arial; padding: 20px; border: 4px solid #3498db;">
          <h2 style="margin: 0;">New User Registered! 🎉</h2>
          <p><strong>Name:</strong> ${user.name}</p>
          <p><strong>Email:</strong> ${user.email}</p>
          <p><strong>Date:</strong> ${new Date().toLocaleString()}</p>
        </div>
      `,
    };
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('❌ Error sending admin signup notification:', error.message);
    return false;
  }
};

module.exports = {
  isValidEmail,
  sendOtpEmail,
  sendOrderConfirmationEmail,
  sendOrderDeliveredEmail,
  sendOrderCancellationEmail,
  sendWelcomeEmail,
  sendAdminNewOrderEmail,
  sendAdminNewUserEmail,
};
