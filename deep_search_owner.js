import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function run() {
    const target = '21afe54f-1fe9-4f21-8b64-3bdf76e5b7d7';
    console.log(`Searching for ${target}...`);

    const { data: user } = await supabase.from('users').select('*').eq('id', target).single();
    console.log('User found in users table:', user ? 'YES' : 'NO');
    if (user) console.log('User Email:', user.email);

    const { data: ownerByUserId } = await supabase.from('owners').select('*').eq('user_id', target).single();
    console.log('Owner found by user_id:', ownerByUserId ? 'YES' : 'NO');

    const { data: ownerById } = await supabase.from('owners').select('*').eq('id', target).single();
    console.log('Owner found by id (primary key):', ownerById ? 'YES' : 'NO');

    const { data: allOwners } = await supabase.from('owners').select('id, user_id, owner_name');
    console.log('All Owners List:');
    allOwners.forEach(o => {
        console.log(`- ID: ${o.id}, USER_ID: ${o.user_id}, Name: ${o.owner_name}`);
    });
}

run();
