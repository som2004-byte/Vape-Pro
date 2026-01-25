const nodemailer = require('nodemailer');

// Configure SMTP transport with pooling and better timeout management
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '465'),
  // Auto-set secure if using port 465
  secure: process.env.SMTP_SECURE === 'true' || parseInt(process.env.SMTP_PORT) === 465,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  pool: true, // Use pooling for better performance on Render
  maxConnections: 5,
  maxMessages: 100,
  connectionTimeout: 10000, // 10 seconds timeout
  greetingTimeout: 10000,
  socketTimeout: 20000,
  debug: false,
  logger: false
});

// Verify connection on startup
transporter.verify((error, success) => {
  if (error) {
    console.error('📧 SMTP Verification Failed:', error.message);
  } else {
    console.log('✅ SMTP Connection ready to send emails');
  }
});

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
const sendAdminNewOrderEmail = async (order) => {
  console.log(`[EMAIL] Attempting to send admin notification for order: ${order._id}`);
  if (!process.env.ADMIN_EMAIL) {
    console.warn('[EMAIL] ADMIN_EMAIL not set, skipping admin notification');
    return false;
  }
  try {
    console.log(`[EMAIL] Sending admin alert to: ${process.env.ADMIN_EMAIL}`);
    const mailOptions = {
      from: getSender(),
      to: process.env.ADMIN_EMAIL,
      subject: `🚨 NEW ORDER: #${order._id}`,
      html: `
        <div style="font-family: monospace; background: #000; color: #00ff00; padding: 20px;">
          <h2 style="border-bottom: 2px solid #00ff00;">>>> INCOMING ORDER RECEIVED <<<</h2>
          <p><strong>Order ID:</strong> ${order._id}</p>
          <p><strong>Amount:</strong> ₹${order.total || order.totalPrice || 0}</p>
          <p><strong>Payment:</strong> ${order.paymentMethod} (${order.paymentStatus || 'pending'})</p>
          <p><strong>Customer ID:</strong> ${order.userId}</p>
          <p><strong>Items:</strong> ${order.items ? order.items.length : 0}</p>
          ${order.note ? `<p><strong>Note:</strong> ${order.note}</p>` : ''}
          <div style="margin-top: 20px;">
            <a href="https://vapesmart.co.in/admin/orders/${order._id}" style="background: #00ff00; color: #000; padding: 10px; text-decoration: none; font-weight: bold;">PROCESS ORDER</a>
          </div>
        </div>
      `,
    };
    await transporter.sendMail(mailOptions);
    console.log(`[EMAIL] Admin notification sent successfully for order: ${order._id}`);
    return true;
  } catch (error) {
    console.error(`[EMAIL] Failed to send admin order notification for ${order._id}:`, error.message);
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
