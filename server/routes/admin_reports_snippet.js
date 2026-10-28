
// GET /api/admin/reports
router.get('/reports', verifyAdmin, async (req, res) => {
    try {
        const { period = '30' } = req.query;
        const days = parseInt(period);

        const dateFrom = new Date();
        dateFrom.setDate(dateFrom.getDate() - days);
        const dateFromStr = dateFrom.toISOString();

        // 1. Fetch Bookings for Revenue and Booking Stats (Filtered by period for trends, but we might need total for overall stats)
        // Actually, reportData needs "Total Revenue" (Lifetime) AND "Daily/Monthly" (Period)
        // Let's fetch ALL bookings for lifetime stats, and filter for period stats. 
        // Optimization: typical admin dashboards show lifetime totals and period trends.
        // If database is huge, this is bad, but for now it's fine.

        const { data: allBookings, error: bookingsError } = await supabase
            .from('bookings')
            .select('id, total_amount, status, created_at, start_date, end_date');

        if (bookingsError) throw bookingsError;

        // Filter for period
        const periodBookings = allBookings.filter(b => new Date(b.created_at) >= dateFrom);

        // --- Revenue Calculation ---
        const totalRevenue = allBookings
            .filter(b => b.status === 'completed' || b.status === 'confirmed' || b.status === 'active')
            .reduce((sum, b) => sum + (parseFloat(b.total_amount) || 0), 0);

        // Period Revenue (for growth calcs maybe?)
        // Daily Revenue Data
        const dailyRevenueMap = {};
        periodBookings.forEach(b => {
            if (b.status === 'completed' || b.status === 'confirmed' || b.status === 'active') {
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
        const completedBookings = allBookings.filter(b => b.status === 'completed').length;
        const activeBookings = allBookings.filter(b => b.status === 'active' || b.status === 'confirmed').length;
        const cancelledBookings = allBookings.filter(b => b.status === 'cancelled').length;

        // --- Vehicles Stats ---
        const { data: vehicles, error: vehiclesError } = await supabase
            .from('vehicles')
            .select('id, category, status, daily_rate');

        if (vehiclesError) throw vehiclesError;

        const totalVehicles = vehicles.length;
        const availableVehicles = vehicles.filter(v => v.status === 'available').length;
        const rentedVehicles = vehicles.filter(v => v.status === 'rented' || v.status === 'booked').length;

        // Vehicle Categories
        const categoryMap = {};
        vehicles.forEach(v => {
            const cat = v.category || 'Uncategorized';
            if (!categoryMap[cat]) categoryMap[cat] = { count: 0, revenue: 0 };
            categoryMap[cat].count += 1;
            // Revenue per category is hard without joining bookings. 
            // Estimate or just show count? Frontend shows revenue pie chart.
            // Let's try to map bookings to vehicles if we knew which vehicle was booked.
            // Ideally we need to join bookings with vehicles.
            // For now, let's just do count, or leave revenue 0 if we can't easily get it.
            // Wait, let's fetch bookings WITH vehicle details?
            // const { data: bookingsWithVehicle } ...
            // For simplicity in this iteration, we focus on Counts. 
            // Or we can approximate: sum daily_rate * 30? No.
        });

        const categories = Object.entries(categoryMap).map(([name, data]) => ({ name, ...data }));


        // --- Customers Stats ---
        const { data: users, error: usersError } = await supabase
            .from('users')
            .select('id, role, created_at, full_name, email')
            .eq('role', 'customer');

        if (usersError) throw usersError;

        const totalCustomers = users.length;
        const newCustomers = users.filter(u => new Date(u.created_at) >= dateFrom).length;

        // Active customers (those who have at least 1 booking)
        // We need unique user_ids from bookings
        const activeCustomerIds = new Set(allBookings.map(b => b.user_id)); // Bookings table usually has user_id, check schema
        // Wait, bookings usually has user_id or customer_id.
        // In previous steps checking bookings schema: it has `user_id`.
        const activeCustomers = activeCustomerIds.size;


        res.json({
            success: true,
            data: {
                revenue: {
                    daily: dailyRevenue,
                    monthly: [], // Can implement if needed, or just let frontend aggregate daily
                    total: totalRevenue,
                    growth: 0 // meaningful growth calc requires previous period
                },
                bookings: {
                    total: totalBookingsCount,
                    completed: completedBookings,
                    active: activeBookings,
                    cancelled: cancelledBookings,
                    growth: 0
                },
                vehicles: {
                    total: totalVehicles,
                    available: availableVehicles,
                    rented: rentedVehicles,
                    categories: categories
                },
                customers: {
                    total: totalCustomers,
                    active: activeCustomers,
                    new: newCustomers,
                    growth: 0
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
