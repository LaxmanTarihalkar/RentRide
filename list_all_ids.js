import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function run() {
    console.log('--- ALL USERS ---');
    const { data: users } = await supabase.from('users').select('id, email, first_name');
    users.forEach(u => console.log(`USER: ${u.id} | ${u.email} | ${u.first_name}`));

    console.log('\n--- ALL OWNERS ---');
    const { data: owners } = await supabase.from('owners').select('id, user_id, owner_name, email');
    owners.forEach(o => console.log(`OWNER: ID=${o.id} | USER_ID=${o.user_id} | ${o.owner_name} | ${o.email}`));
}

run();
