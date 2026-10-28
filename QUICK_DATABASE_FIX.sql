-- Quick Database Fix - Copy and paste this into Supabase SQL Editor

-- Add new columns to existing bookings table
ALTER TABLE public.bookings 
ADD COLUMN from_time TIME DEFAULT '10:00:00',
ADD COLUMN to_time TIME DEFAULT '10:00:00',
ADD COLUMN confirmation_email_sent BOOLEAN DEFAULT FALSE,
ADD COLUMN reminder_email_sent BOOLEAN DEFAULT FALSE;

-- Add computed datetime columns
ALTER TABLE public.bookings 
ADD COLUMN pickup_datetime TIMESTAMP WITH TIME ZONE 
GENERATED ALWAYS AS ((from_date || ' ' || from_time)::timestamp with time zone) STORED;

ALTER TABLE public.bookings 
ADD COLUMN return_datetime TIMESTAMP WITH TIME ZONE 
GENERATED ALWAYS AS ((to_date || ' ' || to_time)::timestamp with time zone) STORED;

-- Create indexes
CREATE INDEX idx_bookings_pickup_datetime ON public.bookings(pickup_datetime);
CREATE INDEX idx_bookings_return_datetime ON public.bookings(return_datetime);

-- Update existing records
UPDATE public.bookings SET from_time = '10:00:00', to_time = '10:00:00' WHERE from_time IS NULL;