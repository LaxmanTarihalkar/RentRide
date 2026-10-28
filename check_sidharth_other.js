import { createClient } from '@supabase/supabase-js';

// ggumniunlwhzqmvpwtuo credentials
const url = 'https://ggumniunlwhzqmvpwtuo.supabase.co';
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdndW1uaXVubHdoenFtdnB3dHVvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NjcwOTIxMywiZXhwIjoyMDgyMjg1MjEzfQ.3t4R5GatcEskC4Kx-mB6N956Usc_Y-Y7-HstH9qYfG8';

const supabase = createClient(url, key);

async function run() {
    const email = 'sidharthburjiabvk@gmail.com';
    console.log(`--- Checking ggumniun database for ${email} ---`);

    const { data: user, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single();

    if (userError) {
        console.log('User NOT FOUND in "users" table of ggumniun.');
    } else {
        console.log('User FOUND in "users" table of ggumniun:');
        console.log(`ID: ${user.id} | Role: ${user.role}`);

        const { data: owner } = await supabase
            .from('owners')
            .select('*')
            .eq('user_id', user.id)
            .single();

        if (owner) {
            console.log('Owner profile FOUND in ggumniun!');
        } else {
            console.log('Owner profile MISSING in ggumniun.');
        }
    }
}

run();
