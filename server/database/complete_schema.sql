-- RentRide Complete Database Schema
-- Run this in your Supabase SQL Editor to set up the entire database structure

-- WARNING: This will DROP existing tables to ensure the schema is correct.
-- If you have production data, please back it up first.

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing tables/triggers to ensure clean slate
DROP TRIGGER IF EXISTS update_bookings_time ON public.bookings;
DROP TRIGGER IF EXISTS update_vehicles_time ON public.vehicles;
DROP TRIGGER IF EXISTS update_owners_time ON public.owners;
DROP TRIGGER IF EXISTS update_users_time ON public.users;

DROP TABLE IF EXISTS public.bookings CASCADE;
DROP TABLE IF EXISTS public.vehicles CASCADE;
DROP TABLE IF EXISTS public.vehicle_categories CASCADE;
DROP TABLE IF EXISTS public.owners CASCADE;
-- We'll keep users if you want to preserve logins, but be careful of references. 
-- If you want a 100% fresh start, uncomment the next line:
-- DROP TABLE IF EXISTS public.users CASCADE;

-- ==========================================
-- 1. USERS & AUTH
-- ==========================================

CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL, -- Hashed password
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  phone TEXT,
  role TEXT DEFAULT 'user', -- 'user', 'owner', 'admin'
  avatar_url TEXT,
  email_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==========================================
-- 2. OWNERS (For vehicle partners)
-- ==========================================

CREATE TABLE IF NOT EXISTS public.owners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL, -- Link to user account if they have one
  owner_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT NOT NULL,
  alternate_phone TEXT,
  
  -- Business Details
  business_type TEXT NOT NULL, -- 'individual', 'company'
  business_name TEXT NOT NULL,
  description TEXT,
  website TEXT,
  social_media JSONB, -- { "instagram": "...", "facebook": "..." }
  
  -- Location
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  pincode TEXT NOT NULL,
  
  -- Verification
  verification_status TEXT DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
  rejection_reason TEXT,
  approval_date TIMESTAMP WITH TIME ZONE,
  
  -- Stats
  total_cars INTEGER DEFAULT 0,
  car_types TEXT[], -- Array of car types handled
  operating_years INTEGER,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==========================================
-- 3. VEHICLE CATEGORIES
-- ==========================================

CREATE TABLE IF NOT EXISTS public.vehicle_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  icon TEXT,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default categories if they don't exist
INSERT INTO public.vehicle_categories (name, description, icon) VALUES
('Car', 'Standard passenger cars', 'car'),
('SUV', 'Sport Utility Vehicles', 'truck'),
('Motorcycle', 'Two-wheeler motorcycles', 'bike'),
('Luxury', 'Premium and luxury vehicles', 'diamond'),
('Electric', 'Electric vehicles', 'zap')
ON CONFLICT (name) DO NOTHING;

-- ==========================================
-- 4. VEHICLES
-- ==========================================

CREATE TABLE IF NOT EXISTS public.vehicles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID REFERENCES public.owners(id) ON DELETE CASCADE,
  category_id UUID REFERENCES public.vehicle_categories(id),
  category_name TEXT, -- Denormalization for easy access
  
  -- Basic Info
  name TEXT NOT NULL,
  brand TEXT NOT NULL,
  model TEXT NOT NULL,
  year INTEGER NOT NULL,
  color TEXT,
  license_plate TEXT, -- Keep private, viewable only by admin/owner
  
  -- Descriptions & Specs
  description TEXT,
  specifications JSONB DEFAULT '{}', -- { "transmission": "auto", "fuel": "petrol", "seats": 4 }
  features TEXT[] DEFAULT '{}', -- ["GPS", "Bluetooth", "Sunroof"]
  
  -- Images
  primary_image TEXT NOT NULL,
  additional_images TEXT[] DEFAULT '{}', -- Array of image URLs
  
  -- Pricing & Location
  price_per_day DECIMAL(10,2) NOT NULL,
  price_per_hour DECIMAL(10,2),
  security_deposit DECIMAL(10,2) DEFAULT 0,
  location TEXT NOT NULL,
  city TEXT NOT NULL,
  
  -- Status
  is_available BOOLEAN DEFAULT TRUE,
  is_verified BOOLEAN DEFAULT FALSE,
  status TEXT DEFAULT 'active', -- 'active', 'maintenance', 'hidden'
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==========================================
-- 5. BOOKINGS
-- ==========================================

CREATE TABLE IF NOT EXISTS public.bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE, -- Customer
  vehicle_id UUID REFERENCES public.vehicles(id) ON DELETE SET NULL,
  
  -- Dates
  pickup_date TIMESTAMP WITH TIME ZONE NOT NULL, -- Combined date & time
  return_date TIMESTAMP WITH TIME ZONE NOT NULL, -- Combined date & time
  
  -- Cost Calculation
  total_days INTEGER NOT NULL,
  price_per_day DECIMAL(10,2) NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL,
  
  -- Payment Info
  payment_amount DECIMAL(10,2) NOT NULL, -- Amount actually paid
  remaining_amount DECIMAL(10,2) DEFAULT 0,
  payment_status TEXT DEFAULT 'pending', -- 'pending', 'paid', 'failed', 'refunded'
  payment_method TEXT, -- 'razorpay', 'cash', etc.
  payment_id TEXT, -- Razorpay Payment ID
  order_id TEXT, -- Razorpay Order ID
  
  -- Booking Status
  booking_status TEXT DEFAULT 'confirmed', -- 'pending', 'confirmed', 'completed', 'cancelled'
  cancellation_reason TEXT,
  
  -- Communications
  confirmation_email_sent BOOLEAN DEFAULT FALSE,
  reminder_email_sent BOOLEAN DEFAULT FALSE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==========================================
-- 6. INDEXES & PERFORMANCE
-- ==========================================

CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_owners_email ON public.owners(email);
CREATE INDEX IF NOT EXISTS idx_vehicles_owner ON public.vehicles(owner_id);
CREATE INDEX IF NOT EXISTS idx_vehicles_category ON public.vehicles(category_id);
CREATE INDEX IF NOT EXISTS idx_bookings_user ON public.bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_vehicle ON public.bookings(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_bookings_dates ON public.bookings(pickup_date, return_date);

-- ==========================================
-- 7. ROW LEVEL SECURITY (RLS) POLICIES
-- ==========================================

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.owners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- Users Policies
DROP POLICY IF EXISTS "Users view own profile" ON public.users;
CREATE POLICY "Users view own profile" ON public.users FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users update own profile" ON public.users;
CREATE POLICY "Users update own profile" ON public.users FOR UPDATE USING (auth.uid() = id);

-- Owners Policies
DROP POLICY IF EXISTS "Public view approved owners" ON public.owners;
CREATE POLICY "Public view approved owners" ON public.owners FOR SELECT USING (verification_status = 'approved');

DROP POLICY IF EXISTS "Owners view own profile" ON public.owners;
CREATE POLICY "Owners view own profile" ON public.owners FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Owners update own profile" ON public.owners;
CREATE POLICY "Owners update own profile" ON public.owners FOR UPDATE USING (user_id = auth.uid());

-- Vehicles Policies
DROP POLICY IF EXISTS "Public view available vehicles" ON public.vehicles;
CREATE POLICY "Public view available vehicles" ON public.vehicles FOR SELECT USING (is_available = true AND is_verified = true);

DROP POLICY IF EXISTS "Owners manage own vehicles" ON public.vehicles;
CREATE POLICY "Owners manage own vehicles" ON public.vehicles FOR ALL USING (
  owner_id IN (SELECT id FROM public.owners WHERE user_id = auth.uid()) OR 
  EXISTS(SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
);

-- Bookings Policies
DROP POLICY IF EXISTS "Users view own bookings" ON public.bookings;
CREATE POLICY "Users view own bookings" ON public.bookings FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users create bookings" ON public.bookings;
CREATE POLICY "Users create bookings" ON public.bookings FOR INSERT WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Owners view bookings for their vehicles" ON public.bookings;
CREATE POLICY "Owners view bookings for their vehicles" ON public.bookings FOR SELECT USING (
  vehicle_id IN (SELECT id FROM public.vehicles WHERE owner_id IN (SELECT id FROM public.owners WHERE user_id = auth.uid()))
);

-- ==========================================
-- 8. TRIGGERS
-- ==========================================

-- Function to handle 'updated_at' updates
CREATE OR REPLACE FUNCTION update_timestamp_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_time BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE PROCEDURE update_timestamp_column();
CREATE TRIGGER update_owners_time BEFORE UPDATE ON public.owners FOR EACH ROW EXECUTE PROCEDURE update_timestamp_column();
CREATE TRIGGER update_vehicles_time BEFORE UPDATE ON public.vehicles FOR EACH ROW EXECUTE PROCEDURE update_timestamp_column();
CREATE TRIGGER update_bookings_time BEFORE UPDATE ON public.bookings FOR EACH ROW EXECUTE PROCEDURE update_timestamp_column();
