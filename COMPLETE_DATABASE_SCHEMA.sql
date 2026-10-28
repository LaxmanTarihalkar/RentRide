-- RentRide Complete Database Schema
-- This file contains all 8 required tables for the RentRide application

-- Enable UUID extension for generating unique IDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Users table for customer authentication and profiles
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    zip_code VARCHAR(20),
    country VARCHAR(100) DEFAULT 'India',
    email_verified BOOLEAN DEFAULT FALSE,
    profile_image_url TEXT,
    date_of_birth DATE,
    driving_license_number VARCHAR(50),
    driving_license_expiry DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Verification tokens table for email verification, password reset, etc.
CREATE TABLE IF NOT EXISTS verification_tokens (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL, -- 'email_verification', 'password_reset'
    expires_at TIMESTAMP NOT NULL,
    used BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Owners table for car owners/partners (must be created before cars table)
CREATE TABLE IF NOT EXISTS owners (
    id SERIAL PRIMARY KEY,
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
    approval_date TIMESTAMP,
    rejection_reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Cars table for the vehicle fleet (created after owners table)
CREATE TABLE IF NOT EXISTS cars (
    id SERIAL PRIMARY KEY,
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
    owner_id INTEGER REFERENCES owners(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. Admin table for admin users
CREATE TABLE IF NOT EXISTS admin (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    role VARCHAR(50) DEFAULT 'admin',
    permissions TEXT[], -- Array of permissions
    last_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. Bookings table for car rental bookings
CREATE TABLE IF NOT EXISTS bookings (
    id SERIAL PRIMARY KEY,
    booking_id VARCHAR(50) UNIQUE NOT NULL, -- Human readable booking ID like 'BK001'
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    car_id INTEGER REFERENCES cars(id) ON DELETE CASCADE,
    pickup_date TIMESTAMP NOT NULL,
    return_date TIMESTAMP NOT NULL,
    pickup_location VARCHAR(255),
    return_location VARCHAR(255),
    total_days INTEGER NOT NULL,
    rate_per_day DECIMAL(10, 2) NOT NULL,
    total_amount DECIMAL(10, 2) NOT NULL,
    paid_amount DECIMAL(10, 2) DEFAULT 0.00,
    remaining_amount DECIMAL(10, 2) DEFAULT 0.00,
    booking_status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'confirmed', 'active', 'completed', 'cancelled'
    payment_status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'partial', 'completed', 'refunded'
    payment_type VARCHAR(50), -- 'full', 'partial'
    special_requests TEXT,
    cancellation_reason TEXT,
    cancelled_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 7. Payments table for tracking all payment transactions
CREATE TABLE IF NOT EXISTS payments (
    id SERIAL PRIMARY KEY,
    payment_id VARCHAR(100) UNIQUE NOT NULL, -- Razorpay payment ID
    booking_id INTEGER REFERENCES bookings(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    amount DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'INR',
    payment_method VARCHAR(50), -- 'razorpay', 'cash', 'card'
    payment_gateway VARCHAR(50) DEFAULT 'razorpay',
    gateway_payment_id VARCHAR(255), -- Gateway specific payment ID
    gateway_order_id VARCHAR(255), -- Gateway specific order ID
    payment_status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'completed', 'failed', 'refunded'
    payment_date TIMESTAMP,
    failure_reason TEXT,
    refund_amount DECIMAL(10, 2) DEFAULT 0.00,
    refund_date TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 8. Transactions table for all financial transactions
CREATE TABLE IF NOT EXISTS transactions (
    id SERIAL PRIMARY KEY,
    transaction_id VARCHAR(100) UNIQUE NOT NULL,
    booking_id INTEGER REFERENCES bookings(id) ON DELETE CASCADE,
    payment_id INTEGER REFERENCES payments(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    owner_id INTEGER REFERENCES owners(id) ON DELETE SET NULL,
    transaction_type VARCHAR(50) NOT NULL, -- 'payment', 'refund', 'commission', 'payout'
    amount DECIMAL(10, 2) NOT NULL,
    commission_amount DECIMAL(10, 2) DEFAULT 0.00,
    net_amount DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'INR',
    status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'completed', 'failed'
    description TEXT,
    processed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_verification_tokens_user_id ON verification_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_verification_tokens_token ON verification_tokens(token);
CREATE INDEX IF NOT EXISTS idx_cars_category ON cars(category);
CREATE INDEX IF NOT EXISTS idx_cars_availability ON cars(availability_status);
CREATE INDEX IF NOT EXISTS idx_cars_owner_id ON cars(owner_id);
CREATE INDEX IF NOT EXISTS idx_owners_email ON owners(email);
CREATE INDEX IF NOT EXISTS idx_owners_verification_status ON owners(verification_status);
CREATE INDEX IF NOT EXISTS idx_admin_email ON admin(email);
CREATE INDEX IF NOT EXISTS idx_bookings_user_id ON bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_car_id ON bookings(car_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(booking_status);
CREATE INDEX IF NOT EXISTS idx_payments_booking_id ON payments(booking_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(payment_status);
CREATE INDEX IF NOT EXISTS idx_transactions_booking_id ON transactions(booking_id);
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(transaction_type);

-- Insert sample owners (run after owners table is created)
INSERT INTO owners (business_type, business_name, owner_name, email, phone, address, city, state, pincode, total_cars, car_types, operating_years, description, verification_status, approval_date) VALUES
('agency', 'Premium Car Rentals', 'Rajesh Kumar', 'rajesh@premiumcars.com', '+91 98765 43210', '123 Business District, Andheri East', 'Mumbai', 'Maharashtra', '400069', '11-25', ARRAY['Luxury', 'SUV', 'Sedan'], '3-5', 'Premium car rental service with luxury fleet', 'approved', NOW()),
('company', 'FlexiFleet Solutions', 'Priya Sharma', 'priya@flexifleet.com', '+91 87654 32109', '456 Corporate Park, Bandra Kurla Complex', 'Mumbai', 'Maharashtra', '400051', '26-50', ARRAY['Luxury', 'Sports', 'Electric'], '6-10', 'Corporate fleet management and luxury car rentals', 'approved', NOW()),
('individual', 'Luxury Drives', 'Amit Patel', 'amit@luxurydrives.com', '+91 76543 21098', '789 Residential Complex, Powai', 'Mumbai', 'Maharashtra', '400076', '1-5', ARRAY['Exotic', 'Sports'], '1-2', 'Exotic and sports car rental specialist', 'pending', NULL)
ON CONFLICT (email) DO NOTHING;

-- Insert some sample cars for testing (run after cars and owners tables are created)
INSERT INTO cars (name, model, brand, year, category, fuel_type, transmission, seats, price_per_day, price_per_hour, location, mileage, top_speed, features, images, description, rating, owner_id) VALUES
('BMW X5', 'X5 xDrive40i', 'BMW', 2023, 'luxury', 'petrol', 'automatic', 5, 8500.00, 400.00, 'Mumbai', '12 kmpl', '250 km/h', ARRAY['GPS', 'AC', 'Bluetooth', 'Leather Seats', 'Sunroof'], ARRAY['/images/bmw-x5-1.jpg', '/images/bmw-x5-2.jpg'], 'Luxury SUV with premium features and exceptional comfort', 4.8, 1),
('Audi A4', 'A4 Premium Plus', 'Audi', 2023, 'luxury', 'petrol', 'automatic', 5, 7200.00, 350.00, 'Mumbai', '14 kmpl', '240 km/h', ARRAY['GPS', 'AC', 'Bluetooth', 'Leather Seats', 'Wireless Charging'], ARRAY['/images/audi-a4-1.jpg', '/images/audi-a4-2.jpg'], 'Premium sedan with advanced technology and elegant design', 4.7, 1),
('Mercedes C-Class', 'C 220d', 'Mercedes-Benz', 2023, 'luxury', 'diesel', 'automatic', 5, 7800.00, 380.00, 'Mumbai', '16 kmpl', '235 km/h', ARRAY['GPS', 'AC', 'Bluetooth', 'Leather Seats', 'Ambient Lighting'], ARRAY['/images/mercedes-c-class-1.jpg', '/images/mercedes-c-class-2.jpg'], 'Sophisticated luxury sedan with cutting-edge features', 4.9, 2),
('Toyota Camry', 'Camry Hybrid', 'Toyota', 2023, 'luxury', 'hybrid', 'automatic', 5, 5500.00, 280.00, 'Mumbai', '23 kmpl', '180 km/h', ARRAY['GPS', 'AC', 'Bluetooth', 'Hybrid Engine', 'Safety Features'], ARRAY['/images/toyota-camry-1.jpg', '/images/toyota-camry-2.jpg'], 'Eco-friendly luxury sedan with hybrid technology', 4.6, 2),
('Lamborghini Huracan', 'Huracan EVO', 'Lamborghini', 2023, 'exotic', 'petrol', 'automatic', 2, 25000.00, 1200.00, 'Mumbai', '8 kmpl', '325 km/h', ARRAY['GPS', 'AC', 'Bluetooth', 'Carbon Fiber', 'Track Mode'], ARRAY['/images/lamborghini-huracan-1.jpg', '/images/lamborghini-huracan-2.jpg'], 'Exotic supercar with breathtaking performance and design', 5.0, 3),
('Tesla Model S', 'Model S Plaid', 'Tesla', 2023, 'electric', 'electric', 'automatic', 5, 12000.00, 600.00, 'Mumbai', '500 km range', '322 km/h', ARRAY['GPS', 'AC', 'Bluetooth', 'Autopilot', 'Supercharging'], ARRAY['/images/tesla-model-s-1.jpg', '/images/tesla-model-s-2.jpg'], 'Revolutionary electric sedan with autopilot and incredible acceleration', 4.9, 2)
ON CONFLICT DO NOTHING;

-- Insert sample bookings (run after users, cars, and bookings tables are created)
INSERT INTO bookings (booking_id, user_id, car_id, pickup_date, return_date, pickup_location, return_location, total_days, rate_per_day, total_amount, paid_amount, remaining_amount, booking_status, payment_status, payment_type) VALUES
('BK001', 1, 1, '2024-01-15 10:00:00', '2024-01-18 10:00:00', 'Mumbai Airport', 'Mumbai Airport', 3, 8500.00, 25500.00, 15300.00, 10200.00, 'confirmed', 'partial', 'partial'),
('BK002', 2, 2, '2024-01-20 09:00:00', '2024-01-22 09:00:00', 'Bandra Station', 'Bandra Station', 2, 7200.00, 14400.00, 14400.00, 0.00, 'active', 'completed', 'full'),
('BK003', 3, 3, '2024-01-25 11:00:00', '2024-01-28 11:00:00', 'Andheri East', 'Andheri East', 3, 7800.00, 23400.00, 14040.00, 9360.00, 'confirmed', 'partial', 'partial')
ON CONFLICT (booking_id) DO NOTHING;

-- Insert sample payments (run after payments table is created)
INSERT INTO payments (payment_id, booking_id, user_id, amount, payment_method, gateway_payment_id, gateway_order_id, payment_status, payment_date) VALUES
('pay_001', 1, 1, 15300.00, 'razorpay', 'rzp_pay_001', 'rzp_order_001', 'completed', '2024-01-10 14:30:00'),
('pay_002', 2, 2, 14400.00, 'razorpay', 'rzp_pay_002', 'rzp_order_002', 'completed', '2024-01-15 16:45:00'),
('pay_003', 3, 3, 14040.00, 'razorpay', 'rzp_pay_003', 'rzp_order_003', 'completed', '2024-01-20 12:20:00')
ON CONFLICT (payment_id) DO NOTHING;

-- Insert sample transactions (run after transactions table is created)
INSERT INTO transactions (transaction_id, booking_id, payment_id, user_id, owner_id, transaction_type, amount, commission_amount, net_amount, status, description, processed_at) VALUES
('txn_001', 1, 1, 1, 1, 'payment', 15300.00, 1530.00, 13770.00, 'completed', 'Partial payment for BMW X5 booking', '2024-01-10 14:35:00'),
('txn_002', 2, 2, 2, 1, 'payment', 14400.00, 1440.00, 12960.00, 'completed', 'Full payment for Audi A4 booking', '2024-01-15 16:50:00'),
('txn_003', 3, 3, 3, 2, 'payment', 14040.00, 1404.00, 12636.00, 'completed', 'Partial payment for Mercedes C-Class booking', '2024-01-20 12:25:00')
ON CONFLICT (transaction_id) DO NOTHING;