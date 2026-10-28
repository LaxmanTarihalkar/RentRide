-- Complete Admin Setup for RentRide
-- Run this in your Supabase SQL Editor

-- First, ensure the users table exists and has proper structure
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email_verified BOOLEAN DEFAULT FALSE,
  role TEXT DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add role column if it doesn't exist
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user';

-- Create admin user with proper permissions
-- First, temporarily disable RLS to insert admin user
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;

-- Insert or update admin user
INSERT INTO public.users (email, password, first_name, last_name, email_verified, role, created_at, updated_at)
VALUES (
  'admin@rentride.com',
  '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- bcrypt hash for 'admin123'
  'Admin',
  'User',
  true,
  'admin',
  NOW(),
  NOW()
)
ON CONFLICT (email) 
DO UPDATE SET
  password = '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
  first_name = 'Admin',
  last_name = 'User',
  email_verified = true,
  role = 'admin',
  updated_at = NOW();

-- Re-enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to recreate them
DROP POLICY IF EXISTS "Users can view their own data" ON public.users;
DROP POLICY IF EXISTS "Users can update their own data" ON public.users;
DROP POLICY IF EXISTS "Admin can view all users" ON public.users;
DROP POLICY IF EXISTS "Admin can update all users" ON public.users;

-- Create policies for users table
CREATE POLICY "Users can view their own data"
  ON public.users FOR SELECT
  USING (auth.uid() = id OR role = 'admin');

CREATE POLICY "Users can update their own data"
  ON public.users FOR UPDATE
  USING (auth.uid() = id OR role = 'admin');

-- Allow admin to view and manage all users
CREATE POLICY "Admin can view all users"
  ON public.users FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admin can update all users"
  ON public.users FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Create policy for admin to insert users
CREATE POLICY "Admin can insert users"
  ON public.users FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Create policy for admin to delete users
CREATE POLICY "Admin can delete users"
  ON public.users FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON public.users TO anon, authenticated;

-- Verify admin user was created
SELECT 
  id, 
  email, 
  first_name, 
  last_name, 
  role, 
  email_verified,
  created_at
FROM public.users 
WHERE email = 'admin@rentride.com';

-- Admin Login Credentials:
-- Email: admin@rentride.com
-- Password: admin123

-- IMPORTANT: Change the password after first login for security!