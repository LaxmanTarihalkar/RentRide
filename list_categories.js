import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

async function run() {
    console.log('--- FETCHING VEHICLE CATEGORIES ---');
    const { data: categories, error } = await supabase.from('vehicle_categories').select('*');
    if (error) {
        console.error('Error:', error);
    } else {
        console.log('Categories found:', categories.map(c => c.name));
    }
}

run();
