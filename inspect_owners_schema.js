import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function run() {
    console.log('--- Inspecting owners table schema ---');

    // We try to get one row to see all columns
    const { data, error } = await supabase
        .from('owners')
        .select('*')
        .limit(1);

    if (error) {
        console.error('Error fetching from owners:', error);
    } else if (data && data.length > 0) {
        console.log('Columns found:', Object.keys(data[0]));
        console.log('Sample data:', data[0]);
    } else {
        console.log('Owners table is empty, trying to probe columns via RPC or alternative...');
        // If empty, we can try to insert a dummy and rollback, but safer to just use a descriptive error if possible.
        // Actually, I can use a query that intentionally fails or use the API's introspect if available.
    }
}

run();
