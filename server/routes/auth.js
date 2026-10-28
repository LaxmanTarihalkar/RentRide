import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { userDB, tokenDB } from '../config/database.js';
import { sendEmail } from '../config/email.js';
import { supabase } from '../config/supabase.js';

const router = express.Router();

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET || '699ea4773f120bfc22ed946b47ef164963161f9c851e56209d5b79ad656d23c8', { expiresIn: '7d' });
};

// Generate random token
const generateRandomToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

// POST /api/auth/signup
router.post('/signup', async (req, res) => {
  try {
    const { email, password, firstName, lastName, role, businessName } = req.body;

    // Validation
    console.log('📝 Signup attempt:', { email, firstName, lastName, role });

    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
    }

    // Check if user exists
    const existingUser = await userDB.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Determine role (default to customer if not owner)
    const userRole = role === 'owner' ? 'owner' : 'customer';

    // Create user
    const user = await userDB.createUser(email, hashedPassword, firstName, lastName, userRole);

    // If owner, create initial owner profile
    if (userRole === 'owner') {
      const initialOwnerData = {
        user_id: user.id,
        owner_name: `${firstName} ${lastName}`,
        email: email,
        phone: 'N/A',
        business_type: 'individual',
        business_name: `${firstName}'s Fleet`,
        address: 'Not Provided',
        city: 'Not Provided',
        state: 'Not Provided',
        pincode: '000000',
        verification_status: 'approved', // Auto-approved
        created_at: new Date().toISOString()
      };

      const { error: ownerError } = await supabase.from('owners').insert([
        {
          ...initialOwnerData,
          approval_date: new Date().toISOString()
        }
      ]);

      if (ownerError) {
        console.error('❌ Failed to create owner profile for user:', user.id);
        console.error('Error Details:', ownerError.message, `(Code: ${ownerError.code})`);
      } else {
        console.log('✅ Owner profile created successfully for:', email);
      }
    }

    // Generate verification token
    const verificationToken = generateRandomToken();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    await tokenDB.createToken(user.id, verificationToken, 'email_verification', expiresAt);

    // Send verification email
    const verificationLink = `${process.env.FRONTEND_URL || 'http://localhost:8080'}/verify-email?token=${verificationToken}`;
    await sendEmail(email, 'verification', {
      name: firstName,
      link: verificationLink,
    });

    res.json({
      success: true,
      message: 'Account created! Please check your email to verify your account.',
      data: {
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
      },
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ success: false, message: 'Server error during signup' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    // Find user
    const user = await userDB.findByEmail(email);
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    // Check if email is verified
    if (!user.email_verified) {
      return res.status(403).json({
        success: false,
        message: 'Please verify your email before signing in',
        needsVerification: true,
      });
    }

    // Generate JWT
    const token = generateToken(user.id);

    res.json({
      success: true,
      message: 'Signed in successfully',
      data: {
        token,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.first_name,
          lastName: user.last_name,
          emailVerified: user.email_verified,
          role: user.role || 'customer',
        },
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Server error during login' });
  }
});

// GET /api/auth/verify-email
router.get('/verify-email', async (req, res) => {
  try {
    const { token } = req.query;

    if (!token) {
      return res.status(400).json({ success: false, message: 'Verification token is required' });
    }

    // Find valid token
    const tokenData = await tokenDB.findValidToken(token, 'email_verification');
    if (!tokenData) {
      return res.status(400).json({ success: false, message: 'Invalid or expired verification token' });
    }

    // Verify user email
    const user = await userDB.verifyEmail(tokenData.user_id);

    // Mark token as used
    await tokenDB.markTokenUsed(tokenData.id);

    // Send welcome email
    await sendEmail(user.email, 'welcome', {
      name: user.first_name,
    });

    res.json({
      success: true,
      message: 'Email verified successfully! You can now sign in.',
      data: {
        email: user.email,
      },
    });
  } catch (error) {
    console.error('Verification error:', error);
    res.status(500).json({ success: false, message: 'Server error during verification' });
  }
});

// POST /api/auth/resend-verification
router.post('/resend-verification', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required' });
    }

    // Find user
    const user = await userDB.findByEmail(email);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user.email_verified) {
      return res.status(400).json({ success: false, message: 'Email is already verified' });
    }

    // Generate new verification token
    const verificationToken = generateRandomToken();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await tokenDB.createToken(user.id, verificationToken, 'email_verification', expiresAt);

    // Send verification email
    const verificationLink = `${process.env.FRONTEND_URL || 'http://localhost:8080'}/verify-email?token=${verificationToken}`;
    await sendEmail(email, 'verification', {
      name: user.first_name,
      link: verificationLink,
    });

    res.json({
      success: true,
      message: 'Verification email sent! Please check your inbox.',
    });
  } catch (error) {
    console.error('Resend verification error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// POST /api/auth/forgot-password
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required' });
    }

    // Find user
    const user = await userDB.findByEmail(email);
    if (!user) {
      // Don't reveal if user exists
      return res.json({
        success: true,
        message: 'If an account exists with this email, you will receive a password reset link.',
      });
    }

    // Generate reset token
    const resetToken = generateRandomToken();
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await tokenDB.createToken(user.id, resetToken, 'password_reset', expiresAt);

    // Send reset email
    const resetLink = `${process.env.FRONTEND_URL || 'http://localhost:8080'}/reset-password?token=${resetToken}`;
    await sendEmail(email, 'passwordReset', {
      name: user.first_name,
      link: resetLink,
    });

    res.json({
      success: true,
      message: 'If an account exists with this email, you will receive a password reset link.',
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// POST /api/auth/reset-password
router.post('/reset-password', async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({ success: false, message: 'Token and new password are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
    }

    // Find valid token
    const tokenData = await tokenDB.findValidToken(token, 'password_reset');
    if (!tokenData) {
      return res.status(400).json({ success: false, message: 'Invalid or expired reset token' });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await userDB.updatePassword(tokenData.user_id, hashedPassword);

    // Mark token as used
    await tokenDB.markTokenUsed(tokenData.id);

    res.json({
      success: true,
      message: 'Password reset successfully! You can now sign in with your new password.',
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// POST /api/auth/logout (protected route)
router.post('/logout', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ success: false, message: 'No token provided' });
    }

    // Verify token to get user ID
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Here you could add token blacklisting or session invalidation
    // For now, we'll just invalidate any active tokens for this user
    // You could store active tokens in a database and remove them here

    // Optional: Add token to blacklist table if you implement one
    // await tokenDB.blacklistToken(token, decoded.userId);

    // Optional: Clear all active sessions for this user
    // await sessionDB.clearUserSessions(decoded.userId);

    res.json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (error) {
    console.error('Logout error:', error);
    // Even if token is invalid, return success for security
    res.json({
      success: true,
      message: 'Logged out successfully',
    });
  }
});

// GET /api/auth/me (protected route)
router.get('/me', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ success: false, message: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || '699ea4773f120bfc22ed946b47ef164963161f9c851e56209d5b79ad656d23c8');
    const user = await userDB.findById(decoded.userId);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        emailVerified: user.email_verified,
        role: user.role || 'customer',
      },
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(401).json({ success: false, message: 'Invalid token' });
  }
});

// Temporary admin dashboard route for testing
router.get('/admin-dashboard-test', async (req, res) => {
  console.log('🧪 Temporary admin dashboard test');
  res.json({
    success: true,
    data: {
      stats: {
        totalRevenue: 45231,
        activeBookings: 12,
        totalCars: 25,
        growthRate: 15.5,
        totalUsers: 150,
        totalBookings: 89
      },
      recentBookings: [],
      recentUsers: []
    }
  });
});

export default router;