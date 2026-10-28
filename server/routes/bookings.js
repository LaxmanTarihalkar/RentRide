import express from 'express';
import { supabase } from '../config/supabase.js';
import jwt from 'jsonwebtoken';
import { sendBookingConfirmation } from '../services/emailService.js';

const router = express.Router();

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ success: false, message: 'Access token required' });
  }

  console.log('Verifying token:', token ? `${token.substring(0, 10)}...` : 'No token');

  jwt.verify(token, process.env.JWT_SECRET || '699ea4773f120bfc22ed946b47ef164963161f9c851e56209d5b79ad656d23c8', (err, user) => {
    if (err) {
      console.error('JWT Verification Error:', err.message);
      return res.status(403).json({ success: false, message: 'Invalid token', error: err.message });
    }
    req.user = user;
    next();
  });
};

// Create a new booking
router.post('/create', authenticateToken, async (req, res) => {
  console.log('Create booking request. User:', req.user); // Debug log
  try {
    const {
      car_id,
      car_name,
      car_category,
      car_image,
      car_price,
      from_date,
      from_time,
      to_date,
      to_time,
      days,
      total_price,
      payment_amount,
      payment_type,
      remaining_amount,
      payment_id,
      order_id
    } = req.body;

    // Generate a human-readable booking ID
    const bookingIdString = `BK${Date.now().toString().slice(-8)}${Math.floor(Math.random() * 1000)}`;

    // Insert into bookings table
    const { data: bookingData, error: bookingError } = await supabase
      .from('bookings')
      .insert([
        {
          booking_id: bookingIdString,
          user_id: req.user.userId,
          vehicle_id: car_id, // Map car_id to vehicle_id
          pickup_date: `${from_date}T${from_time || '10:00:00'}`,
          return_date: `${to_date}T${to_time || '10:00:00'}`,
          total_days: days,
          price_per_day: car_price,
          total_amount: total_price,
          payment_amount: payment_amount,
          remaining_amount: remaining_amount,
          booking_status: 'confirmed',
          payment_status: 'paid',
          payment_type: payment_type
          // Removed payment_id and order_id columns as they belong in payments table
        }
      ])
      .select(`
        *,
        vehicles (
          name,
          brand,
          model,
          category_name,
          primary_image,
          location
        )
      `)
      .single();

    if (bookingError) {
      console.error('Booking creation error:', bookingError);
      return res.status(500).json({
        success: false,
        message: 'Failed to create booking',
        error: bookingError.message
      });
    }

    console.log('Booking created successfully:', bookingData);

    // Insert into payments table
    if (payment_id) {
      const { error: paymentError } = await supabase
        .from('payments')
        .insert([
          {
            payment_id: payment_id, // Razorpay Payment ID
            booking_id: bookingData.id,
            user_id: req.user.userId,
            amount: payment_amount,
            payment_method: 'razorpay',
            gateway_payment_id: payment_id,
            gateway_order_id: order_id,
            payment_status: 'completed',
            payment_date: new Date().toISOString()
          }
        ]);

      if (paymentError) {
        console.error('Payment record creation error:', paymentError);
        // We continue even if payment logging fails, but log it critical
      } else {
        console.log('Payment recorded successfully');
      }
    }

    // Send booking confirmation email
    try {
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('email, first_name, last_name')
        .eq('id', req.user.userId)
        .single();

      if (!userError && userData) {
        // Calculate Earnings (70% Owner, 30% Admin)
        const totalAmount = parseFloat(total_price);
        const ownerShare = totalAmount * 0.70;
        const adminShare = totalAmount * 0.30;

        // Get Owner ID from Vehicle
        const { data: vehicleData } = await supabase
          .from('vehicles')
          .select('owner_id')
          .eq('id', car_id) // car_id is mapped to vehicle_id
          .single();

        if (vehicleData && vehicleData.owner_id) {
          // 1. Update Owner Wallet (Fetch + Update pattern for simplicity)
          const { data: currentOwner } = await supabase
            .from('owners')
            .select('wallet_balance')
            .eq('id', vehicleData.owner_id)
            .single();

          const currentBalance = parseFloat(currentOwner?.wallet_balance || 0);
          const newBalance = currentBalance + ownerShare;

          await supabase
            .from('owners')
            .update({ wallet_balance: newBalance })
            .eq('id', vehicleData.owner_id);

          // 2. Log Transaction
          await supabase
            .from('transactions')
            .insert({
              booking_id: bookingData.id,
              owner_id: vehicleData.owner_id,
              amount: ownerShare,
              admin_share: adminShare,
              type: 'credit',
              description: `Booking earnings for ${car_name} (${days} days)`
            });

          console.log(`💰 Earnings processed: Owner +₹${ownerShare}, Admin +₹${adminShare}`);
        }

        const emailResult = await sendBookingConfirmation(bookingData, userData);

        if (emailResult.success) {
          // Update booking to mark confirmation email as sent
          await supabase
            .from('bookings')
            .update({ confirmation_email_sent: true })
            .eq('id', bookingData.id);
        }
      }
    } catch (emailError) {
      console.error('Error in post-booking processing (email/earnings):', emailError);
      // Don't fail the booking creation if secondary processes fail
    }

    res.json({
      success: true,
      message: 'Booking created successfully',
      booking: bookingData
    });
  } catch (error) {
    console.error('Booking creation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create booking',
      error: error.message
    });
  }
});

// Get all bookings for a user
router.get('/my-bookings', authenticateToken, async (req, res) => {
  console.log('Fetch bookings for user:', req.user); // Debug log
  try {
    const { data, error } = await supabase
      .from('bookings')
      .select('*, vehicles(*)') // Join vehicles to get all car details
      .eq('user_id', req.user.userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Fetch bookings error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch bookings',
        error: error.message
      });
    }

    // Categorize bookings
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const upcoming = data.filter(booking => {
      const pickupDate = new Date(booking.pickup_date);
      return pickupDate >= now && booking.booking_status === 'confirmed';
    });

    const ongoing = data.filter(booking => {
      const pickupDate = new Date(booking.pickup_date);
      const returnDate = new Date(booking.return_date);
      return pickupDate <= now && returnDate >= now && booking.booking_status === 'confirmed';
    });

    const completed = data.filter(booking => {
      const returnDate = new Date(booking.return_date);
      return returnDate < now || booking.booking_status === 'completed';
    });

    const cancelled = data.filter(booking => booking.booking_status === 'cancelled');

    res.json({
      success: true,
      bookings: {
        all: data,
        upcoming,
        ongoing,
        completed,
        cancelled
      }
    });
  } catch (error) {
    console.error('Fetch bookings error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch bookings',
      error: error.message
    });
  }
});


// Get all bookings for an owner (bookings on their vehicles)
router.get('/owner-bookings', authenticateToken, async (req, res) => {
  console.log('Fetch owner bookings for user:', req.user.userId);
  try {
    // 1. Get Owner ID
    const { data: owner, error: ownerError } = await supabase
      .from('owners')
      .select('id')
      .eq('user_id', req.user.userId)
      .single();

    if (ownerError || !owner) {
      console.error('Owner not found for user:', req.user.userId);
      return res.status(404).json({ success: false, message: 'Owner account not found' });
    }

    // 2. Fetch Bookings for this Owner's Vehicles
    // We join vehicles to filter by owner_id, and users to get customer info
    const { data, error } = await supabase
      .from('bookings')
      .select(`
        *,
        vehicles!inner (
          id,
          model,
          brand,
          name,
          primary_image,
          owner_id
        ),
        users (
          first_name,
          last_name,
          email,
          phone
        )
      `)
      .eq('vehicles.owner_id', owner.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Fetch owner bookings error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch bookings',
        error: error.message
      });
    }

    res.json({
      success: true,
      bookings: data
    });

  } catch (error) {
    console.error('Fetch owner bookings error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch bookings',
      error: error.message
    });
  }
});

// Get a specific booking
router.get('/:bookingId', authenticateToken, async (req, res) => {
  try {
    const { bookingId } = req.params;

    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .eq('id', bookingId)
      .eq('user_id', req.user.userId)
      .single();

    if (error) {
      console.error('Fetch booking error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch booking',
        error: error.message
      });
    }

    if (!data) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    res.json({
      success: true,
      booking: data
    });
  } catch (error) {
    console.error('Fetch booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch booking',
      error: error.message
    });
  }
});

// Cancel a booking
router.patch('/:bookingId/cancel', authenticateToken, async (req, res) => {
  try {
    const { bookingId } = req.params;

    // Check if booking exists and belongs to user
    const { data: existingBooking, error: fetchError } = await supabase
      .from('bookings')
      .select('*')
      .eq('id', bookingId)
      .eq('user_id', req.user.userId)
      .single();

    if (fetchError || !existingBooking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check if booking can be cancelled (only upcoming bookings)
    const fromDate = new Date(existingBooking.from_date);
    const today = new Date();

    if (fromDate <= today) {
      return res.status(400).json({
        success: false,
        message: 'Cannot cancel ongoing or past bookings'
      });
    }

    // Update booking status
    const { data, error } = await supabase
      .from('bookings')
      .update({ booking_status: 'cancelled' })
      .eq('id', bookingId)
      .eq('user_id', req.user.userId)
      .select()
      .single();

    if (error) {
      console.error('Cancel booking error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to cancel booking',
        error: error.message
      });
    }

    res.json({
      success: true,
      message: 'Booking cancelled successfully',
      booking: data
    });
  } catch (error) {
    console.error('Cancel booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cancel booking',
      error: error.message
    });
  }
});

export default router;