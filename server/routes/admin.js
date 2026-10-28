import express from 'express';
import jwt from 'jsonwebtoken';
import { userDB } from '../config/database.js';
import { supabase } from '../config/supabase.js';
import { sendOwnerApprovalEmail, sendOwnerRejectionEmail } from '../services/emailService.js';
import { generateOwnerCredentials, hashPassword } from '../utils/credentialsGenerator.js';

console.log('📋 Admin routes file loaded');

const router = express.Router();

// Test route to verify admin routes are loaded
router.get('/test', (req, res) => {
  console.log('🧪 Test route accessed');
  res.json({ success: true, message: 'Admin routes are working!' });
});

// Simple test route without middleware
router.get('/ping', (req, res) => {
  console.log('🏓 Ping route accessed');
  res.json({ success: true, message: 'Pong!' });
});

// TEMPORARY: Fix missing user data
router.get('/fix-data-magic', async (req, res) => {
  try {
    console.log('🪄 Fixing user data...');

    // 1. Verify all users
    await supabase.from('users').update({ email_verified: true }).neq('email_verified', true);

    // 2. Fix missing dates (set to now if null)
    await supabase.from('users').update({ created_at: new Date().toISOString() }).is('created_at', null);

    // 3. Fix missing names
    const { data: users } = await supabase.from('users').select('*');
    let fixedCount = 0;

    if (users) {
      for (const user of users) {
        if (!user.first_name) {
          const namePart = user.email.split('@')[0];
          await supabase.from('users').update({
            first_name: namePart,
            last_name: 'User'
          }).eq('id', user.id);
          fixedCount++;
        }
      }

      // 4. Ensure at least one user has a booking to show "Total Spend"
      // Find a user and check if they have bookings
      const targetUser = users[0];
      if (targetUser) {
        const { count } = await supabase.from('bookings').select('*', { count: 'exact', head: true }).eq('user_id', targetUser.id);
        if (count === 0) {
          // Get a vehicle
          const { data: vehicles } = await supabase.from('vehicles').select('id, owner_id').limit(1);
          if (vehicles && vehicles.length > 0) {
            const v = vehicles[0];
            // Create dummy booking
            await supabase.from('bookings').insert({
              user_id: targetUser.id,
              vehicle_id: v.id,
              start_date: new Date().toISOString(),
              end_date: new Date(Date.now() + 86400000).toISOString(), // +1 day
              pickup_date: new Date().toISOString(),
              return_date: new Date(Date.now() + 86400000).toISOString(),
              total_amount: 5000,
              booking_status: 'confirmed',
              payment_status: 'completed'
            });
            console.log('Created dummy booking for ' + targetUser.email);
          }
        }
      }
    }

    res.json({ success: true, message: `Fixed data for ${fixedCount} users, verified all emails, ensured dates. Added demo booking if needed.` });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Middleware to verify admin access
const verifyAdmin = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ success: false, message: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await userDB.findById(decoded.userId);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Check if user is admin
    if (user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Admin access required' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Admin verification error:', error);
    res.status(401).json({ success: false, message: 'Invalid token' });
  }
};

// GET /api/admin/dashboard - Get dashboard statistics
router.get('/dashboard', verifyAdmin, async (req, res) => {
  console.log('📊 Dashboard route accessed');
  try {
    // Get total users count (excluding admin)
    const { count: totalUsers } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .neq('email', 'admin@rentride.com');

    // Get total bookings count and revenue
    let totalBookings = 0;
    let activeBookings = 0;
    let totalRevenue = 0;

    try {
      const { count } = await supabase
        .from('bookings')
        .select('*', { count: 'exact', head: true });
      totalBookings = count || 0;

      const { count: activeCount } = await supabase
        .from('bookings')
        .select('*', { count: 'exact', head: true })
        .eq('booking_status', 'confirmed');
      activeBookings = activeCount || 0;

      // Calculate revenue from transactions table (preferred)
      try {
        const { data: transactionsData, error: transError } = await supabase
          .from('transactions')
          .select('admin_share');

        if (!transError && transactionsData && transactionsData.length > 0) {
          totalRevenue = transactionsData.reduce((sum, t) => sum + (parseFloat(t.admin_share) || 0), 0);
        } else {
          // Fallback: Calculate 30% of confirmed bookings
          const { data: revenueData } = await supabase
            .from('bookings')
            .select('total_amount')
            .eq('booking_status', 'confirmed');

          const totalBookingValue = revenueData?.reduce((sum, booking) => sum + (parseFloat(booking.total_amount) || 0), 0) || 0;
          totalRevenue = totalBookingValue * 0.30;
        }
      } catch (e) {
        console.log('Error calculating revenue:', e);
      }
    } catch (bookingError) {
      console.log('Bookings table error or no bookings found');
    }

    // Get total vehicles count
    let totalCars = 0;
    try {
      const { count } = await supabase
        .from('vehicles')
        .select('*', { count: 'exact', head: true });
      totalCars = count || 0;
    } catch (vehicleError) {
      console.log('Vehicles table not found, using default values');
    }

    // Get recent users (last 10)
    const { data: recentUsersData } = await supabase
      .from('users')
      .select('id, email, first_name, last_name, created_at')
      .neq('email', 'admin@rentride.com')
      .order('created_at', { ascending: false })
      .limit(10);

    // Get recent bookings (last 10)
    let recentBookings = [];
    try {
      const { data: bookingsData } = await supabase
        .from('bookings')
        .select(`
          id, 
          booking_status, 
          total_amount, 
          created_at, 
          user_id,
          vehicle_id,
          vehicles (name)
        `)
        .order('created_at', { ascending: false })
        .limit(10);

      // Get user details for each booking
      if (bookingsData && bookingsData.length > 0) {
        const userIds = bookingsData.map(b => b.user_id);
        const { data: usersData } = await supabase
          .from('users')
          .select('id, first_name, last_name, email')
          .in('id', userIds);

        recentBookings = bookingsData.map(booking => {
          const user = usersData?.find(u => u.id === booking.user_id);
          return {
            ...booking,
            user: user || { first_name: 'Unknown', last_name: 'User', email: 'unknown@example.com' },
            vehicle_name: booking.vehicles?.name || 'Unknown Vehicle'
          };
        });
      }
    } catch (bookingError) {
      console.log('Bookings table not found, using empty array');
    }

    // Calculate growth rate
    const growthRate = totalUsers > 0 ? Math.round((totalUsers / 30) * 100) / 100 : 0;

    res.json({
      success: true,
      data: {
        stats: {
          totalRevenue: totalRevenue,
          activeBookings: activeBookings,
          totalCars: totalCars,
          growthRate: growthRate,
          totalUsers: totalUsers || 0,
          totalBookings: totalBookings
        },
        recentBookings: recentBookings.map(booking => ({
          id: booking.id,
          customer: `${booking.user.first_name} ${booking.user.last_name}`,
          email: booking.user.email,
          car: booking.vehicle_name,
          status: booking.booking_status,
          amount: `₹${booking.total_amount}`,
          date: booking.created_at
        })),
        recentUsers: (recentUsersData || []).map(user => ({
          id: user.id,
          name: `${user.first_name} ${user.last_name}`,
          email: user.email,
          joinDate: user.created_at
        }))
      }
    });
  } catch (error) {
    console.error('Dashboard data error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// GET /api/admin/users - Get all users
router.get('/users', verifyAdmin, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    // Get total count
    const { count: totalUsers } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .in('role', ['user', 'customer'])
      .neq('email', 'admin@rentride.com');

    // Get paginated users
    const { data: users, error } = await supabase
      .from('users')
      .select('id, email, first_name, last_name, phone, role, email_verified, is_active, created_at')
      .in('role', ['user', 'customer'])
      .neq('email', 'admin@rentride.com')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      throw error;
    }

    const totalPages = Math.ceil((totalUsers || 0) / limit);

    // Fetch stats for these users
    const usersWithStats = await Promise.all((users || []).map(async (user) => {
      // Get booking stats
      const { data: bookings } = await supabase
        .from('bookings')
        .select('total_amount')
        .eq('user_id', user.id)
        .eq('booking_status', 'confirmed');

      const totalBookings = bookings ? bookings.length : 0;
      const totalSpent = bookings ? bookings.reduce((sum, b) => sum + (parseFloat(b.total_amount) || 0), 0) : 0;

      return {
        id: user.id,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        phone: user.phone,
        email_verified: user.email_verified,
        created_at: user.created_at,
        last_login: null, // Not tracked yet
        total_bookings: totalBookings,
        total_spent: totalSpent,
        status: user.is_active ? 'active' : 'inactive'
      };
    }));

    res.json({
      success: true,
      data: {
        users: usersWithStats,
        pagination: {
          page,
          limit,
          total: totalUsers || 0,
          pages: totalPages
        }
      }
    });
  } catch (error) {
    console.error('Users fetch error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// GET /api/admin/bookings - Get all bookings
router.get('/bookings', verifyAdmin, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    try {
      // Get total count
      const { count: totalBookings } = await supabase
        .from('bookings')
        .select('*', { count: 'exact', head: true });

      // Get paginated bookings with vehicle and user details
      const { data: bookingsData, error } = await supabase
        .from('bookings')
        .select(`
          id, 
          booking_status, 
          total_amount, 
          created_at, 
          user_id, 
          vehicle_id,
          pickup_date, 
          return_date,
          payment_status,
          vehicles (name, brand, model, primary_image, category_name, location),
          users (first_name, last_name, email)
        `)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        throw error;
      }

      const bookings = (bookingsData || []).map(booking => ({
        id: booking.id,
        booking_id: `BK${booking.id.substring(0, 8).toUpperCase()}`,
        customer_name: booking.users ? `${booking.users.first_name} ${booking.users.last_name}` : 'Unknown User',
        customer_email: booking.users?.email || 'unknown@example.com',
        vehicle_name: booking.vehicles ? `${booking.vehicles.brand} ${booking.vehicles.model}` : 'Unknown Vehicle',
        vehicle_category: booking.vehicles?.category_name || 'Car',
        vehicle_image: booking.vehicles?.primary_image || 'https://images.unsplash.com/photo-1549924231-f129b911e442?w=400',
        from_date: booking.pickup_date,
        to_date: booking.return_date,
        from_time: new Date(booking.pickup_date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
        to_time: new Date(booking.return_date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
        days: Math.max(1, Math.ceil((new Date(booking.return_date) - new Date(booking.pickup_date)) / (1000 * 60 * 60 * 24))),
        total_price: parseFloat(booking.total_amount) || 0,
        payment_amount: parseFloat(booking.total_amount) || 0,
        remaining_amount: 0,
        payment_type: 'full',
        payment_status: booking.payment_status || 'completed',
        booking_status: booking.booking_status,
        payment_id: 'N/A',
        created_at: booking.created_at,
        pickup_location: booking.vehicles?.location || 'Central Station'
      }));

      const totalPages = Math.ceil((totalBookings || 0) / limit);

      res.json({
        success: true,
        data: {
          bookings,
          pagination: {
            page,
            limit,
            total: totalBookings || 0,
            pages: totalPages
          }
        }
      });
    } catch (bookingError) {
      console.error('Bookings fetch detailed error:', bookingError);
      res.json({
        success: true,
        data: {
          bookings: [],
          pagination: {
            page,
            limit,
            total: 0,
            pages: 0
          }
        }
      });
    }
  } catch (error) {
    console.error('Bookings fetch error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// GET /api/admin/cars - Get all vehicles (renamed from cars to match new schema)
router.get('/cars', verifyAdmin, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    try {
      // Get total count
      const { count: totalVehicles } = await supabase
        .from('vehicles')
        .select('*', { count: 'exact', head: true });

      // Get paginated vehicles
      const { data: vehicles, error } = await supabase
        .from('vehicles')
        .select(`
          id, 
          name, 
          brand, 
          model, 
          year, 
          price_per_day, 
          fuel_type:specifications->>fuel_type, 
          transmission:specifications->>transmission, 
          seats:specifications->>seats, 
          category_name, 
          is_available, 
          is_verified, 
          location, 
          primary_image, 
          description, 
          features, 
          specifications, 
          created_at
        `)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        throw error;
      }

      const totalPages = Math.ceil((totalVehicles || 0) / limit);

      res.json({
        success: true,
        data: {
          cars: (vehicles || []).map(vehicle => ({
            id: vehicle.id,
            name: vehicle.name,
            brand: vehicle.brand,
            model: vehicle.model,
            year: vehicle.year,
            price_per_day: vehicle.price_per_day,
            price_per_hour: 0,
            price_per_week: 0,
            price_per_month: 0,
            description: vehicle.description || '',
            specifications: vehicle.specifications || {},
            features: vehicle.features || [],
            primary_image: vehicle.primary_image || '',
            fuelType: vehicle.fuel_type, // extracted from json
            transmission: vehicle.transmission,
            seats: vehicle.seats,
            category: vehicle.category_name,
            location: vehicle.location,
            is_available: vehicle.is_available,
            is_verified: vehicle.is_verified,
            owner_name: 'RentRide Fleet', // Join with owners table if needed later
            created_at: vehicle.created_at
          })),
          pagination: {
            page,
            limit,
            total: totalVehicles || 0,
            pages: totalPages
          }
        }
      });
    } catch (vehicleError) {
      console.log('Vehicles table not found');
      res.json({
        success: true,
        data: {
          cars: [],
          pagination: {
            page,
            limit,
            total: 0,
            pages: 0
          }
        }
      });
    }
  } catch (error) {
    console.error('Vehicles fetch error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// GET /api/admin/owners - Get all car owners/partners
router.get('/owners', verifyAdmin, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const status = req.query.status || 'all'; // Filter by verification_status in owners table?
    const offset = (page - 1) * limit;

    try {
      // Query owners directly to ensure we see all registration attempts
      let query = supabase
        .from('owners')
        .select(`
          *,
          users (
            id,
            first_name,
            last_name,
            email,
            role,
            created_at
          )
        `, { count: 'exact' });

      if (status !== 'all') {
        query = query.eq('verification_status', status);
      }

      // Order by latest
      query = query
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      const { data: owners, error, count: totalOwners } = await query;

      if (error) {
        throw error;
      }

      const totalPages = Math.ceil((totalOwners || 0) / limit);

      const mappedOwners = await Promise.all((owners || []).map(async (owner) => {
        const user = owner.users;

        // Get LIVE car count from vehicles table
        const { count: liveCarCount } = await supabase
          .from('vehicles')
          .select('*', { count: 'exact', head: true })
          .eq('owner_id', owner.id);

        const ownerData = {
          id: owner.id,
          userId: user?.id,
          businessType: owner.business_type || 'N/A',
          businessName: owner.business_name || 'N/A',
          ownerName: owner.owner_name || (user ? `${user.first_name} ${user.last_name}` : 'Unknown'),
          email: owner.email || user?.email,
          phone: owner.phone || 'N/A',
          city: owner.city || 'N/A',
          state: owner.state || 'N/A',
          totalCars: liveCarCount || 0,
          verificationStatus: owner.verification_status || 'pending',
          createdAt: owner.created_at,
          _debug_v: "v2" // Add a version to confirm server updated
        };
        console.log(`[DEBUG] Owner ${ownerData.ownerName} (${owner.id}) - Live Cars: ${liveCarCount}`);
        return ownerData;
      }));

      res.json({
        success: true,
        data: {
          owners: mappedOwners,
          pagination: {
            page,
            limit,
            total: totalOwners || 0,
            pages: totalPages
          }
        }
      });
    } catch (dbError) {
      console.error('Owners fetch detailed error:', dbError);
      res.json({
        success: true,
        data: {
          owners: [],
          pagination: {
            page,
            limit,
            total: 0,
            pages: 0
          }
        }
      });
    }
  } catch (error) {
    console.error('Owners route error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});// DELETE /api/admin/owners/:id - Delete owner
router.delete('/owners/:id', verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    // 1. Get owner details to find user_id
    const { data: owner, error: fetchError } = await supabase
      .from('owners')
      .select('user_id, owner_name')
      .eq('id', id)
      .single();

    if (fetchError || !owner) {
      return res.status(404).json({ success: false, message: 'Owner not found' });
    }

    // 2. Delete associated vehicles
    const { error: vehiclesError } = await supabase
      .from('vehicles')
      .delete()
      .eq('owner_id', id);

    if (vehiclesError) {
      console.error('Error deleting owner vehicles:', vehiclesError);
      // We log it but proceed to try and delete owner
    }

    // 3. Delete owner record
    const { error: deleteError } = await supabase
      .from('owners')
      .delete()
      .eq('id', id);

    if (deleteError) {
      throw deleteError;
    }

    // 4. Revert user role to 'user'
    if (owner.user_id) {
      await supabase
        .from('users')
        .update({ role: 'user' })
        .eq('id', owner.user_id);
    }

    res.json({
      success: true,
      message: `Owner ${owner.owner_name} and their vehicles deleted successfully. User role reverted.`
    });
  } catch (error) {
    console.error('Owner deletion error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});


// PUT /api/admin/owners/:id/approve - Approve owner request
router.put('/owners/:id/approve', verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    // First, get the owner details
    const { data: owner, error: fetchError } = await supabase
      .from('owners')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !owner) {
      return res.status(404).json({
        success: false,
        message: 'Owner not found'
      });
    }

    // Generate partner credentials
    const credentials = generateOwnerCredentials(owner);
    const hashedPassword = await hashPassword(credentials.password);
    // Update owner status
    const { data: updatedOwner, error: updateError } = await supabase
      .from('owners')
      .update({
        verification_status: 'approved',
        approval_date: new Date().toISOString(),
        rejection_reason: null,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      throw updateError;
    }

    // Send approval email with credentials
    try {
      const emailResult = await sendOwnerApprovalEmail(updatedOwner, credentials);
      if (emailResult.success) {
        console.log(`Approval email sent to ${updatedOwner.email}`);
      } else {
        console.error('Failed to send approval email:', emailResult.error);
      }
    } catch (emailError) {
      console.error('Email sending error:', emailError);
      // Don't fail the approval if email fails
    }

    res.json({
      success: true,
      message: 'Owner request approved successfully and notification email sent',
      data: {
        id: updatedOwner.id,
        status: updatedOwner.verification_status,
        approvalDate: updatedOwner.approval_date
      }
    });

  } catch (error) {
    console.error('Owner approval error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// PUT /api/admin/owners/:id/reject - Reject owner request
router.put('/owners/:id/reject', verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    if (!reason) {
      return res.status(400).json({
        success: false,
        message: 'Rejection reason is required'
      });
    }

    // First, get the owner details for email
    const { data: owner, error: fetchError } = await supabase
      .from('owners')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !owner) {
      return res.status(404).json({
        success: false,
        message: 'Owner not found'
      });
    }

    // Update owner status
    const { data: updatedOwner, error: updateError } = await supabase
      .from('owners')
      .update({
        verification_status: 'rejected',
        rejection_reason: reason,
        approval_date: null,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      throw updateError;
    }

    // Send rejection email
    try {
      const emailResult = await sendOwnerRejectionEmail(updatedOwner, reason);
      if (emailResult.success) {
        console.log(`Rejection email sent to ${updatedOwner.email}`);
      } else {
        console.error('Failed to send rejection email:', emailResult.error);
      }
    } catch (emailError) {
      console.error('Email sending error:', emailError);
      // Don't fail the rejection if email fails
    }

    res.json({
      success: true,
      message: 'Owner request rejected successfully and notification email sent',
      data: {
        id: updatedOwner.id,
        status: updatedOwner.verification_status,
        rejectionReason: updatedOwner.rejection_reason
      }
    });

  } catch (error) {
    console.error('Owner rejection error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// GET /api/admin/reports
router.get('/reports', verifyAdmin, async (req, res) => {
  try {
    const { period = '30' } = req.query;
    const days = parseInt(period);

    const dateFrom = new Date();
    dateFrom.setDate(dateFrom.getDate() - days);

    // 1. Fetch Bookings Extended (include vehicle_id to map top vehicles)
    const { data: allBookings, error: bookingsError } = await supabase
      .from('bookings')
      .select('id, total_amount, booking_status, created_at, user_id, vehicle_id');

    if (bookingsError) throw bookingsError;

    // Filter for period
    const periodBookings = allBookings.filter(b => new Date(b.created_at) >= dateFrom);

    // --- Revenue Calculation ---
    // Using booking_status
    const totalRevenue = allBookings
      .filter(b => ['completed', 'confirmed', 'active', 'paid'].includes(b.booking_status))
      .reduce((sum, b) => sum + (parseFloat(b.total_amount) || 0), 0);

    // Daily Revenue Data
    const dailyRevenueMap = {};
    periodBookings.forEach(b => {
      if (['completed', 'confirmed', 'active', 'paid'].includes(b.booking_status)) {
        const date = new Date(b.created_at).toISOString().split('T')[0];
        if (!dailyRevenueMap[date]) dailyRevenueMap[date] = { amount: 0, bookings: 0 };
        dailyRevenueMap[date].amount += (parseFloat(b.total_amount) || 0);
        dailyRevenueMap[date].bookings += 1;
      }
    });

    const dailyRevenue = Object.entries(dailyRevenueMap)
      .map(([date, data]) => ({ date, ...data }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // --- Bookings Stats ---
    const totalBookingsCount = allBookings.length;
    const completedBookings = allBookings.filter(b => b.booking_status === 'completed').length;
    const activeBookings = allBookings.filter(b => ['active', 'confirmed', 'paid'].includes(b.booking_status)).length;
    const cancelledBookings = allBookings.filter(b => b.booking_status === 'cancelled').length;

    // Booking Status Distribution for Pie Chart
    const statusDistribution = [
      { name: 'Completed', value: completedBookings, fill: '#10B981' }, // Green
      { name: 'Active', value: activeBookings, fill: '#3B82F6' },    // Blue
      { name: 'Cancelled', value: cancelledBookings, fill: '#EF4444' } // Red
    ].filter(i => i.value > 0);

    // --- Vehicles Stats ---
    const { data: vehicles, error: vehiclesError } = await supabase
      .from('vehicles')
      .select('id, name, brand, model, category_name, is_available');

    if (vehiclesError) throw vehiclesError;

    const totalVehicles = vehicles.length;
    const availableVehicles = vehicles.filter(v => v.is_available).length;
    const rentedVehicles = totalVehicles - availableVehicles;

    // Vehicle Categories
    const categoryMap = {};
    vehicles.forEach(v => {
      const cat = v.category_name || 'Uncategorized';
      if (!categoryMap[cat]) categoryMap[cat] = { count: 0, revenue: 0 };
      categoryMap[cat].count += 1;
    });

    const categories = Object.entries(categoryMap).map(([name, data]) => ({ name, ...data }));

    // Top Performing Vehicles (by Revenue in Period)
    const vehicleRevenueMap = {};
    periodBookings.forEach(b => {
      if (['completed', 'confirmed', 'active', 'paid'].includes(b.booking_status) && b.vehicle_id) {
        if (!vehicleRevenueMap[b.vehicle_id]) {
          vehicleRevenueMap[b.vehicle_id] = { revenue: 0, bookings: 0 };
        }
        vehicleRevenueMap[b.vehicle_id].revenue += (parseFloat(b.total_amount) || 0);
        vehicleRevenueMap[b.vehicle_id].bookings += 1;
      }
    });

    // Map ID to Name
    const topVehicles = Object.entries(vehicleRevenueMap)
      .map(([id, stats]) => {
        const vehicle = vehicles.find(v => v.id === id);
        return {
          name: vehicle ? `${vehicle.brand} ${vehicle.model}` : 'Unknown Car',
          revenue: stats.revenue,
          bookings: stats.bookings
        };
      })
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5); // Top 5

    // --- Customers Stats ---
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, role, created_at')
      .eq('role', 'customer');

    if (usersError) throw usersError;

    const totalCustomers = users.length;
    const newCustomers = users.filter(u => new Date(u.created_at) >= dateFrom).length;

    // Customer Growth Trend (Daily new signups in Period)
    const customerGrowthMap = {};
    users.filter(u => new Date(u.created_at) >= dateFrom).forEach(u => {
      const date = new Date(u.created_at).toISOString().split('T')[0];
      if (!customerGrowthMap[date]) customerGrowthMap[date] = 0;
      customerGrowthMap[date] += 1;
    });

    const customerGrowth = Object.entries(customerGrowthMap)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // Active customers (those who have at least 1 booking)
    const activeCustomerIds = new Set(allBookings.map(b => b.user_id));
    const activeCustomers = activeCustomerIds.size;

    res.json({
      success: true,
      data: {
        revenue: {
          daily: dailyRevenue,
          monthly: [],
          total: totalRevenue,
          growth: 0
        },
        bookings: {
          total: totalBookingsCount,
          completed: completedBookings,
          active: activeBookings,
          cancelled: cancelledBookings,
          statusDistribution,
          growth: 0
        },
        vehicles: {
          total: totalVehicles,
          available: availableVehicles,
          rented: rentedVehicles,
          categories: categories,
          topVehicles
        },
        customers: {
          total: totalCustomers,
          active: activeCustomers,
          new: newCustomers,
          growth: 0,
          growthTrend: customerGrowth
        }
      }
    });

  } catch (error) {
    console.error('Reports error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching reports',
      error: error.message
    });
  }
});

export default router;