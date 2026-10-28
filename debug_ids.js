import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function run() {
    const { data: owners, error } = await supabase.from('owners').select('*');
    if (error) {
        console.error('Error:', error);
    } else {
        console.log('OWNERS_COUNT:', owners.length);
        owners.forEach(o => {
            console.log(`OWNER: ID=${o.id}, USER_ID=${o.user_id}, EMAIL=${o.email}`);
        });
    }

    const { data: users, error: userError } = await supabase.from('users').select('*').limit(5);
    if (userError) {
        console.error('User Error:', userError);
    } else {
        console.log('USERS_SAMPLE:');
        users.forEach(u => {
            console.log(`USER: ID=${u.id}, EMAIL=${u.email}`);
        });
    }
}

run();
