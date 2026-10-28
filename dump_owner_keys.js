import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

async function run() {
    console.log('--- DUMPING OWNERS TABLE KEYS ---');
    const { data, error } = await supabase.from('owners').select('*').limit(1);

    if (error) {
        console.error('Error:', error);
    } else if (data && data.length > 0) {
        console.log('Columns:', JSON.stringify(Object.keys(data[0]), null, 2));
    } else {
        console.log('Owners table is empty.');
    }
}

run();
