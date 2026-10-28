-- Database Update Script for Email & Time Features
-- Run this in your Supabase SQL Editor to add new columns to existing bookings table

-- Add time columns to bookings table
ALTER TABLE public.bookings 
ADD COLUMN IF NOT EXISTS from_time TIME DEFAULT '10:00:00',
ADD COLUMN IF NOT EXISTS to_time TIME DEFAULT '10:00:00',
ADD COLUMN IF NOT EXISTS confirmation_email_sent BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS reminder_email_sent BOOLEAN DEFAULT FALSE;

-- Add computed datetime columns (these will be calculated automatically)
ALTER TABLE public.bookings 
ADD COLUMN IF NOT EXISTS pickup_datetime TIMESTAMP WITH TIME ZONE 
GENERATED ALWAYS AS (
  (from_date || ' ' || from_time)::timestamp with time zone
) STORED;

ALTER TABLE public.bookings 
ADD COLUMN IF NOT EXISTS return_datetime TIMESTAMP WITH TIME ZONE 
GENERATED ALWAYS AS (
  (to_date || ' ' || to_time)::timestamp with time zone
) STORED;

-- Create new indexes for better performance
CREATE INDEX IF NOT EXISTS idx_bookings_pickup_datetime ON public.bookings(pickup_datetime);
CREATE INDEX IF NOT EXISTS idx_bookings_return_datetime ON public.bookings(return_datetime);
CREATE INDEX IF NOT EXISTS idx_bookings_reminder_pending ON public.bookings(pickup_datetime, reminder_email_sent) 
WHERE booking_status = 'confirmed' AND reminder_email_sent = FALSE;

-- Update existing bookings to have default times if they don't have them
UPDATE public.bookings 
SET from_time = '10:00:00', to_time = '10:00:00' 
WHERE from_time IS NULL OR to_time IS NULL;

-- Verify the changes
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'bookings' AND table_schema = 'public'
ORDER BY ordinal_position;