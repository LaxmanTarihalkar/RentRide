import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

async function run() {
    console.log('--- FINAL AUDIT OF OWNER PROFILES ---');
    const { data: users, error: userError } = await supabase.from('users').select('id, email').eq('role', 'owner');

    if (userError) {
        console.error('User fetch error:', userError);
        return;
    }

    let missingCount = 0;
    for (const user of users) {
        const { data: owner, error: ownerError } = await supabase.from('owners').select('id').eq('user_id', user.id).single();
        if (ownerError && ownerError.code === 'PGRST116') {
            console.log(`[MISSING] ${user.email} (ID: ${user.id})`);
            missingCount++;
        }
    }

    console.log(`--- Audit Complete. Total Owners: ${users.length}. Missing Profiles: ${missingCount}. ---`);
}

run();
