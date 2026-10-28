import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function run() {
    console.log('--- TABLES INFO ---');
    const { data, error } = await supabase.rpc('get_tables'); // This might not exist

    // Alternative: try to select from a known system table if allowed, 
    // but better to just try a simple query to see which tables fail.

    const tables = ['users', 'owners', 'vehicles', 'bookings', 'payments'];
    for (const table of tables) {
        const { error } = await supabase.from(table).select('count', { count: 'exact', head: true });
        if (error) {
            console.log(`Table '${table}': ERROR - ${error.message} (${error.code})`);
        } else {
            console.log(`Table '${table}': OK`);
        }
    }
}

run();
