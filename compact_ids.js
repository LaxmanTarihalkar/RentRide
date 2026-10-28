import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function run() {
    const { data: owners } = await supabase.from('owners').select('user_id');
    console.log('START_IDS');
    owners.forEach(o => console.log(o.user_id));
    console.log('END_IDS');
}

run();
