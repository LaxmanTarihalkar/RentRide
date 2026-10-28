-- Create Admin User for RentRide Admin Panel
-- Run this script to create the admin user (PostgreSQL version)

-- Insert admin user (password will be 'admin123' - hashed with bcrypt)
INSERT INTO users (email, password, first_name, last_name, email_verified, created_at, updated_at)
VALUES (
  'admin@rentride.com',
  '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- bcrypt hash for 'admin123'
  'Admin',
  'User',
  true,
  NOW(),
  NOW()
)
ON CONFLICT (email) 
DO UPDATE SET
  password = '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
  first_name = 'Admin',
  last_name = 'User',
  email_verified = true,
  updated_at = NOW();

-- Admin Login Credentials:
-- Email: admin@rentride.com
-- Password: admin123

-- Note: Change the password after first login for security!