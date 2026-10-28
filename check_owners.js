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
    console.log('--- Checking Owners Table ---');

    // 1. Check specfic user
    const targetUserId = '21afe54f-1fe9-4f21-8b64-3bdf76e5b7d7';
    console.log(`Checking for owner with user_id: ${targetUserId}`);

    const { data: specificOwner, error: specificError } = await supabase
        .from('owners')
        .select('*')
        .eq('user_id', targetUserId);

    if (specificError) {
        console.error('Error querying specific owner:', specificError);
    } else {
        console.log('Specific Owner Result:', specificOwner);
    }

    // 2. List all owners
    console.log('\n--- All Owners ---');
    const { data: allOwners, error: allError } = await supabase
        .from('owners')
        .select('id, user_id, owner_name, email');

    if (allError) {
        console.error('Error listing all owners:', allError);
    } else {
        console.table(allOwners);
    }
};

run();
