-- RentRide Database Schema
-- Run this in your Supabase SQL Editor

-- Create users table
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create verification_tokens table
CREATE TABLE IF NOT EXISTS public.verification_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  token TEXT UNIQUE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('email_verification', 'password_reset')),
  used BOOLEAN DEFAULT FALSE,
  used_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_tokens_token ON public.verification_tokens(token);
CREATE INDEX IF NOT EXISTS idx_tokens_user_id ON public.verification_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_tokens_expires_at ON public.verification_tokens(expires_at);

-- Enable Row Level Security (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.verification_tokens ENABLE ROW LEVEL SECURITY;

-- Create policies for users table
CREATE POLICY "Users can view their own data"
  ON public.users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own data"
  ON public.users FOR UPDATE
  USING (auth.uid() = id);

-- Create policies for verification_tokens table
CREATE POLICY "Users can view their own tokens"
  ON public.verification_tokens FOR SELECT
  USING (user_id = auth.uid());

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for users table
DROP TRIGGER IF EXISTS update_users_updated_at ON public.users;
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to clean up expired tokens (run periodically)
CREATE OR REPLACE FUNCTION cleanup_expired_tokens()
RETURNS void AS $$
BEGIN
  DELETE FROM public.verification_tokens
  WHERE expires_at < NOW() AND used = FALSE;
END;
$$ LANGUAGE plpgsql;

-- Create bookings table
CREATE TABLE IF NOT EXISTS public.bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  car_id INTEGER NOT NULL,
  car_name TEXT NOT NULL,
  car_category TEXT NOT NULL,
  car_image TEXT NOT NULL,
  car_price DECIMAL(10,2) NOT NULL,
  from_date DATE NOT NULL,
  from_time TIME NOT NULL DEFAULT '10:00:00',
  to_date DATE NOT NULL,
  to_time TIME NOT NULL DEFAULT '10:00:00',
  pickup_datetime TIMESTAMP WITH TIME ZONE GENERATED ALWAYS AS (
    (from_date || ' ' || from_time)::timestamp with time zone
  ) STORED,
  return_datetime TIMESTAMP WITH TIME ZONE GENERATED ALWAYS AS (
    (to_date || ' ' || to_time)::timestamp with time zone
  ) STORED,
  days INTEGER NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  payment_amount DECIMAL(10,2) NOT NULL,
  payment_type TEXT NOT NULL CHECK (payment_type IN ('minimum', 'full')),
  remaining_amount DECIMAL(10,2) DEFAULT 0,
  payment_id TEXT NOT NULL,
  order_id TEXT,
  booking_status TEXT NOT NULL DEFAULT 'confirmed' CHECK (booking_status IN ('confirmed', 'cancelled', 'completed')),
  payment_status TEXT NOT NULL DEFAULT 'paid' CHECK (payment_status IN ('paid', 'pending', 'failed')),
  confirmation_email_sent BOOLEAN DEFAULT FALSE,
  reminder_email_sent BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for bookings
CREATE INDEX IF NOT EXISTS idx_bookings_user_id ON public.bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_from_date ON public.bookings(from_date);
CREATE INDEX IF NOT EXISTS idx_bookings_to_date ON public.bookings(to_date);
CREATE INDEX IF NOT EXISTS idx_bookings_pickup_datetime ON public.bookings(pickup_datetime);
CREATE INDEX IF NOT EXISTS idx_bookings_return_datetime ON public.bookings(return_datetime);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON public.bookings(booking_status);
CREATE INDEX IF NOT EXISTS idx_bookings_created_at ON public.bookings(created_at);
CREATE INDEX IF NOT EXISTS idx_bookings_reminder_pending ON public.bookings(pickup_datetime, reminder_email_sent) WHERE booking_status = 'confirmed' AND reminder_email_sent = FALSE;

-- Enable RLS for bookings
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- Create policies for bookings table
CREATE POLICY "Users can view their own bookings"
  ON public.bookings FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own bookings"
  ON public.bookings FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own bookings"
  ON public.bookings FOR UPDATE
  USING (user_id = auth.uid());

-- Create trigger for bookings table
DROP TRIGGER IF EXISTS update_bookings_updated_at ON public.bookings;
CREATE TRIGGER update_bookings_updated_at
  BEFORE UPDATE ON public.bookings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Grant necessary permissions (adjust as needed)
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON public.users TO anon, authenticated;
GRANT ALL ON public.verification_tokens TO anon, authenticated;
GRANT ALL ON public.bookings TO anon, authenticated;