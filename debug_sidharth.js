import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function run() {
    const email = 'sidharthburjiabvk@gmail.com';
    console.log(`--- Investigating user: ${email} ---`);

    // 1. Check users table
    const { data: user, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single();

    if (userError) {
        console.log('User NOT FOUND in "users" table via Supabase Client.');
    } else {
        console.log('User FOUND in "users" table:');
        console.log(`ID: ${user.id} | Email: ${user.email} | Role: ${user.role} | Verified: ${user.email_verified}`);
    }

    // 2. Check owners table
    const { data: owner, error: ownerError } = await supabase
        .from('owners')
        .select('*')
        .eq('email', email)
        .single();

    if (ownerError) {
        console.log('Owner NOT FOUND in "owners" table via email.');
    } else {
        console.log('Owner FOUND in "owners" table:');
        console.log(`ID: ${owner.id} | USER_ID: ${owner.user_id} | Name: ${owner.owner_name}`);
    }

    // 3. Try searching owners by user_id if we have it
    if (user) {
        const { data: ownerById, error: ownerByIdError } = await supabase
            .from('owners')
            .select('*')
            .eq('user_id', user.id)
            .single();

        if (ownerByIdError) {
            console.log(`Owner NOT FOUND in "owners" table via user_id: ${user.id}`);
        } else {
            console.log('Owner FOUND in "owners" table via user_id!');
        }
    }
}

run();
