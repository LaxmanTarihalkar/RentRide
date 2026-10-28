-- RentRide Database Schema (Compatible with existing code)
-- Run this in your Supabase SQL Editor

-- Drop existing tables if they exist (in correct order due to foreign keys)
DROP TABLE IF EXISTS public.payments CASCADE;
DROP TABLE IF EXISTS public.bookings CASCADE;
DROP TABLE IF EXISTS public.vehicles CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;

-- Create users table with roles
CREATE TABLE public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  phone TEXT,
  role TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'admin', 'staff')),
  email_verified BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create vehicles table (keeping both old and new column names for compatibility)
CREATE TABLE public.vehicles (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  brand TEXT NOT NULL,
  model TEXT NOT NULL,
  year INTEGER NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('economy', 'compact', 'midsize', 'fullsize', 'luxury', 'suv', 'sports')),
  fuel_type TEXT NOT NULL CHECK (fuel_type IN ('petrol', 'diesel', 'electric', 'hybrid')),
  transmission TEXT NOT NULL CHECK (transmission IN ('manual', 'automatic')),
  seats INTEGER NOT NULL DEFAULT 5,
  doors INTEGER NOT NULL DEFAULT 4,
  price_per_day DECIMAL(10,2) NOT NULL,
  image_url TEXT,
  features TEXT[], -- Array of features like ['AC', 'GPS', 'Bluetooth']
  is_available BOOLEAN DEFAULT TRUE,
  location TEXT NOT NULL DEFAULT 'Main Branch',
  mileage TEXT, -- e.g., "15 km/l"
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create bookings table (compatible with existing code)
CREATE TABLE public.bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  car_id INTEGER NOT NULL REFERENCES public.vehicles(id) ON DELETE RESTRICT,
  vehicle_id INTEGER NOT NULL REFERENCES public.vehicles(id) ON DELETE RESTRICT, -- Alias for compatibility
  car_name TEXT NOT NULL,
  car_category TEXT NOT NULL,
  car_image TEXT NOT NULL,
  car_price DECIMAL(10,2) NOT NULL,
  from_date DATE NOT NULL,
  pickup_date DATE NOT NULL, -- Alias for compatibility
  from_time TIME NOT NULL DEFAULT '10:00:00',
  pickup_time TIME NOT NULL DEFAULT '10:00:00', -- Alias for compatibility
  to_date DATE NOT NULL,
  return_date DATE NOT NULL, -- Alias for compatibility
  to_time TIME NOT NULL DEFAULT '10:00:00',
  return_time TIME NOT NULL DEFAULT '10:00:00', -- Alias for compatibility
  pickup_datetime TIMESTAMP WITH TIME ZONE,
  return_datetime TIMESTAMP WITH TIME ZONE,
  days INTEGER NOT NULL,
  total_days INTEGER NOT NULL, -- Alias for compatibility
  price_per_day DECIMAL(10,2) NOT NULL,
  subtotal DECIMAL(10,2) NOT NULL,
  tax_amount DECIMAL(10,2) DEFAULT 0,
  total_price DECIMAL(10,2) NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL, -- Alias for compatibility
  payment_amount DECIMAL(10,2) NOT NULL,
  payment_type TEXT NOT NULL CHECK (payment_type IN ('minimum', 'full', 'partial', 'deposit')),
  remaining_amount DECIMAL(10,2) DEFAULT 0,
  payment_id TEXT NOT NULL,
  order_id TEXT,
  booking_status TEXT NOT NULL DEFAULT 'pending' CHECK (booking_status IN ('pending', 'confirmed', 'active', 'completed', 'cancelled')),
  payment_status TEXT NOT NULL DEFAULT 'paid' CHECK (payment_status IN ('paid', 'pending', 'failed')),
  pickup_location TEXT NOT NULL DEFAULT 'Main Branch',
  return_location TEXT NOT NULL DEFAULT 'Main Branch',
  special_requests TEXT,
  confirmation_email_sent BOOLEAN DEFAULT FALSE,
  reminder_email_sent BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create payments table
CREATE TABLE public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  payment_type TEXT NOT NULL CHECK (payment_type IN ('full', 'partial', 'deposit', 'refund')),
  payment_method TEXT NOT NULL CHECK (payment_method IN ('credit_card', 'debit_card', 'paypal', 'bank_transfer', 'cash', 'razorpay', 'stripe')),
  payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'processing', 'completed', 'failed', 'cancelled', 'refunded')),
  transaction_id TEXT UNIQUE,
  gateway_payment_id TEXT, -- Payment gateway's transaction ID
  gateway_order_id TEXT, -- Payment gateway's order ID
  gateway_response TEXT, -- JSON response from payment gateway
  payment_date TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);
CREATE INDEX IF NOT EXISTS idx_vehicles_category ON public.vehicles(category);
CREATE INDEX IF NOT EXISTS idx_vehicles_available ON public.vehicles(is_available);
CREATE INDEX IF NOT EXISTS idx_vehicles_price ON public.vehicles(price_per_day);
CREATE INDEX IF NOT EXISTS idx_bookings_user_id ON public.bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_vehicle_id ON public.bookings(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_bookings_car_id ON public.bookings(car_id);
CREATE INDEX IF NOT EXISTS idx_bookings_from_date ON public.bookings(from_date);
CREATE INDEX IF NOT EXISTS idx_bookings_to_date ON public.bookings(to_date);
CREATE INDEX IF NOT EXISTS idx_bookings_pickup_date ON public.bookings(pickup_date);
CREATE INDEX IF NOT EXISTS idx_bookings_return_date ON public.bookings(return_date);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON public.bookings(booking_status);
CREATE INDEX IF NOT EXISTS idx_bookings_pickup_datetime ON public.bookings(pickup_datetime);
CREATE INDEX IF NOT EXISTS idx_bookings_return_datetime ON public.bookings(return_datetime);
CREATE INDEX IF NOT EXISTS idx_payments_booking_id ON public.payments(booking_id);
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON public.payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON public.payments(payment_status);
CREATE INDEX IF NOT EXISTS idx_payments_transaction_id ON public.payments(transaction_id);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to sync booking date fields and set datetime
CREATE OR REPLACE FUNCTION sync_booking_dates()
RETURNS TRIGGER AS $$
BEGIN
  -- Sync date fields
  NEW.pickup_date = NEW.from_date;
  NEW.return_date = NEW.to_date;
  NEW.pickup_time = NEW.from_time;
  NEW.return_time = NEW.to_time;
  NEW.total_days = NEW.days;
  NEW.total_amount = NEW.total_price;
  NEW.vehicle_id = NEW.car_id;
  
  -- Set datetime fields
  NEW.pickup_datetime = (NEW.from_date || ' ' || NEW.from_time)::timestamp with time zone;
  NEW.return_datetime = (NEW.to_date || ' ' || NEW.to_time)::timestamp with time zone;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
DROP TRIGGER IF EXISTS update_users_updated_at ON public.users;
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_vehicles_updated_at ON public.vehicles;
CREATE TRIGGER update_vehicles_updated_at
  BEFORE UPDATE ON public.vehicles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_bookings_updated_at ON public.bookings;
CREATE TRIGGER update_bookings_updated_at
  BEFORE UPDATE ON public.bookings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_payments_updated_at ON public.payments;
CREATE TRIGGER update_payments_updated_at
  BEFORE UPDATE ON public.payments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create trigger to sync booking date fields
DROP TRIGGER IF EXISTS sync_booking_dates_trigger ON public.bookings;
CREATE TRIGGER sync_booking_dates_trigger
  BEFORE INSERT OR UPDATE ON public.bookings
  FOR EACH ROW
  EXECUTE FUNCTION sync_booking_dates();

-- Disable Row Level Security (RLS) for all tables
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments DISABLE ROW LEVEL SECURITY;

-- Grant full permissions to all roles
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON public.users TO anon, authenticated;
GRANT ALL ON public.vehicles TO anon, authenticated;
GRANT ALL ON public.bookings TO anon, authenticated;
GRANT ALL ON public.payments TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;

-- Insert default admin user
-- Password: admin123 (hashed with bcrypt)
INSERT INTO public.users (
  email, 
  password, 
  first_name, 
  last_name, 
  phone, 
  role, 
  email_verified, 
  is_active
) VALUES (
  'admin@rentride.com',
  '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- bcrypt hash for 'admin123'
  'Admin',
  'User',
  '+1234567890',
  'admin',
  true,
  true
);

-- Insert some sample vehicles for testing
INSERT INTO public.vehicles (name, brand, model, year, category, fuel_type, transmission, seats, doors, price_per_day, image_url, features, location, mileage, description) VALUES
('Toyota Camry 2023', 'Toyota', 'Camry', 2023, 'midsize', 'petrol', 'automatic', 5, 4, 75.00, 'https://example.com/camry.jpg', ARRAY['AC', 'GPS', 'Bluetooth', 'Backup Camera'], 'Main Branch', '12 km/l', 'Comfortable midsize sedan perfect for business trips'),
('Honda Civic 2022', 'Honda', 'Civic', 2022, 'compact', 'petrol', 'manual', 5, 4, 65.00, 'https://example.com/civic.jpg', ARRAY['AC', 'Bluetooth', 'USB Charging'], 'Main Branch', '14 km/l', 'Reliable and fuel-efficient compact car'),
('BMW X5 2023', 'BMW', 'X5', 2023, 'luxury', 'petrol', 'automatic', 7, 4, 150.00, 'https://example.com/bmw-x5.jpg', ARRAY['AC', 'GPS', 'Bluetooth', 'Leather Seats', 'Sunroof', 'Premium Audio'], 'Main Branch', '10 km/l', 'Luxury SUV with premium features and spacious interior'),
('Tesla Model 3', 'Tesla', 'Model 3', 2023, 'luxury', 'electric', 'automatic', 5, 4, 120.00, 'https://example.com/tesla-model3.jpg', ARRAY['Autopilot', 'GPS', 'Bluetooth', 'Premium Audio', 'Supercharging'], 'Main Branch', '500 km range', 'Electric luxury sedan with cutting-edge technology'),
('Maruti Swift', 'Maruti', 'Swift', 2022, 'economy', 'petrol', 'manual', 5, 4, 45.00, 'https://example.com/swift.jpg', ARRAY['AC', 'Bluetooth'], 'Main Branch', '18 km/l', 'Budget-friendly and fuel-efficient hatchback');