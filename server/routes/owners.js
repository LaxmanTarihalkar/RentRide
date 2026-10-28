import express from 'express';
import jwt from 'jsonwebtoken';
import { supabase } from '../config/supabase.js';
import { userDB } from '../config/database.js';

const router = express.Router();

console.log('🏢 Owner routes file loaded');

// Simple test route
router.get('/ping', (req, res) => {
  console.log('🏓 Owner ping route accessed');
  res.json({ success: true, message: 'Owner routes are working!' });
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
    const isAdmin = user.email === 'admin@rentride.com';
    if (!isAdmin) {
      return res.status(403).json({ success: false, message: 'Admin access required' });
    }


    req.user = user;
    next();
  } catch (error) {
    console.error('Admin verification error:', error);
    res.status(401).json({ success: false, message: 'Invalid token' });
  }
};

// Middleware to verify Owner access (Any authenticated user who is an owner)
const verifyOwner = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ success: false, message: 'No token provided' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { userId, email, role }
    next();
  } catch (error) {
    res.status(401).json({ success: false, message: 'Invalid token' });
  }
};

// GET /api/owners/dashboard-stats - Get owner dashboard statistics
router.get('/dashboard-stats', verifyOwner, async (req, res) => {
  try {
    const userId = req.user.userId;

    // 1. Get Owner Key
    const { data: owner, error: ownerError } = await supabase
      .from('owners')
      .select('id, wallet_balance')
      .eq('user_id', userId)
      .single();

    if (ownerError || !owner) {
      return res.status(404).json({ success: false, message: 'Owner profile not found' });
    }

    // 2. Get Fleet Size
    const { count: fleetSize } = await supabase
      .from('vehicles')
      .select('*', { count: 'exact', head: true })
      .eq('owner_id', owner.id);

    // 3. Get Active Rentals (Confirmed bookings where today is within range)
    // Supabase doesn't easily support complex date range queries in one go without raw SQL or multiple filters.
    // simpler approach: Get all confirmed bookings for owner's vehicles and filter in JS (assuming list isn't huge yet)
    // Or use: pickup_date <= now AND return_date >= now
    const now = new Date().toISOString();

    // We first need the IDs of owner's vehicles
    const { data: vehicles } = await supabase
      .from('vehicles')
      .select('id')
      .eq('owner_id', owner.id);

    const vehicleIds = vehicles?.map(v => v.id) || [];

    let activeRentals = 0;
    if (vehicleIds.length > 0) {
      const { count } = await supabase
        .from('bookings')
        .select('*', { count: 'exact', head: true })
        .in('vehicle_id', vehicleIds)
        .eq('booking_status', 'confirmed')
        .lte('pickup_date', now)
        .gte('return_date', now);
      activeRentals = count || 0;
    }

    res.json({
      success: true,
      stats: {
        revenue: owner.wallet_balance || 0,
        fleetSize: fleetSize || 0,
        activeRentals: activeRentals,
        issues: 0 // Placeholder
      }
    });

  } catch (error) {
    console.error('Owner stats error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// POST /api/owners/register - Register new owner
router.post('/register', async (req, res) => {
  console.log('📝 Owner registration route accessed');
  try {
    const {
      businessType,
      businessName,
      ownerName,
      email,
      phone,
      alternatePhone,
      address,
      city,
      state,
      pincode,
      totalCars,
      carTypes,
      operatingYears,
      description,
      website,
      socialMedia,
      userId // Add userId to destructured variables
    } = req.body;

    // Validate required fields
    if (!userId || !businessType || !businessName || !ownerName || !email || !phone || !address || !city || !state || !pincode) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    // Check if owner already exists
    const { data: existingOwner } = await supabase
      .from('owners')
      .select('id')
      .eq('email', email)
      .single();

    if (existingOwner) {
      return res.status(409).json({
        success: false,
        message: 'Owner with this email already exists'
      });
    }

    // Insert new owner with immediate approval
    const { data: newOwner, error: insertError } = await supabase
      .from('owners')
      .insert({
        business_type: businessType,
        business_name: businessName,
        owner_name: ownerName,
        email,
        phone,
        alternate_phone: alternatePhone,
        address,
        city,
        state,
        pincode,
        total_cars: totalCars,
        car_types: carTypes,
        operating_years: operatingYears,
        description,
        website,
        social_media: socialMedia,
        verification_status: 'approved',
        approval_date: new Date().toISOString(),
        user_id: userId
      })
      .select()
      .single();

    if (insertError) {
      console.error('Owner registration error:', insertError);
      return res.status(500).json({
        success: false,
        message: 'Failed to register owner',
        error: insertError.message
      });
    }

    // Update user role to 'owner' immediately
    const { error: roleError } = await supabase
      .from('users')
      .update({ role: 'owner' })
      .eq('id', userId);

    if (roleError) {
      console.error('Failed to update user role to owner:', roleError);
      // We don't fail the whole request but log it
    }

    res.json({
      success: true,
      message: 'Owner registered and verified successfully',
      data: {
        id: newOwner.id,
        email: newOwner.email,
        status: newOwner.verification_status
      }
    });

  } catch (error) {
    console.error('Owner registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// GET /api/owners/requests - Get all owner requests (Admin only)
router.get('/requests', verifyAdmin, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const status = req.query.status || 'all';
    const offset = (page - 1) * limit;

    let query = supabase
      .from('owners')
      .select('*', { count: 'exact' });

    // Filter by status if specified
    if (status !== 'all') {
      query = query.eq('verification_status', status);
    }

    // Get total count
    const { count: totalRequests } = await query;

    // Get paginated data
    query = query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    const { data: requests, error } = await query;

    if (error) {
      throw error;
    }

    const totalPages = Math.ceil((totalRequests || 0) / limit);

    res.json({
      success: true,
      data: {
        requests: (requests || []).map(request => ({
          id: request.id,
          businessType: request.business_type,
          businessName: request.business_name,
          ownerName: request.owner_name,
          email: request.email,
          phone: request.phone,
          alternatePhone: request.alternate_phone,
          address: request.address,
          city: request.city,
          state: request.state,
          pincode: request.pincode,
          totalCars: request.total_cars,
          carTypes: request.car_types,
          operatingYears: request.operating_years,
          description: request.description,
          website: request.website,
          socialMedia: request.social_media,
          verificationStatus: request.verification_status,
          approvalDate: request.approval_date,
          rejectionReason: request.rejection_reason,
          createdAt: request.created_at,
          updatedAt: request.updated_at
        })),
        pagination: {
          page,
          limit,
          total: totalRequests || 0,
          pages: totalPages
        }
      }
    });

  } catch (error) {
    console.error('Fetch owner requests error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// PUT /api/owners/:id/approve - Approve owner request (Admin only)
router.put('/:id/approve', verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const { data: updatedOwner, error } = await supabase
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

    if (error) {
      throw error;
    }

    if (!updatedOwner) {
      return res.status(404).json({
        success: false,
        message: 'Owner not found'
      });
    }

    res.json({
      success: true,
      message: 'Owner request approved successfully',
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

// PUT /api/owners/:id/reject - Reject owner request (Admin only)
router.put('/:id/reject', verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    if (!reason) {
      return res.status(400).json({
        success: false,
        message: 'Rejection reason is required'
      });
    }

    const { data: updatedOwner, error } = await supabase
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

    if (error) {
      throw error;
    }

    if (!updatedOwner) {
      return res.status(404).json({
        success: false,
        message: 'Owner not found'
      });
    }

    res.json({
      success: true,
      message: 'Owner request rejected successfully',
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

// GET /api/owners/:id - Get owner details (Admin only)
router.get('/:id', verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const { data: owner, error } = await supabase
      .from('owners')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      throw error;
    }

    if (!owner) {
      return res.status(404).json({
        success: false,
        message: 'Owner not found'
      });
    }

    res.json({
      success: true,
      data: {
        id: owner.id,
        businessType: owner.business_type,
        businessName: owner.business_name,
        ownerName: owner.owner_name,
        email: owner.email,
        phone: owner.phone,
        alternatePhone: owner.alternate_phone,
        address: owner.address,
        city: owner.city,
        state: owner.state,
        pincode: owner.pincode,
        totalCars: owner.total_cars,
        carTypes: owner.car_types,
        operatingYears: owner.operating_years,
        description: owner.description,
        website: owner.website,
        socialMedia: owner.social_media,
        verificationStatus: owner.verification_status,
        approvalDate: owner.approval_date,
        rejectionReason: owner.rejection_reason,
        createdAt: owner.created_at,
        updatedAt: owner.updated_at
      }
    });

  } catch (error) {
    console.error('Fetch owner details error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

export default router;