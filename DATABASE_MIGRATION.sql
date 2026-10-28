-- Database Migration: Add role column and create admin user
-- Run this in your Supabase SQL Editor

-- Step 1: Add role column to users table
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user';

-- Step 2: Create admin user (temporarily disable RLS)
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;

-- Step 3: Insert admin user
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

-- Step 4: Re-enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Step 5: Update RLS policies to allow admin access
DROP POLICY IF EXISTS "Users can view their own data" ON public.users;
DROP POLICY IF EXISTS "Users can update their own data" ON public.users;

-- Create new policies that allow admin access
CREATE POLICY "Users can view their own data or admin can view all"
  ON public.users FOR SELECT
  USING (auth.uid() = id OR role = 'admin');

CREATE POLICY "Users can update their own data or admin can update all"
  ON public.users FOR UPDATE
  USING (auth.uid() = id OR role = 'admin');

-- Step 6: Verify admin user was created
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