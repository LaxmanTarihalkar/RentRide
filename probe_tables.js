import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function run() {
    console.log('--- Probing Database Tables via RPC/SQL ---');

    // We try to query the information_schema
    const { data: tables, error } = await supabase.rpc('get_table_names'); // If exists

    if (error) {
        console.log('RPC get_table_names failed, trying raw select from information_schema...');
        // Note: raw select from information_schema might be blocked via PostgREST 
        // unless there's a view or RPC.
    }

    // Let's try to query 'owners' with head: false but limit 0
    const { data, error: tableError } = await supabase.from('owners').select('*').limit(0);
    if (tableError) {
        console.error('ERROR querying owners (limit 0):', tableError.message, tableError.code);
    } else {
        console.log('Owners table query (limit 0) SUCCESS.');
    }
}

run();
