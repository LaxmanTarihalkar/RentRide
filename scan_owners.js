import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function run() {
    console.log('--- SCANNING ALL OWNERS ---');
    const { data: owners, error } = await supabase.from('owners').select('*');
    if (error) {
        console.error('Error:', error);
    } else {
        console.log(`Found ${owners.length} owners.`);
        owners.forEach(o => {
            console.log(`Owner: ${o.owner_name} | UserID: ${o.user_id} | Email: ${o.email}`);
        });
    }
}

run();
