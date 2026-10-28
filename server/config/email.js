import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Create reusable transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

// Email templates
const emailTemplates = {
  verification: (name, verificationLink) => ({
    subject: 'Verify Your RentRide Account',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #1a2332 0%, #2d3e50 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .logo { font-size: 28px; font-weight: bold; margin-bottom: 10px; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); color: white; padding: 14px 30px; text-decoration: none; border-radius: 8px; margin: 20px 0; font-weight: bold; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">🚗 RentRide</div>
              <p>Welcome to Premium Car Rentals</p>
            </div>
            <div class="content">
              <h2>Hi ${name}! 👋</h2>
              <p>Thanks for signing up with RentRide! We're excited to have you on board.</p>
              <p>To complete your registration and start booking your dream cars, please verify your email address by clicking the button below:</p>
              <div style="text-align: center;">
                <a href="${verificationLink}" class="button">Verify My Email</a>
              </div>
              <p>Or copy and paste this link into your browser:</p>
              <p style="word-break: break-all; color: #666; font-size: 14px;">${verificationLink}</p>
              <p><strong>This link will expire in 24 hours.</strong></p>
              <p>If you didn't create an account with RentRide, you can safely ignore this email.</p>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} RentRide. All rights reserved.</p>
              <p>Premium Car Rentals Made Simple</p>
            </div>
          </div>
        </body>
      </html>
    `,
    text: `Hi ${name}!\n\nThanks for signing up with RentRide!\n\nPlease verify your email by clicking this link:\n${verificationLink}\n\nThis link will expire in 24 hours.\n\nIf you didn't create an account, you can ignore this email.\n\n© ${new Date().getFullYear()} RentRide`,
  }),

  passwordReset: (name, resetLink) => ({
    subject: 'Reset Your RentRide Password',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #1a2332 0%, #2d3e50 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .logo { font-size: 28px; font-weight: bold; margin-bottom: 10px; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); color: white; padding: 14px 30px; text-decoration: none; border-radius: 8px; margin: 20px 0; font-weight: bold; }
            .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">🚗 RentRide</div>
              <p>Password Reset Request</p>
            </div>
            <div class="content">
              <h2>Hi ${name}! 👋</h2>
              <p>We received a request to reset your RentRide account password.</p>
              <p>Click the button below to reset your password:</p>
              <div style="text-align: center;">
                <a href="${resetLink}" class="button">Reset My Password</a>
              </div>
              <p>Or copy and paste this link into your browser:</p>
              <p style="word-break: break-all; color: #666; font-size: 14px;">${resetLink}</p>
              <div class="warning">
                <strong>⚠️ Security Notice:</strong>
                <p style="margin: 5px 0 0 0;">This link will expire in 1 hour. If you didn't request a password reset, please ignore this email and your password will remain unchanged.</p>
              </div>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} RentRide. All rights reserved.</p>
              <p>Premium Car Rentals Made Simple</p>
            </div>
          </div>
        </body>
      </html>
    `,
    text: `Hi ${name}!\n\nWe received a request to reset your RentRide password.\n\nClick this link to reset your password:\n${resetLink}\n\nThis link will expire in 1 hour.\n\nIf you didn't request this, ignore this email.\n\n© ${new Date().getFullYear()} RentRide`,
  }),

  welcome: (name) => ({
    subject: 'Welcome to RentRide! 🚗',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #1a2332 0%, #2d3e50 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .logo { font-size: 28px; font-weight: bold; margin-bottom: 10px; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .feature { background: white; padding: 15px; margin: 10px 0; border-radius: 8px; border-left: 4px solid #f97316; }
            .button { display: inline-block; background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); color: white; padding: 14px 30px; text-decoration: none; border-radius: 8px; margin: 20px 0; font-weight: bold; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">🚗 RentRide</div>
              <h1 style="margin: 0;">Welcome Aboard!</h1>
            </div>
            <div class="content">
              <h2>Hi ${name}! 🎉</h2>
              <p>Your email has been verified successfully! Welcome to the RentRide family.</p>
              <p>You now have access to our premium fleet of vehicles. Here's what you can do:</p>
              
              <div class="feature">
                <strong>🚙 Browse Our Fleet</strong>
                <p style="margin: 5px 0 0 0;">Explore luxury cars, SUVs, and sports cars</p>
              </div>
              
              <div class="feature">
                <strong>📅 Easy Booking</strong>
                <p style="margin: 5px 0 0 0;">Book your dream car in just a few clicks</p>
              </div>
              
              <div class="feature">
                <strong>💳 Flexible Payment</strong>
                <p style="margin: 5px 0 0 0;">Multiple payment options available</p>
              </div>
              
              <div class="feature">
                <strong>🛡️ 24/7 Support</strong>
                <p style="margin: 5px 0 0 0;">We're here to help anytime you need</p>
              </div>
              
              <div style="text-align: center;">
                <a href="${process.env.FRONTEND_URL || 'http://localhost:8080'}" class="button">Start Browsing Cars</a>
              </div>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} RentRide. All rights reserved.</p>
              <p>Premium Car Rentals Made Simple</p>
            </div>
          </div>
        </body>
      </html>
    `,
    text: `Hi ${name}!\n\nWelcome to RentRide! Your email has been verified.\n\nYou can now:\n- Browse our premium fleet\n- Book cars easily\n- Enjoy flexible payment options\n- Get 24/7 support\n\nStart browsing: ${process.env.FRONTEND_URL || 'http://localhost:8080'}\n\n© ${new Date().getFullYear()} RentRide`,
  }),
};

// Send email function
const sendEmail = async (to, template, data) => {
  try {
    const transporter = createTransporter();
    const emailContent = emailTemplates[template](data.name, data.link);

    const mailOptions = {
      from: `"${process.env.SMTP_FROM_NAME || 'RentRide'}" <${process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER}>`,
      to,
      subject: emailContent.subject,
      text: emailContent.text,
      html: emailContent.html,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Email error:', error);
    return { success: false, error: error.message };
  }
};

export { sendEmail, emailTemplates };