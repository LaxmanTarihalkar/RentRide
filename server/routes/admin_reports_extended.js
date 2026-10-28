
// 1. Fetch Bookings Extended (include vehicle_id to map top vehicles)
// Note: bookings has vehicle_id? Should check schema. bookings.js uses 'vehicle_id'.
// We need to fetch vehicles details too to map names.
const { data: allBookings, error: bookingsError } = await supabase
    .from('bookings')
    .select('id, total_amount, booking_status, created_at, user_id, vehicle_id'); // Added vehicle_id

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

// Top Performing Vehicles (by Revenue in Period) (or All Time if prefer)
// Let's do Period Revenue for relevancy
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
// Initialize map with dates in range (optional, or just partial)
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
            statusDistribution, // NEW
            growth: 0
        },
        vehicles: {
            total: totalVehicles,
            available: availableVehicles,
            rented: rentedVehicles,
            categories: categories,
            topVehicles // NEW
        },
        customers: {
            total: totalCustomers,
            active: activeCustomers,
            new: newCustomers,
            growth: 0,
            growthTrend: customerGrowth // NEW
        }
    }
});
