import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

async function run() {
    console.log('--- AUDITING ALL OWNER USERS ---');
    const { data: users } = await supabase.from('users').select('id, email').eq('role', 'owner');

    for (const user of users) {
        const { data: owner } = await supabase.from('owners').select('id').eq('user_id', user.id).single();
        if (!owner) {
            console.log(`MISSING OWNER PROFILE: ${user.email} (ID: ${user.id})`);
        } else {
            console.log(`OK: ${user.email}`);
        }
    }
}

run();
