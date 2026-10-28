import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function run() {
    console.log('--- Scanning Users in PRIMARY DB ---');
    const { data: users, error } = await supabase.from('users').select('id, email, role');

    if (error) {
        console.error('Error:', error);
    } else {
        console.log(`Total users: ${users.length}`);
        users.forEach(u => {
            console.log(`USER: ${u.email} | ID: ${u.id} | Role: ${u.role}`);
        });
    }
}

run();
