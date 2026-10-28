# RentRide Multi-Vehicle System Setup

## 🚀 Quick Setup Instructions

### 1. Database Setup (Supabase)

1. **Go to your Supabase project dashboard**
2. **Navigate to SQL Editor**
3. **Run the vehicle schema script:**
   - Copy the contents of `server/database/vehicles_schema.sql`
   - Paste and execute in Supabase SQL Editor

### 2. Admin Panel Access

1. **Login as admin:**
   - Email: `admin@rentride.com`
   - Password: `admin123`

2. **Access Vehicle Management:**
   - Go to http://localhost:8080/admin
   - Click on "Manage Vehicles" in the sidebar

### 3. Features Available

#### Admin Vehicle Management:
- ✅ Add any type of vehicle (Cars, Motorcycles, Bicycles, Boats, RVs, etc.)
- ✅ Upload vehicle images
- ✅ Set flexible pricing (hourly, daily, weekly, monthly)
- ✅ Manage vehicle specifications
- ✅ Add features and amenities
- ✅ Control availability status
- ✅ Search and filter vehicles
- ✅ Edit and delete vehicles

#### Vehicle Categories Supported:
- 🚗 **Cars** - Standard passenger vehicles
- 🚙 **SUVs** - Sport Utility Vehicles
- 🏍️ **Motorcycles** - Two-wheeler motorcycles
- 🚲 **Bicycles** - Pedal bicycles
- 🚛 **Trucks** - Commercial trucks
- 🚐 **Vans** - Passenger and cargo vans
- 🚌 **Buses** - Passenger buses
- 🛥️ **Boats** - Water vehicles
- 🏠 **RVs** - Recreational vehicles
- 🏔️ **ATVs** - All-terrain vehicles

#### Customer Features:
- Browse all available vehicles by category
- Filter by location, price range, and features
- View detailed vehicle specifications
- Book any vehicle type

### 4. API Endpoints

#### Vehicle Management (Admin):
- `GET /api/vehicles` - Get all vehicles (admin)
- `POST /api/vehicles` - Create new vehicle
- `PUT /api/vehicles/:id` - Update vehicle
- `DELETE /api/vehicles/:id` - Delete vehicle
- `PATCH /api/vehicles/:id/toggle-availability` - Toggle availability

#### Public Endpoints:
- `GET /api/vehicles/public` - Get available vehicles (customers)
- `GET /api/vehicles/categories` - Get vehicle categories
- `GET /api/vehicles/:id` - Get single vehicle details

### 5. Sample Data

The schema includes sample vehicles:
- Honda City Premium (Car)
- Royal Enfield Classic 350 (Motorcycle)
- Mahindra Thar 4x4 (SUV)

### 6. Next Steps

1. **Run the database schema** in Supabase
2. **Login to admin panel** and start adding vehicles
3. **Test the system** by browsing vehicles as a customer
4. **Customize categories** and add more vehicle types as needed

## 🎉 Your Multi-Vehicle Rental System is Ready!

The system now supports:
- ✅ Multiple vehicle types
- ✅ Flexible pricing models
- ✅ Rich vehicle specifications
- ✅ Image management
- ✅ Admin controls
- ✅ Customer browsing
- ✅ Booking system integration

Visit http://localhost:8080/admin to start managing your vehicle fleet! 🚗🏍️🚲🛥️