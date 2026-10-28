import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function run() {
    console.log('--- USERS WITH OWNER ROLE ---');
    // Note: 'role' might be in a different table or column.
    // Let's just list all users with any role info.
    const { data: users } = await supabase.from('users').select('*');
    users.forEach(u => {
        if (u.role === 'owner' || u.is_owner) {
            console.log(`OWNER_USER: ID=${u.id} | EMAIL=${u.email} | ROLE=${u.role}`);
        }
    });

    console.log('\n--- ALL OWNERS IN OWNERS TABLE ---');
    const { data: owners } = await supabase.from('owners').select('*');
    owners.forEach(o => {
        console.log(`OWNER_REC: ID=${o.id} | USER_ID=${o.user_id} | EMAIL=${o.email}`);
    });
}

run();
