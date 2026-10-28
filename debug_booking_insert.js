import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing Supabase credentials');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testBooking() {
    console.log('Testing Booking Creation...');

    // 1. Get a user
    const { data: users, error: userError } = await supabase
        .from('users')
        .select('id, email')
        .limit(1);

    if (userError || !users || users.length === 0) {
        console.error('Failed to get user:', userError);
        return;
    }

    const user = users[0];
    console.log('Using User:', user.email, 'ID:', user.id);

    // 3. Mock booking data (Updated Schema)
    const bookingData = {
        user_id: user.id,
        vehicle_id: 1, // Assuming vehicle ID 1 exists. We should probably fetch a vehicle first.
        pickup_date: new Date().toISOString(),
        return_date: new Date(Date.now() + 86400000).toISOString(),
        return_date: new Date(Date.now() + 86400000).toISOString(),
        total_days: 1,
        price_per_day: 1000,
        subtotal: 1000,
        total_amount: 1000,
        booking_status: 'confirmed'
    };

    // 3. Attempt insert
    const { data, error } = await supabase
        .from('bookings')
        .insert([bookingData])
        .select();

    if (error) {
        console.error('❌ Insert Error:', error);
        // Check for specific error like relation constraint
    } else {
        console.log('✅ Insert Success:', data);

        // Clean up
        console.log('Cleaning up test booking...');
        await supabase.from('bookings').delete().eq('id', data[0].id);
    }
}

testBooking();
