import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Create transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Email templates
const emailTemplates = {
  bookingConfirmation: (booking, user) => {
    const car = booking.vehicles || {};
    const carName = car.name || `${car.brand} ${car.model}` || 'Your Rented Car';
    const carImage = car.primary_image || 'https://cdn-icons-png.flaticon.com/512/3202/3202926.png';
    const carCategory = car.category_name || 'Vehicle';

    return {
      subject: `🚗 Booking Confirmed - ${carName} | RentRide`,
      html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Booking Confirmation</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .booking-card { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
          .car-image { width: 100%; height: 200px; object-fit: cover; border-radius: 8px; margin-bottom: 15px; }
          .detail-row { display: flex; justify-content: space-between; margin: 10px 0; padding: 8px 0; border-bottom: 1px solid #eee; }
          .detail-label { font-weight: bold; color: #666; }
          .detail-value { color: #333; }
          .status-badge { background: #10b981; color: white; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: bold; }
          .price-highlight { background: #667eea; color: white; padding: 15px; border-radius: 8px; text-align: center; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
          .button { background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 10px 0; }
          .important-note { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 4px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Booking Confirmed!</h1>
            <p>Your ${carName} is ready for pickup</p>
          </div>
          
          <div class="content">
            <p>Dear ${user.first_name || 'Valued Customer'},</p>
            <p>Great news! Your car rental booking has been confirmed. Here are your booking details:</p>
            
            <div class="booking-card">
              <img src="${carImage}" alt="${carName}" class="car-image">
              <h3>${carName}</h3>
              <span class="status-badge">✓ Confirmed</span>
              
              <div style="margin-top: 20px;">
                <div class="detail-row">
                  <span class="detail-label">Booking ID:</span>
                  <span class="detail-value">${(booking.booking_id || booking.id || '').toUpperCase()}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Car Category:</span>
                  <span class="detail-value">${carCategory}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Pickup Date & Time:</span>
                  <span class="detail-value">${booking.pickup_date ? new Date(booking.pickup_date).toLocaleString('en-IN', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }) : 'N/A'}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Return Date & Time:</span>
                  <span class="detail-value">${booking.return_date ? new Date(booking.return_date).toLocaleString('en-IN', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }) : 'N/A'}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Duration:</span>
                  <span class="detail-value">${booking.total_days || booking.days || 0} days</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Payment ID:</span>
                  <span class="detail-value">${booking.payment_id || 'N/A'}</span>
                </div>
              </div>
              
              <div class="price-highlight">
                <h3 style="margin: 0;">Total Amount: ₹${(booking.total_amount || 0).toLocaleString('en-IN')}</h3>
                <p style="margin: 5px 0;">Paid: ₹${(booking.payment_amount || 0).toLocaleString('en-IN')} | ${(booking.remaining_amount || 0) > 0 ? `Due at pickup: ₹${(booking.remaining_amount || 0).toLocaleString('en-IN')}` : 'Fully Paid'}</p>
              </div>
            </div>
            
            <div class="important-note">
              <h4>📋 Important Pickup Instructions:</h4>
              <ul>
                <li>Arrive 15 minutes before your pickup time</li>
                <li>Bring valid driving license and ID proof</li>
                <li>Complete vehicle inspection before driving</li>
                ${(booking.remaining_amount || 0) > 0 ? `<li><strong>Pay remaining ₹${(booking.remaining_amount || 0).toLocaleString('en-IN')} at pickup</strong></li>` : ''}
              </ul>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.FRONTEND_URL}/bookings" class="button">View My Bookings</a>
            </div>
            
            <div class="footer">
              <p>Need help? Contact us at <strong>support@rentride.com</strong> or call <strong>+91 98765 43210</strong></p>
              <p>RentRide - Your Premium Car Rental Partner</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `
    };
  },

  ownerApproval: (owner, loginCredentials) => ({
    subject: `🎉 Welcome to RentRide Partner Network - Application Approved!`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Partner Application Approved</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .approval-card { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; box-shadow: 0 2px 4px rgba(0,0,0,0.1); border-left: 4px solid #10b981; }
          .credentials-box { background: #ecfdf5; border: 2px solid #10b981; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .credential-item { background: white; padding: 15px; margin: 10px 0; border-radius: 6px; border-left: 3px solid #10b981; }
          .next-steps { background: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
          .button { background: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 10px 0; }
          .warning { background: #fef2f2; border-left: 4px solid #ef4444; padding: 15px; margin: 20px 0; border-radius: 4px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Congratulations!</h1>
            <p>Your RentRide Partner Application has been Approved</p>
          </div>
          
          <div class="content">
            <p>Dear ${owner.owner_name},</p>
            <p>We're excited to welcome <strong>${owner.business_name}</strong> to the RentRide Partner Network!</p>
            
            <div class="approval-card">
              <h3>✅ Application Status: APPROVED</h3>
              <p><strong>Business:</strong> ${owner.business_name}</p>
              <p><strong>Type:</strong> ${owner.business_type}</p>
              <p><strong>Location:</strong> ${owner.city}, ${owner.state}</p>
              <p><strong>Fleet Size:</strong> ${owner.total_cars} vehicles</p>
              <p><strong>Approval Date:</strong> ${new Date().toLocaleDateString('en-IN')}</p>
            </div>

            <div class="credentials-box">
              <h3>🔐 Your Partner Portal Login Credentials</h3>
              <p>Use these credentials to access your partner dashboard:</p>
              
              <div class="credential-item">
                <strong>Email:</strong> ${loginCredentials.email}
              </div>
              <div class="credential-item">
                <strong>Password:</strong> ${loginCredentials.password}
              </div>
              <div class="credential-item">
                <strong>Portal URL:</strong> ${process.env.FRONTEND_URL}/partner/login
              </div>
            </div>

            <div class="warning">
              <h4>🔒 Security Notice:</h4>
              <p>Please change your password after your first login for security purposes. Keep your login credentials secure and do not share them with unauthorized personnel.</p>
            </div>

            <div class="next-steps">
              <h4>📋 Next Steps:</h4>
              <ol>
                <li>Login to your partner portal using the credentials above</li>
                <li>Complete your business profile setup</li>
                <li>Upload your vehicle inventory</li>
                <li>Start receiving bookings!</li>
              </ol>
            </div>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.FRONTEND_URL}/partner/login" class="button">Access Partner Portal</a>
            </div>

            <div class="footer">
              <p>Need help getting started? Contact our partner support team:</p>
              <p><strong>Email:</strong> partners@rentride.com | <strong>Phone:</strong> +91 98765 43210</p>
              <p>RentRide Partner Network - Growing Together</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `
  }),

  ownerRejection: (owner, rejectionReason) => ({
    subject: `❌ RentRide Partner Application Update - ${owner.business_name}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Partner Application Status</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .rejection-card { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; box-shadow: 0 2px 4px rgba(0,0,0,0.1); border-left: 4px solid #ef4444; }
          .reason-box { background: #fef2f2; border: 1px solid #fecaca; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
          .button { background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 10px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📋 Application Update</h1>
            <p>RentRide Partner Application Status</p>
          </div>
          
          <div class="content">
            <p>Dear ${owner.owner_name},</p>
            <p>Thank you for your interest in joining the RentRide Partner Network. We have carefully reviewed your application for <strong>${owner.business_name}</strong>.</p>
            
            <div class="rejection-card">
              <h3>❌ Application Status: Not Approved</h3>
              <p><strong>Business:</strong> ${owner.business_name}</p>
              <p><strong>Application Date:</strong> ${new Date(owner.created_at).toLocaleDateString('en-IN')}</p>
            </div>

            <div class="reason-box">
              <h4>📝 Reason for Decision:</h4>
              <p>${rejectionReason}</p>
            </div>

            <p>We appreciate your interest in partnering with RentRide. If you have any questions about this decision, please don't hesitate to contact us.</p>
            
            <div class="footer">
              <p>Questions? Contact our partner team:</p>
              <p><strong>Email:</strong> partners@rentride.com</p>
              <p>RentRide - Building Trust Through Quality</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `
  }),

  pickupReminder: (booking, user) => {
    const car = booking.vehicles || {};
    const carName = car.name || `${car.brand} ${car.model}` || 'Your Rented Car';

    return {
      subject: `⏰ Pickup Reminder - ${carName} | RentRide`,
      html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Pickup Reminder</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .reminder-card { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; box-shadow: 0 2px 4px rgba(0,0,0,0.1); border-left: 4px solid #f59e0b; }
          .time-highlight { background: #fef3c7; padding: 15px; border-radius: 8px; text-align: center; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>⏰ Pickup Reminder</h1>
            <p>Your ${carName} is ready for pickup soon!</p>
          </div>
          
          <div class="content">
            <p>Dear ${user.first_name || 'Valued Customer'},</p>
            <p>This is a friendly reminder for your scheduled car pickup.</p>
            
            <div class="reminder-card">
              <h3>🚗 ${carName}</h3>
              <div class="time-highlight">
                <h2 style="margin: 0; color: #d97706;">Pickup Time: ${booking.pickup_date ? new Date(booking.pickup_date).toLocaleString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
        day: 'numeric',
        month: 'short'
      }) : 'Check your booking'}</h2>
                <p style="margin: 5px 0;">Booking ID: ${(booking.booking_id || booking.id || '').toUpperCase()}</p>
              </div>
            </div>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.FRONTEND_URL}/bookings" class="button">View Booking Details</a>
            </div>

            <div class="footer">
              <p>Need help? Contact us at <strong>support@rentride.com</strong></p>
              <p>RentRide - Your Premium Car Rental Partner</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `
    };
  }
};

// Send booking confirmation email
export const sendBookingConfirmation = async (booking, user) => {
  try {
    const template = emailTemplates.bookingConfirmation(booking, user);
    const mailOptions = {
      from: `${process.env.SMTP_FROM_NAME || 'RentRide'} <${process.env.SMTP_USER}>`,
      to: user.email,
      subject: template.subject,
      html: template.html,
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('Booking confirmation email sent:', result.messageId);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('Error sending booking confirmation email:', error);
    return { success: false, error: error.message };
  }
};

// Send pickup reminder email
export const sendPickupReminder = async (booking, user) => {
  try {
    const template = emailTemplates.pickupReminder(booking, user);
    const mailOptions = {
      from: `${process.env.SMTP_FROM_NAME || 'RentRide'} <${process.env.SMTP_USER}>`,
      to: user.email,
      subject: template.subject,
      html: template.html,
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('Pickup reminder email sent:', result.messageId);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('Error sending pickup reminder email:', error);
    return { success: false, error: error.message };
  }
};

// Send owner approval email with login credentials
export const sendOwnerApprovalEmail = async (owner, loginCredentials) => {
  try {
    const template = emailTemplates.ownerApproval(owner, loginCredentials);
    const mailOptions = {
      from: `${process.env.SMTP_FROM_NAME || 'RentRide'} <${process.env.SMTP_USER}>`,
      to: owner.email,
      subject: template.subject,
      html: template.html,
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('Owner approval email sent:', result.messageId);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('Error sending owner approval email:', error);
    return { success: false, error: error.message };
  }
};

// Send owner rejection email
export const sendOwnerRejectionEmail = async (owner, rejectionReason) => {
  try {
    const template = emailTemplates.ownerRejection(owner, rejectionReason);
    const mailOptions = {
      from: `${process.env.SMTP_FROM_NAME || 'RentRide'} <${process.env.SMTP_USER}>`,
      to: owner.email,
      subject: template.subject,
      html: template.html,
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('Owner rejection email sent:', result.messageId);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('Error sending owner rejection email:', error);
    return { success: false, error: error.message };
  }
};

// Test email configuration
export const testEmailConfig = async () => {
  try {
    await transporter.verify();
    console.log('✅ Email configuration is valid');
    return true;
  } catch (error) {
    console.error('❌ Email configuration error:', error);
    return false;
  }
};