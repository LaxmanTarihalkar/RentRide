import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function run() {
    const { data: owners } = await supabase.from('owners').select('id');
    console.log('START_PRIMARY_IDS');
    owners.forEach(o => console.log(o.id));
    console.log('END_PRIMARY_IDS');
}

run();
