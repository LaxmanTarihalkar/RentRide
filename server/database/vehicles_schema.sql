-- RentRide Multi-Vehicle Management Schema
-- Enhanced schema for supporting multiple vehicle types

-- Create vehicle_categories table
CREATE TABLE IF NOT EXISTS public.vehicle_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  icon TEXT, -- Icon name for UI
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default vehicle categories
INSERT INTO public.vehicle_categories (name, description, icon) VALUES
('Car', 'Standard passenger cars', 'car'),
('SUV', 'Sport Utility Vehicles', 'truck'),
('Motorcycle', 'Two-wheeler motorcycles', 'bike'),
('Bicycle', 'Pedal bicycles', 'bicycle'),
('Truck', 'Commercial trucks', 'truck'),
('Van', 'Passenger and cargo vans', 'van'),
('Bus', 'Passenger buses', 'bus'),
('Boat', 'Water vehicles', 'ship'),
('RV', 'Recreational vehicles', 'home'),
('ATV', 'All-terrain vehicles', 'mountain')
ON CONFLICT (name) DO NOTHING;

-- Create vehicles table (enhanced from cars)
CREATE TABLE IF NOT EXISTS public.vehicles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category_id UUID NOT NULL REFERENCES public.vehicle_categories(id),
  category_name TEXT NOT NULL, -- Denormalized for easier queries
  brand TEXT NOT NULL,
  model TEXT NOT NULL,
  year INTEGER NOT NULL,
  description TEXT,
  
  -- Specifications (flexible JSON for different vehicle types)
  specifications JSONB DEFAULT '{}',
  
  -- Pricing
  price_per_hour DECIMAL(10,2),
  price_per_day DECIMAL(10,2) NOT NULL,
  price_per_week DECIMAL(10,2),
  price_per_month DECIMAL(10,2),
  
  -- Images
  primary_image TEXT NOT NULL,
  additional_images JSONB DEFAULT '[]',
  
  -- Availability
  is_available BOOLEAN DEFAULT TRUE,
  location TEXT NOT NULL,
  
  -- Features and amenities
  features JSONB DEFAULT '[]',
  
  -- Owner information (for marketplace model)
  owner_id UUID REFERENCES public.users(id),
  owner_name TEXT,
  owner_contact TEXT,
  
  -- Admin fields
  is_verified BOOLEAN DEFAULT FALSE,
  verification_notes TEXT,
  admin_notes TEXT,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for vehicles
CREATE INDEX IF NOT EXISTS idx_vehicles_category ON public.vehicles(category_id);
CREATE INDEX IF NOT EXISTS idx_vehicles_category_name ON public.vehicles(category_name);
CREATE INDEX IF NOT EXISTS idx_vehicles_available ON public.vehicles(is_available);
CREATE INDEX IF NOT EXISTS idx_vehicles_verified ON public.vehicles(is_verified);
CREATE INDEX IF NOT EXISTS idx_vehicles_owner ON public.vehicles(owner_id);
CREATE INDEX IF NOT EXISTS idx_vehicles_location ON public.vehicles(location);
CREATE INDEX IF NOT EXISTS idx_vehicles_price_day ON public.vehicles(price_per_day);
CREATE INDEX IF NOT EXISTS idx_vehicles_created_at ON public.vehicles(created_at);

-- Create GIN index for JSONB fields
CREATE INDEX IF NOT EXISTS idx_vehicles_specifications ON public.vehicles USING GIN (specifications);
CREATE INDEX IF NOT EXISTS idx_vehicles_features ON public.vehicles USING GIN (features);

-- Enable RLS
ALTER TABLE public.vehicle_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;

-- Policies for vehicle_categories (public read)
CREATE POLICY "Anyone can view vehicle categories"
  ON public.vehicle_categories FOR SELECT
  TO public
  USING (true);

-- Policies for vehicles (public read, owner/admin write)
CREATE POLICY "Anyone can view verified vehicles"
  ON public.vehicles FOR SELECT
  TO public
  USING (is_verified = true AND is_available = true);

CREATE POLICY "Owners can view their own vehicles"
  ON public.vehicles FOR SELECT
  USING (owner_id = auth.uid());

CREATE POLICY "Owners can insert their own vehicles"
  ON public.vehicles FOR INSERT
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Owners can update their own vehicles"
  ON public.vehicles FOR UPDATE
  USING (owner_id = auth.uid());

-- Create triggers for updated_at
DROP TRIGGER IF EXISTS update_vehicle_categories_updated_at ON public.vehicle_categories;
CREATE TRIGGER update_vehicle_categories_updated_at
  BEFORE UPDATE ON public.vehicle_categories
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_vehicles_updated_at ON public.vehicles;
CREATE TRIGGER update_vehicles_updated_at
  BEFORE UPDATE ON public.vehicles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Update bookings table to reference vehicles instead of hardcoded car data
ALTER TABLE public.bookings 
ADD COLUMN IF NOT EXISTS vehicle_id UUID REFERENCES public.vehicles(id),
ADD COLUMN IF NOT EXISTS vehicle_name TEXT,
ADD COLUMN IF NOT EXISTS vehicle_category TEXT;

-- Create index for vehicle bookings
CREATE INDEX IF NOT EXISTS idx_bookings_vehicle_id ON public.bookings(vehicle_id);

-- Grant permissions
GRANT ALL ON public.vehicle_categories TO anon, authenticated;
GRANT ALL ON public.vehicles TO anon, authenticated;

-- Sample data for testing
INSERT INTO public.vehicles (
  name, category_id, category_name, brand, model, year, description,
  specifications, price_per_day, primary_image, features, location,
  is_verified, owner_name
) VALUES 
(
  'Honda City Premium',
  (SELECT id FROM public.vehicle_categories WHERE name = 'Car'),
  'Car',
  'Honda',
  'City',
  2023,
  'Comfortable sedan perfect for city drives and long trips',
  '{"fuel_type": "Petrol", "transmission": "Automatic", "seats": 5, "mileage": "17 kmpl", "engine": "1.5L i-VTEC"}',
  2500.00,
  'https://images.unsplash.com/photo-1549924231-f129b911e442?w=800',
  '["Air Conditioning", "GPS Navigation", "Bluetooth", "USB Charging", "Power Steering"]',
  'Mumbai, Maharashtra',
  true,
  'RentRide Fleet'
),
(
  'Royal Enfield Classic 350',
  (SELECT id FROM public.vehicle_categories WHERE name = 'Motorcycle'),
  'Motorcycle',
  'Royal Enfield',
  'Classic 350',
  2023,
  'Iconic motorcycle for adventure enthusiasts',
  '{"fuel_type": "Petrol", "engine": "349cc", "max_power": "20.2 bhp", "max_torque": "27 Nm", "fuel_capacity": "13L"}',
  800.00,
  'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800',
  '["Electric Start", "LED Headlight", "Digital Console", "Dual Channel ABS"]',
  'Mumbai, Maharashtra',
  true,
  'RentRide Fleet'
),
(
  'Mahindra Thar 4x4',
  (SELECT id FROM public.vehicle_categories WHERE name = 'SUV'),
  'SUV',
  'Mahindra',
  'Thar',
  2023,
  'Off-road beast perfect for adventure trips',
  '{"fuel_type": "Petrol", "transmission": "Manual", "seats": 4, "drive": "4WD", "engine": "2.0L mStallion"}',
  4500.00,
  'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=800',
  '["4x4 Drive", "Convertible Top", "Rock Crawling", "Hill Assist", "ESP"]',
  'Mumbai, Maharashtra',
  true,
  'RentRide Fleet'
);