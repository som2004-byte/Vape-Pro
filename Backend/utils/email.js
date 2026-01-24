const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com', // Replace with your SMTP host
  port: process.env.SMTP_PORT || 587,
  secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER || 'your-email@example.com',
    pass: process.env.SMTP_PASS || 'your-password',
  },
});

// Email validation helper
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Send OTP email
const sendOtpEmail = async (to, otp) => {
  try {
    const mailOptions = {
      from: process.env.SMTP_FROM || process.env.SMTP_USER || 'noreply@vapepro.com',
      to,
      subject: 'Your Verification Code',
      text: `Your verification code is: ${otp}\nThis code will expire in 10 minutes.`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Email Verification</h2>
          <p>Your verification code is:</p>
          <div style="background: #f4f4f4; padding: 10px 15px; display: inline-block; font-size: 24px; font-weight: bold; letter-spacing: 2px; margin: 10px 0;">
            ${otp}
          </div>
          <p>This code will expire in 10 minutes.</p>
          <p>If you didn't request this code, you can safely ignore this email.</p>
          <hr>
          <p style="color: #888; font-size: 12px;">This is an automated message, please do not reply.</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error('Failed to send OTP email');
  }
};

// Send order confirmation email
const sendOrderConfirmationEmail = async (toEmail, order) => {
  try {
    const mailOptions = {
      from: process.env.SMTP_FROM || process.env.SMTP_USER || 'noreply@vapepro.com',
      to: toEmail,
      subject: `Order Confirmation - ${order._id}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Order Confirmation</h2>
          <p>Thank you for your order! Here are your order details:</p>
          <div style="background: #f4f4f4; padding: 15px; margin: 10px 0;">
            <h3>Order ID: ${order._id}</h3>
            <p><strong>Total Amount:</strong> ₹${order.total || order.totalPrice}</p>
            <p><strong>Status:</strong> ${order.status || 'Processing'}</p>
            <p><strong>Payment Method:</strong> ${order.paymentMethod}</p>
          </div>
          <h4>Order Items:</h4>
          ${order.items.map(item => `
            <div style="border-bottom: 1px solid #ddd; padding: 10px 0;">
              <p><strong>${item.name}</strong></p>
              <p>Quantity: ${item.quantity} | Price: ₹${item.price}</p>
            </div>
          `).join('')}
          <p style="color: #888; font-size: 12px; margin-top: 20px;">This is an automated message, please do not reply.</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Error sending order confirmation email:', error);
    throw new Error('Failed to send order confirmation email');
  }
};

// Send order delivered email
const sendOrderDeliveredEmail = async (toEmail, order) => {
  try {
    const mailOptions = {
      from: process.env.SMTP_FROM || process.env.SMTP_USER || 'noreply@vapepro.com',
      to: toEmail,
      subject: `Order Delivered - ${order._id}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Order Delivered!</h2>
          <p>Great news! Your order has been delivered successfully.</p>
          <div style="background: #f4f4f4; padding: 15px; margin: 10px 0;">
            <h3>Order ID: ${order._id}</h3>
            <p><strong>Total Amount:</strong> ₹${order.total || order.totalPrice}</p>
            <p><strong>Delivery Date:</strong> ${order.deliveredAt ? new Date(order.deliveredAt).toLocaleDateString() : 'Today'}</p>
          </div>
          <p>Thank you for shopping with us!</p>
          <p style="color: #888; font-size: 12px; margin-top: 20px;">This is an automated message, please do not reply.</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Error sending order delivered email:', error);
    throw new Error('Failed to send order delivered email');
  }
};

// Send order cancellation email
const sendOrderCancellationEmail = async (toEmail, order, reason) => {
  try {
    const mailOptions = {
      from: process.env.SMTP_FROM || process.env.SMTP_USER || 'noreply@vapepro.com',
      to: toEmail,
      subject: `Order Cancelled - ${order._id}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Order Cancelled</h2>
          <p>Your order has been cancelled as requested.</p>
          <div style="background: #f4f4f4; padding: 15px; margin: 10px 0;">
            <h3>Order ID: ${order._id}</h3>
            <p><strong>Total Amount:</strong> ₹${order.total || order.totalPrice}</p>
            <p><strong>Cancellation Reason:</strong> ${reason || 'Cancelled by customer'}</p>
            <p><strong>Cancellation Date:</strong> ${order.cancelledAt ? new Date(order.cancelledAt).toLocaleDateString() : 'Today'}</p>
          </div>
          ${order.refund ? `
            <div style="background: #e8f5e8; padding: 15px; margin: 10px 0;">
              <h4>Refund Information:</h4>
              <p><strong>Refund Amount:</strong> ₹${order.refund.amount}</p>
              <p><strong>Status:</strong> ${order.refund.status}</p>
            </div>
          ` : ''}
          <p>We're sorry to see you go. If you have any questions, please contact our support team.</p>
          <p style="color: #888; font-size: 12px; margin-top: 20px;">This is an automated message, please do not reply.</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Error sending order cancellation email:', error);
    throw new Error('Failed to send order cancellation email');
  }
};


// Send welcome email
const sendWelcomeEmail = async (toEmail, name) => {
  try {
    const mailOptions = {
      from: process.env.SMTP_FROM || process.env.SMTP_USER || 'noreply@vapepro.com',
      to: toEmail,
      subject: 'Welcome to VapePro!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Welcome to VapePro! 🎉</h2>
          <p>Hi ${name},</p>
          <p>Thank you for creating an account with us. We're excited to have you on board!</p>
          <p>You can now browse our wide selection of products and place orders.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL || 'https://vapesmart.co.in'}/products" style="display: inline-block; background: #000; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">Shop Now</a>
          </div>
          <p>If you have any questions, feel free to reply to this email.</p>
          <p style="color: #888; font-size: 12px; margin-top: 20px;">This is an automated message.</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Error sending welcome email:', error);
    return false;
  }
};

module.exports = {
  sendOtpEmail,
  sendOrderConfirmationEmail,
  sendOrderDeliveredEmail,
  sendOrderCancellationEmail,
  isValidEmail,
  sendWelcomeEmail,
  sendAdminNewOrderEmail: async (order) => {
    if (!process.env.ADMIN_EMAIL) {
      console.warn('ADMIN_EMAIL not set, skipping admin email notification');
      return false;
    }
    try {
      const mailOptions = {
        from: process.env.SMTP_FROM || process.env.SMTP_USER || 'noreply@vapepro.com',
        to: process.env.ADMIN_EMAIL,
        subject: `🚨 New Order Received - ${order._id}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2c3e50;">New Order Alert! 📦</h2>
            <p>A new order has just been placed on your store.</p>
            <div style="background: #f8f9fa; border-left: 4px solid #fab1a0; padding: 15px; margin: 15px 0;">
              <p><strong>Order ID:</strong> ${order._id}</p>
              <p><strong>Amount:</strong> $${order.total || order.totalPrice}</p>
              <p><strong>Customer ID:</strong> ${order.userId}</p>
              <p><strong>Items:</strong> ${order.items ? order.items.length : 0}</p>
              ${order.note ? `<p><strong>Note:</strong> ${order.note}</p>` : ''}
            </div>
            <a href="${process.env.FRONTEND_URL || 'https://vapesmart.co.in'}/admin/orders/${order._id}" style="display: inline-block; background: #000; color: #fff; padding: 10px 20px; text-decoration: none; border-radius: 5px;">View Order in Admin Panel</a>
          </div>
        `,
      };
      await transporter.sendMail(mailOptions);
      return true;
    } catch (error) {
      console.error('Error sending admin order email:', error);
      return false;
    }
  },
  sendAdminNewUserEmail: async (user) => {
    if (!process.env.ADMIN_EMAIL) {
      return false;
    }
    try {
      const mailOptions = {
        from: process.env.SMTP_FROM || process.env.SMTP_USER || 'noreply@vapepro.com',
        to: process.env.ADMIN_EMAIL,
        subject: `👤 New User Signup - ${user.name}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2c3e50;">New Customer Signup! 🎉</h2>
            <div style="background: #f8f9fa; border-left: 4px solid #74b9ff; padding: 15px; margin: 15px 0;">
              <p><strong>Name:</strong> ${user.name}</p>
              <p><strong>Email:</strong> ${user.email}</p>
              <p><strong>Joined:</strong> ${new Date().toLocaleDateString()}</p>
            </div>
          </div>
        `,
      };
      await transporter.sendMail(mailOptions);
      return true;
    } catch (error) {
      console.error('Error sending admin signup email:', error);
      return false;
    }
  }
};
