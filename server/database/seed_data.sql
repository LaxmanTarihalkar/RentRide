-- Seed Data for RentRide
-- Run this AFTER creating the schema

-- Insert default categories if not exists (should be there from schema)
INSERT INTO public.vehicle_categories (name, description, icon) VALUES
('Car', 'Standard passenger cars', 'car'),
('SUV', 'Sport Utility Vehicles', 'truck'),
('Sports', 'High performance sports cars', 'gauge'),
('Luxury', 'Premium luxury vehicles', 'diamond'),
('Electric', 'Electric vehicles', 'zap'),
('Exotic', 'Rare and exotic cars', 'crown')
ON CONFLICT (name) DO NOTHING;

-- Insert a sample owner (optional, linked to no user for now or admin)
-- Replace with actual user_id if known, or leave NULL
INSERT INTO public.owners (owner_name, email, phone, business_type, business_name, address, city, state, pincode, verification_status, approval_date)
VALUES 
('RentRide HQ', 'admin@rentride.com', '9876543210', 'company', 'RentRide Official Fleet', '123 Main St', 'Mumbai', 'Maharashtra', '400001', 'approved', NOW());

-- Get the owner ID
DO $$
DECLARE
    owner_uuid UUID;
    cat_electric UUID;
    cat_sports UUID;
    cat_luxury UUID;
    cat_suv UUID;
    cat_exotic UUID;
BEGIN
    SELECT id INTO owner_uuid FROM public.owners WHERE email = 'admin@rentride.com' LIMIT 1;
    
    SELECT id INTO cat_electric FROM public.vehicle_categories WHERE name = 'Electric' LIMIT 1;
    SELECT id INTO cat_sports FROM public.vehicle_categories WHERE name = 'Sports' LIMIT 1;
    SELECT id INTO cat_luxury FROM public.vehicle_categories WHERE name = 'Luxury' LIMIT 1;
    SELECT id INTO cat_suv FROM public.vehicle_categories WHERE name = 'SUV' LIMIT 1;
    SELECT id INTO cat_exotic FROM public.vehicle_categories WHERE name = 'Exotic' LIMIT 1;

    -- Insert Vehicles
    INSERT INTO public.vehicles (
        owner_id, category_id, category_name, name, brand, model, year, 
        price_per_day, primary_image, specifications, features, location, city, is_verified, is_available
    ) VALUES 
    (
        owner_uuid, cat_electric, 'Electric', 'Tesla Model S', 'Tesla', 'Model S', 2023,
        12500, 'https://images.unsplash.com/photo-1617788138017-80ad40651399?w=800&q=80',
        '{"transmission": "Automatic", "fuel_type": "Electric", "seats": 5, "max_speed": "250 km/h"}',
        ARRAY['Autopilot', 'Premium Sound', 'Panoramic Roof'],
        'Mumbai, Maharashtra', 'Mumbai', true, true
    ),
    (
        owner_uuid, cat_sports, 'Sports', 'BMW M4', 'BMW', 'M4', 2023,
        15000, 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800&q=80',
        '{"transmission": "Automatic", "fuel_type": "Petrol", "seats": 4, "max_speed": "280 km/h"}',
        ARRAY['Sport Mode', 'Leather Seats', 'Navigation'],
        'Mumbai, Maharashtra', 'Mumbai', true, true
    ),
    (
        owner_uuid, cat_luxury, 'Luxury', 'Mercedes-Benz S-Class', 'Mercedes', 'S-Class', 2023,
        14000, 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800&q=80',
        '{"transmission": "Automatic", "fuel_type": "Hybrid", "seats": 5, "max_speed": "250 km/h"}',
        ARRAY['Massage Seats', 'Premium Audio', 'Night Vision'],
        'Mumbai, Maharashtra', 'Mumbai', true, true
    ),
    (
        owner_uuid, cat_suv, 'SUV', 'Range Rover Sport', 'Land Rover', 'Range Rover Sport', 2023,
        13500, 'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=800&q=80',
        '{"transmission": "Automatic", "fuel_type": "Diesel", "seats": 7, "max_speed": "220 km/h"}',
        ARRAY['4WD', 'Terrain Response', 'Premium Interior'],
        'Mumbai, Maharashtra', 'Mumbai', true, true
    );
END $$;
