import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing Supabase credentials in .env');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const run = async () => {
    console.log('START_CHECK');

    const targetUserId = '21afe54f-1fe9-4f21-8b64-3bdf76e5b7d7';
    console.log(`Searching for user_id: ${targetUserId}`);

    // 1. Check specfic owner
    const { data: specificOwner, error: specificError } = await supabase
        .from('owners')
        .select('*')
        .eq('user_id', targetUserId);

    if (specificError) console.error('Error 1:', specificError);
    console.log('Result 1 (Specific):', JSON.stringify(specificOwner, null, 2));

    // 2. Check if this user exists in USERS table
    const { data: userRecord, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', targetUserId);

    if (userError) console.error('Error 2:', userError);
    console.log('Result 2 (User Table):', JSON.stringify(userRecord, null, 2));

    // 3. List all owners
    const { data: allOwners, error: allError } = await supabase
        .from('owners')
        .select('*');

    console.log('Result 3 (All Owners - User IDs):');
    allOwners.forEach(o => console.log(`Owner ID: ${o.id}, User ID: ${o.user_id}, Name: ${o.owner_name}`));

    console.log('END_CHECK');
};

run();
