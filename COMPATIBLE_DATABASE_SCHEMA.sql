-- RentRide Compatible Database Schema
-- This schema is compatible with existing UUID-based structure

-- Enable UUID extension for generating unique IDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Users table (already exists, just ensure it has all needed columns)
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS phone VARCHAR(20),
ADD COLUMN IF NOT EXISTS address TEXT,
ADD COLUMN IF NOT EXISTS city VARCHAR(100),
ADD COLUMN IF NOT EXISTS state VARCHAR(100),
ADD COLUMN IF NOT EXISTS zip_code VARCHAR(20),
ADD COLUMN IF NOT EXISTS country VARCHAR(100) DEFAULT 'India',
ADD COLUMN IF NOT EXISTS profile_image_url TEXT,
ADD COLUMN IF NOT EXISTS date_of_birth DATE,
ADD COLUMN IF NOT EXISTS driving_license_number VARCHAR(50),
ADD COLUMN IF NOT EXISTS driving_license_expiry DATE;

-- 2. Verification tokens table (already exists as verification_tokens)
-- No changes needed

-- 3. Owners table for car owners/partners
CREATE TABLE IF NOT EXISTS public.owners (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_type VARCHAR(50) NOT NULL, -- 'individual', 'agency', 'company', 'dealership'
    business_name VARCHAR(255) NOT NULL,
    owner_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20) NOT NULL,
    alternate_phone VARCHAR(20),
    address TEXT NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    pincode VARCHAR(10) NOT NULL,
    total_cars VARCHAR(50), -- '1-5', '6-10', etc.
    car_types TEXT[], -- Array of car types
    operating_years VARCHAR(50),
    description TEXT,
    website VARCHAR(255),
    social_media VARCHAR(255),
    business_license_url TEXT,
    gst_certificate_url TEXT,
    insurance_certificate_url TEXT,
    owner_id_proof_url TEXT,
    verification_status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
    approval_date TIMESTAMP WITH TIME ZONE,
    rejection_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Cars table for the vehicle fleet
CREATE TABLE IF NOT EXISTS public.cars (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    model VARCHAR(255) NOT NULL,
    brand VARCHAR(100) NOT NULL,
    year INTEGER NOT NULL,
    category VARCHAR(50) NOT NULL, -- 'luxury', 'sports', 'suv', 'electric', 'exotic'
    fuel_type VARCHAR(50) NOT NULL, -- 'petrol', 'diesel', 'electric', 'hybrid'
    transmission VARCHAR(50) NOT NULL, -- 'manual', 'automatic'
    seats INTEGER NOT NULL,
    price_per_day DECIMAL(10, 2) NOT NULL,
    price_per_hour DECIMAL(10, 2),
    availability_status VARCHAR(50) DEFAULT 'available', -- 'available', 'booked', 'maintenance'
    location VARCHAR(255),
    mileage VARCHAR(50),
    top_speed VARCHAR(50),
    features TEXT[], -- Array of features like ['GPS', 'AC', 'Bluetooth']
    images TEXT[], -- Array of image URLs
    description TEXT,
    rating DECIMAL(3, 2) DEFAULT 0.00,
    total_bookings INTEGER DEFAULT 0,
    owner_id UUID REFERENCES public.owners(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Admin table for admin users
CREATE TABLE IF NOT EXISTS public.admin (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    role VARCHAR(50) DEFAULT 'admin',
    permissions TEXT[], -- Array of permissions
    last_login TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Update existing bookings table to add missing columns
ALTER TABLE public.bookings 
ADD COLUMN IF NOT EXISTS booking_id VARCHAR(50) UNIQUE,
ADD COLUMN IF NOT EXISTS pickup_location VARCHAR(255),
ADD COLUMN IF NOT EXISTS return_location VARCHAR(255),
ADD COLUMN IF NOT EXISTS rate_per_day DECIMAL(10, 2),
ADD COLUMN IF NOT EXISTS paid_amount DECIMAL(10, 2) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS special_requests TEXT,
ADD COLUMN IF NOT EXISTS cancellation_reason TEXT,
ADD COLUMN IF NOT EXISTS cancelled_at TIMESTAMP WITH TIME ZONE;

-- Generate booking IDs for existing records using a different approach
WITH numbered_bookings AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY created_at) as row_num
  FROM public.bookings 
  WHERE booking_id IS NULL
)
UPDATE public.bookings 
SET booking_id = 'BK' || LPAD(numbered_bookings.row_num::TEXT, 3, '0')
FROM numbered_bookings
WHERE public.bookings.id = numbered_bookings.id;

-- 7. Payments table for tracking all payment transactions
CREATE TABLE IF NOT EXISTS public.payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    payment_id VARCHAR(100) UNIQUE NOT NULL, -- Razorpay payment ID
    booking_id UUID REFERENCES public.bookings(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    amount DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'INR',
    payment_method VARCHAR(50), -- 'razorpay', 'cash', 'card'
    payment_gateway VARCHAR(50) DEFAULT 'razorpay',
    gateway_payment_id VARCHAR(255), -- Gateway specific payment ID
    gateway_order_id VARCHAR(255), -- Gateway specific order ID
    payment_status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'completed', 'failed', 'refunded'
    payment_date TIMESTAMP WITH TIME ZONE,
    failure_reason TEXT,
    refund_amount DECIMAL(10, 2) DEFAULT 0.00,
    refund_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. Transactions table for all financial transactions
CREATE TABLE IF NOT EXISTS public.transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transaction_id VARCHAR(100) UNIQUE NOT NULL,
    booking_id UUID REFERENCES public.bookings(id) ON DELETE CASCADE,
    payment_id UUID REFERENCES public.payments(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    owner_id UUID REFERENCES public.owners(id) ON DELETE SET NULL,
    transaction_type VARCHAR(50) NOT NULL, -- 'payment', 'refund', 'commission', 'payout'
    amount DECIMAL(10, 2) NOT NULL,
    commission_amount DECIMAL(10, 2) DEFAULT 0.00,
    net_amount DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'INR',
    status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'completed', 'failed'
    description TEXT,
    processed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_owners_email ON public.owners(email);
CREATE INDEX IF NOT EXISTS idx_owners_verification_status ON public.owners(verification_status);
CREATE INDEX IF NOT EXISTS idx_cars_category ON public.cars(category);
CREATE INDEX IF NOT EXISTS idx_cars_availability ON public.cars(availability_status);
CREATE INDEX IF NOT EXISTS idx_cars_owner_id ON public.cars(owner_id);
CREATE INDEX IF NOT EXISTS idx_admin_email ON public.admin(email);
CREATE INDEX IF NOT EXISTS idx_payments_booking_id ON public.payments(booking_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON public.payments(payment_status);
CREATE INDEX IF NOT EXISTS idx_transactions_booking_id ON public.transactions(booking_id);
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON public.transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON public.transactions(transaction_type);

-- Enable RLS for new tables
ALTER TABLE public.owners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cars ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- Create policies for owners table
CREATE POLICY "Owners can view their own data"
  ON public.owners FOR SELECT
  USING (true); -- Allow all for now, can be restricted later

-- Create policies for cars table
CREATE POLICY "Cars are viewable by everyone"
  ON public.cars FOR SELECT
  USING (true);

-- Create policies for admin table
CREATE POLICY "Admin access only"
  ON public.admin FOR ALL
  USING (false); -- Restrict access, handle via server-side

-- Create policies for payments table
CREATE POLICY "Users can view their own payments"
  ON public.payments FOR SELECT
  USING (user_id = auth.uid());

-- Create policies for transactions table
CREATE POLICY "Users can view their own transactions"
  ON public.transactions FOR SELECT
  USING (user_id = auth.uid());

-- Create triggers for updated_at columns
DROP TRIGGER IF EXISTS update_owners_updated_at ON public.owners;
CREATE TRIGGER update_owners_updated_at
  BEFORE UPDATE ON public.owners
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_cars_updated_at ON public.cars;
CREATE TRIGGER update_cars_updated_at
  BEFORE UPDATE ON public.cars
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_admin_updated_at ON public.admin;
CREATE TRIGGER update_admin_updated_at
  BEFORE UPDATE ON public.admin
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_payments_updated_at ON public.payments;
CREATE TRIGGER update_payments_updated_at
  BEFORE UPDATE ON public.payments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_transactions_updated_at ON public.transactions;
CREATE TRIGGER update_transactions_updated_at
  BEFORE UPDATE ON public.transactions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert sample owners
INSERT INTO public.owners (business_type, business_name, owner_name, email, phone, address, city, state, pincode, total_cars, car_types, operating_years, description, verification_status, approval_date) VALUES
('agency', 'Premium Car Rentals', 'Rajesh Kumar', 'rajesh@premiumcars.com', '+91 98765 43210', '123 Business District, Andheri East', 'Mumbai', 'Maharashtra', '400069', '11-25', ARRAY['Luxury', 'SUV', 'Sedan'], '3-5', 'Premium car rental service with luxury fleet', 'approved', NOW()),
('company', 'FlexiFleet Solutions', 'Priya Sharma', 'priya@flexifleet.com', '+91 87654 32109', '456 Corporate Park, Bandra Kurla Complex', 'Mumbai', 'Maharashtra', '400051', '26-50', ARRAY['Luxury', 'Sports', 'Electric'], '6-10', 'Corporate fleet management and luxury car rentals', 'approved', NOW()),
('individual', 'Luxury Drives', 'Amit Patel', 'amit@luxurydrives.com', '+91 76543 21098', '789 Residential Complex, Powai', 'Mumbai', 'Maharashtra', '400076', '1-5', ARRAY['Exotic', 'Sports'], '1-2', 'Exotic and sports car rental specialist', 'pending', NULL)
ON CONFLICT (email) DO NOTHING;

-- Insert some sample cars for testing
INSERT INTO public.cars (name, model, brand, year, category, fuel_type, transmission, seats, price_per_day, price_per_hour, location, mileage, top_speed, features, images, description, rating, owner_id) 
SELECT 
    'BMW X5', 'X5 xDrive40i', 'BMW', 2023, 'luxury', 'petrol', 'automatic', 5, 8500.00, 400.00, 'Mumbai', '12 kmpl', '250 km/h', 
    ARRAY['GPS', 'AC', 'Bluetooth', 'Leather Seats', 'Sunroof'], 
    ARRAY['/images/bmw-x5-1.jpg', '/images/bmw-x5-2.jpg'], 
    'Luxury SUV with premium features and exceptional comfort', 4.8, o.id
FROM public.owners o WHERE o.email = 'rajesh@premiumcars.com'
ON CONFLICT DO NOTHING;

INSERT INTO public.cars (name, model, brand, year, category, fuel_type, transmission, seats, price_per_day, price_per_hour, location, mileage, top_speed, features, images, description, rating, owner_id) 
SELECT 
    'Audi A4', 'A4 Premium Plus', 'Audi', 2023, 'luxury', 'petrol', 'automatic', 5, 7200.00, 350.00, 'Mumbai', '14 kmpl', '240 km/h', 
    ARRAY['GPS', 'AC', 'Bluetooth', 'Leather Seats', 'Wireless Charging'], 
    ARRAY['/images/audi-a4-1.jpg', '/images/audi-a4-2.jpg'], 
    'Premium sedan with advanced technology and elegant design', 4.7, o.id
FROM public.owners o WHERE o.email = 'rajesh@premiumcars.com'
ON CONFLICT DO NOTHING;

INSERT INTO public.cars (name, model, brand, year, category, fuel_type, transmission, seats, price_per_day, price_per_hour, location, mileage, top_speed, features, images, description, rating, owner_id) 
SELECT 
    'Mercedes C-Class', 'C 220d', 'Mercedes-Benz', 2023, 'luxury', 'diesel', 'automatic', 5, 7800.00, 380.00, 'Mumbai', '16 kmpl', '235 km/h', 
    ARRAY['GPS', 'AC', 'Bluetooth', 'Leather Seats', 'Ambient Lighting'], 
    ARRAY['/images/mercedes-c-class-1.jpg', '/images/mercedes-c-class-2.jpg'], 
    'Sophisticated luxury sedan with cutting-edge features', 4.9, o.id
FROM public.owners o WHERE o.email = 'priya@flexifleet.com'
ON CONFLICT DO NOTHING;

-- Grant necessary permissions
GRANT ALL ON public.owners TO anon, authenticated;
GRANT ALL ON public.cars TO anon, authenticated;
GRANT ALL ON public.admin TO anon, authenticated;
GRANT ALL ON public.payments TO anon, authenticated;
GRANT ALL ON public.transactions TO anon, authenticated;