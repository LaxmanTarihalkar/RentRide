import express from 'express';
const router = express.Router();
import { supabase } from '../config/supabase.js';
import { verifyToken } from '../utils/auth.js';

// Middleware to verify admin access
const verifyAdmin = async (req, res, next) => {
    try {
        const user = await verifyToken(req, res, () => { });
        if (!user) {
            return res.status(401).json({ success: false, message: 'Authentication required' });
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
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Get all vehicle categories
router.get('/categories', async (req, res) => {
    try {
        const { data: categories, error } = await supabase
            .from('vehicle_categories')
            .select('*')
            .order('name');

        if (error) {
            throw error;
        }

        res.json({
            success: true,
            data: categories || []
        });
    } catch (error) {
        console.error('Error fetching categories:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch vehicle categories'
        });
    }
});

// Get all vehicles (admin only)
router.get('/', verifyAdmin, async (req, res) => {
    try {
        const { page = 1, limit = 20, category, status, search } = req.query;
        const offset = (page - 1) * limit;

        let query = supabase
            .from('vehicles')
            .select(`
        *,
        vehicle_categories!inner(name, icon)
      `)
            .order('created_at', { ascending: false });

        // Apply filters
        if (category && category !== 'all') {
            query = query.eq('category_name', category);
        }

        if (status && status !== 'all') {
            switch (status) {
                case 'available':
                    query = query.eq('is_available', true);
                    break;
                case 'unavailable':
                    query = query.eq('is_available', false);
                    break;
                case 'verified':
                    query = query.eq('is_verified', true);
                    break;
                case 'unverified':
                    query = query.eq('is_verified', false);
                    break;
            }
        }

        if (search) {
            query = query.or(`name.ilike.%${search}%,brand.ilike.%${search}%,model.ilike.%${search}%`);
        }

        // Get total count
        const { count: totalCount } = await supabase
            .from('vehicles')
            .select('*', { count: 'exact', head: true });

        // Get paginated results
        const { data: vehicles, error } = await query
            .range(offset, offset + limit - 1);

        if (error) {
            throw error;
        }

        res.json({
            success: true,
            data: {
                vehicles: vehicles || [],
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total: totalCount || 0,
                    totalPages: Math.ceil((totalCount || 0) / limit)
                }
            }
        });
    } catch (error) {
        console.error('Error fetching vehicles:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch vehicles'
        });
    }
});

// Get public vehicles (for customers)
router.get('/public', async (req, res) => {
    try {
        const { category, location, minPrice, maxPrice, page = 1, limit = 12 } = req.query;
        const offset = (page - 1) * limit;

        let query = supabase
            .from('vehicles')
            .select(`
        id,
        name,
        category_name,
        brand,
        model,
        year,
        description,
        price_per_day,
        price_per_hour,
        primary_image,
        location,
        latitude,
        longitude,
        features,
        specifications,
        is_available
      `)
            .eq('is_available', true)
            .eq('is_verified', true)
            .order('created_at', { ascending: false });

        // Apply filters
        if (category && category !== 'all') {
            query = query.eq('category_name', category);
        }

        if (location) {
            query = query.ilike('location', `%${location}%`);
        }

        if (minPrice) {
            query = query.gte('price_per_day', parseFloat(minPrice));
        }

        if (maxPrice) {
            query = query.lte('price_per_day', parseFloat(maxPrice));
        }

        const { data: vehicles, error } = await query
            .range(offset, offset + limit - 1);

        if (error) {
            throw error;
        }

        res.json({
            success: true,
            data: vehicles || []
        });
    } catch (error) {
        console.error('Error fetching public vehicles:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch vehicles'
        });
    }
});

// Get single vehicle
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const { data: vehicle, error } = await supabase
            .from('vehicles')
            .select(`
        *,
        vehicle_categories!inner(name, icon, description)
      `)
            .eq('id', id)
            .single();

        if (error) {
            throw error;
        }

        if (!vehicle) {
            return res.status(404).json({
                success: false,
                message: 'Vehicle not found'
            });
        }

        res.json({
            success: true,
            data: vehicle
        });
    } catch (error) {
        console.error('Error fetching vehicle:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch vehicle'
        });
    }
});

// Middleware to verify user access (any authenticated user)
const verifyUser = async (req, res, next) => {
    try {
        const user = await verifyToken(req, res, () => { });
        if (!user) {
            // verifyToken already sends response if failed
            return;
        }
        req.user = user;
        next();
    } catch (error) {
        console.error('User verification error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Create new vehicle (Authenticated Users)
router.post('/', verifyUser, async (req, res) => {
    try {
        const {
            name,
            category_id,
            category_name,
            brand,
            model,
            year,
            description,
            specifications,
            price_per_day,
            price_per_hour,
            price_per_week,
            price_per_month,
            primary_image,
            additional_images,
            location,
            latitude,
            longitude,
            city,
            features,
            license_plate
        } = req.body;

        // Validate required fields
        if (!model || !brand || !price_per_day || !primary_image || !location) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields' // Improved validation message could be helpful
            });
        }

        // 1. Resolve Owner ID from Authenticated User
        const { data: owner, error: ownerError } = await supabase
            .from('owners')
            .select('id')
            .eq('user_id', req.user.id) // Use the ID from the token, not the body
            .single();

        if (ownerError || !owner) {
            return res.status(403).json({
                success: false,
                message: 'Owner profile not found. Please register as an owner first.'
            });
        }

        // 2. Resolve Category ID if missing
        let validCategoryId = category_id;
        let validCategoryName = category_name;

        if (!validCategoryId && validCategoryName) {
            const { data: cat, error: catError } = await supabase
                .from('vehicle_categories')
                .select('id, name')
                .eq('name', validCategoryName)
                .single();

            if (cat) {
                validCategoryId = cat.id;
            }
        }

        // If still no category ID, try to find by name default or error out? 
        // For now, if we have category_name but no ID, we might insert null? 
        // The schema enforces FK on category_id? Let's check -> YES. 
        // So we MUST find it.

        if (!validCategoryId && validCategoryName) {
            // Fallback: Try case insensitive search or similar? 
            // Or just error.
            const { data: cat } = await supabase.from('vehicle_categories').select('id').ilike('name', validCategoryName).single();
            if (cat) validCategoryId = cat.id;
        }

        if (!validCategoryId) {
            return res.status(400).json({ success: false, message: 'Invalid vehicle category' });
        }


        // 3. Insert Vehicle
        // Using Service Role/Server logic, so we bypass RLS if configured correctly using service key in 'supabase.js'
        // Check config/supabase.js -> it uses process.env.SUPABASE_SERVICE_KEY if available.

        const { data: vehicle, error } = await supabase
            .from('vehicles')
            .insert([{
                owner_id: owner.id,
                name: name || model, // Fallback if name not provided
                category_id: validCategoryId,
                category_name: validCategoryName,
                brand,
                model,
                year: parseInt(year) || 2025,
                description,
                specifications: specifications || {},
                price_per_day: parseFloat(price_per_day),
                price_per_hour: price_per_hour ? parseFloat(price_per_hour) : null,
                primary_image,
                additional_images: additional_images || [],
                location,
                latitude: latitude || null,
                longitude: longitude || null,
                city: city || (location ? location.split(',')[0].trim() : 'Unknown'),
                features: features || [],
                license_plate,
                is_verified: true, // Auto-verify for now
                is_available: true,
                status: 'available'
            }])
            .select()
            .single();

        if (error) {
            throw error;
        }

        res.status(201).json({
            success: true,
            message: 'Vehicle created successfully',
            data: vehicle
        });
    } catch (error) {
        console.error('Error creating vehicle:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create vehicle: ' + error.message
        });
    }
});

// Update vehicle (admin only)
router.put('/:id', verifyAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        // Remove id from update data
        delete updateData.id;
        delete updateData.created_at;
        delete updateData.updated_at;

        // If category_id is being updated, get the category name
        if (updateData.category_id) {
            const { data: category, error: categoryError } = await supabase
                .from('vehicle_categories')
                .select('name')
                .eq('id', updateData.category_id)
                .single();

            if (categoryError || !category) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid category'
                });
            }

            updateData.category_name = category.name;
        }

        // Convert numeric fields
        if (updateData.year) updateData.year = parseInt(updateData.year);
        if (updateData.price_per_day) updateData.price_per_day = parseFloat(updateData.price_per_day);
        if (updateData.price_per_hour) updateData.price_per_hour = parseFloat(updateData.price_per_hour);
        if (updateData.price_per_week) updateData.price_per_week = parseFloat(updateData.price_per_week);
        if (updateData.price_per_month) updateData.price_per_month = parseFloat(updateData.price_per_month);

        const { data: vehicle, error } = await supabase
            .from('vehicles')
            .update(updateData)
            .eq('id', id)
            .select()
            .single();

        if (error) {
            throw error;
        }

        if (!vehicle) {
            return res.status(404).json({
                success: false,
                message: 'Vehicle not found'
            });
        }

        res.json({
            success: true,
            message: 'Vehicle updated successfully',
            data: vehicle
        });
    } catch (error) {
        console.error('Error updating vehicle:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update vehicle'
        });
    }
});

// Toggle vehicle availability (admin only)
router.patch('/:id/toggle-availability', verifyAdmin, async (req, res) => {
    try {
        const { id } = req.params;

        // Get current status
        const { data: currentVehicle, error: fetchError } = await supabase
            .from('vehicles')
            .select('is_available')
            .eq('id', id)
            .single();

        if (fetchError || !currentVehicle) {
            return res.status(404).json({
                success: false,
                message: 'Vehicle not found'
            });
        }

        // Toggle availability
        const { data: vehicle, error } = await supabase
            .from('vehicles')
            .update({ is_available: !currentVehicle.is_available })
            .eq('id', id)
            .select()
            .single();

        if (error) {
            throw error;
        }

        res.json({
            success: true,
            message: `Vehicle ${vehicle.is_available ? 'activated' : 'deactivated'} successfully`,
            data: vehicle
        });
    } catch (error) {
        console.error('Error toggling vehicle availability:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update vehicle availability'
        });
    }
});

// Delete vehicle (admin only)
router.delete('/:id', verifyAdmin, async (req, res) => {
    try {
        const { id } = req.params;

        // Check if vehicle has active bookings
        const { data: activeBookings, error: bookingError } = await supabase
            .from('bookings')
            .select('id')
            .eq('vehicle_id', id)
            .eq('booking_status', 'confirmed');

        if (bookingError) {
            throw bookingError;
        }

        if (activeBookings && activeBookings.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Cannot delete vehicle with active bookings'
            });
        }

        const { error } = await supabase
            .from('vehicles')
            .delete()
            .eq('id', id);

        if (error) {
            throw error;
        }

        res.json({
            success: true,
            message: 'Vehicle deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting vehicle:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete vehicle'
        });
    }
});

export default router;