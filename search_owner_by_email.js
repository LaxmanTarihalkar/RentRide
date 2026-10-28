import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function run() {
    const email = 'rentride.test.user@gmail.com'; // Adjust if needed
    console.log(`Searching for owner by email: ${email}`);

    const { data: owner } = await supabase
        .from('owners')
        .select('*')
        .eq('email', email)
        .single();

    if (owner) {
        console.log('Owner found by email!');
        console.log('Owner ID:', owner.id);
        console.log('Owner USER_ID in DB:', owner.user_id);
    } else {
        console.log('No owner found with that email.');
    }

    const { data: allOwners } = await supabase.from('owners').select('user_id');
    console.log('All user_id in owners table:', allOwners.map(o => o.user_id));
}

run();
