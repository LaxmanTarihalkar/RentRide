
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing Supabase credentials in .env');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkBookings() {
    console.log('Checking bookings...');

    // 1. Raw count
    const { count, error: countError } = await supabase
        .from('bookings')
        .select('*', { count: 'exact', head: true });

    if (countError) console.error('Count Error:', countError);
    console.log('Total Bookings (Raw Count):', count);

    // 2. Select with joins (The query used in admin.js)
    const { data: bookingsData, error } = await supabase
        .from('bookings')
        .select(`
          *,
          users(first_name, last_name, email),
          vehicles(name, brand, model, category_name, primary_image)
        `)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Query Error:', error);
    } else {
        console.log(`Fetched ${bookingsData.length} bookings via detailed query.`);
        if (bookingsData.length > 0) {
            console.log('Sample Booking[0]:', JSON.stringify(bookingsData[0], null, 2));
        }
    }

    // 3. Check simple select
    const { data: simpleData } = await supabase.from('bookings').select('*');
    console.log(`Fetched ${simpleData ? simpleData.length : 0} bookings via simple query.`);
}

checkBookings();
