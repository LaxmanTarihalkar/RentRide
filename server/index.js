import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import authRoutes from './routes/auth.js';
import bookingRoutes from './routes/bookings.js';
import adminRoutes from './routes/admin.js';
import ownerRoutes from './routes/owners.js';
import vehicleRoutes from './routes/vehicles.js';
import { userDB } from './config/database.js';
import { supabase } from './config/supabase.js';
import { testEmailConfig } from './services/emailService.js';
import { startReminderService } from './services/reminderService.js';
import { ensureAdminExists } from './utils/createAdmin.js';
import uploadRoutes from './routes/upload.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

process.on('uncaughtException', (err) => {
  console.error('💥 Uncaught Exception:', err);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('💥 Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('exit', (code) => {
  console.log(`📡 Process exiting with code: ${code}`);
});

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:8080',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Test route early
app.get('/api/test-early', (req, res) => {
  console.log('🧪 Early test route accessed');
  res.json({ success: true, message: 'Early route works!' });
});

// Initialize Razorpay
console.log('Razorpay Key:', process.env.VITE_RAZORPAY_KEY ? 'Found' : 'Missing');
console.log('Razorpay Secret:', process.env.RAZORPAY_SECRET ? 'Found' : 'Missing');

const razorpay = new Razorpay({
  key_id: process.env.VITE_RAZORPAY_KEY,
  key_secret: process.env.RAZORPAY_SECRET,
});

// Add request logging middleware
app.use((req, res, next) => {
  console.log(`📥 ${req.method} ${req.path}`);
  next();
});

// Routes
console.log('🔧 Mounting routes...');
app.use('/api/auth', authRoutes);
console.log('✅ Auth routes mounted');
app.use('/api/bookings', bookingRoutes);
console.log('✅ Booking routes mounted');
app.use('/api/admin', adminRoutes);
console.log('✅ Admin routes mounted');
app.use('/api/owners', ownerRoutes);
console.log('✅ Owner routes mounted');
app.use('/api/vehicles', vehicleRoutes);
console.log('✅ Vehicle routes mounted');
app.use('/api/upload', uploadRoutes);
console.log('✅ Upload routes mounted');
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
console.log('✅ Static uploads directory served');

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'RentRide API is running' });
});

// Payment routes
app.post('/api/payment/create-order', async (req, res) => {
  try {
    const { amount, currency = 'INR', receipt, notes } = req.body;

    if (!amount) {
      return res.status(400).json({
        success: false,
        message: 'Amount is required'
      });
    }

    const options = {
      amount: amount * 100, // Convert to paise
      currency,
      receipt: receipt || `receipt_${Date.now()}`,
      notes: notes || {}
    };

    const order = await razorpay.orders.create(options);

    res.json({
      success: true,
      order
    });
  } catch (error) {
    console.error('Razorpay order creation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create order',
      error: error.message
    });
  }
});

app.post('/api/payment/verify-payment', async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: 'Missing payment verification data'
      });
    }

    // Create signature
    const sign = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac("sha256", process.env.RAZORPAY_SECRET)
      .update(sign.toString())
      .digest("hex");

    if (razorpay_signature === expectedSign) {
      res.json({
        success: true,
        message: 'Payment verified successfully',
        payment_id: razorpay_payment_id
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Invalid payment signature'
      });
    }
  } catch (error) {
    console.error('Payment verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Payment verification failed',
      error: error.message
    });
  }
});

console.log('✅ Payment routes loaded');

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'RentRide API is running' });
});

// Temporary admin creation endpoint (remove in production)
app.post('/api/create-admin', async (req, res) => {
  try {
    console.log('🔧 Manual admin creation requested...');

    const bcrypt = (await import('bcryptjs')).default;
    const hashedPassword = await bcrypt.hash('admin123', 10);

    // Try to create admin user without role column first
    const { data: newAdmin, error: createError } = await supabase
      .from('users')
      .insert([{
        email: 'admin@rentride.com',
        password: hashedPassword,
        first_name: 'Admin',
        last_name: 'User',
        email_verified: true
      }])
      .select()
      .single();

    if (createError) {
      console.error('❌ Error creating admin user:', createError);
      return res.status(500).json({ success: false, error: createError.message });
    }

    console.log('✅ Admin user created successfully');
    res.json({
      success: true,
      message: 'Admin user created successfully',
      credentials: {
        email: 'admin@rentride.com',
        password: 'admin123'
      }
    });

  } catch (error) {
    console.error('❌ Error in manual admin creation:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Test admin route directly on app
app.get('/api/admin/direct-test', (req, res) => {
  console.log('🎯 Direct admin test route accessed');
  res.json({ success: true, message: 'Direct admin route works!' });
});

// Simple test route to verify admin path works
app.get('/api/admin/simple-test', (req, res) => {
  console.log('🧪 Simple admin test route accessed');
  res.json({ success: true, message: 'Simple admin route works!' });
});





// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: 'Something went wrong!' });
});

// Start server
const server = app.listen(PORT, async () => {
  console.log(`🚀 [STARTUP] Server handle created. Listening on port ${PORT}`);
  console.log(`🚗 RentRide API server running on port ${PORT}`);
  console.log(`🌐 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:8080'}`);

  try {
    // Ensure admin user exists
    console.log('🔧 [INIT] Ensuring admin exists...');
    await ensureAdminExists();
    console.log('✅ [INIT] Admin check complete');

    // Test email configuration
    console.log('🔧 [INIT] Testing email config...');
    const emailConfigValid = await testEmailConfig();
    if (emailConfigValid) {
      console.log(`📧 [INIT] Email service configured and ready`);
    } else {
      console.log(`⚠️  [INIT] Email service configuration issues detected`);
    }

    console.log(`⏸️  [INIT] Reminder service disabled - database schema updating`);

    console.log('✨ [SUCCESS] Server fully initialized and ready');
  } catch (err) {
    console.error('💥 [CRIT] Error during server initialization:', err);
  }

  // Persistent keep-alive heartbeat
  setInterval(() => {
    // Keep event loop active
  }, 1000 * 60 * 60); // 1 hour
});

server.on('error', (err) => {
  console.error('💥 [CRIT] TCP Server Error:', err);
  if (err.code === 'EADDRINUSE') {
    console.error(`❌ Port ${PORT} is already in use. Please kill the other process.`);
  }
});

process.on('SIGTERM', () => {
  console.log('🛑 [SHUTDOWN] SIGTERM received. Closing server...');
  server.close(() => {
    console.log('⏹️  [SHUTDOWN] Server closed.');
    process.exit(0);
  });
});

export default app;