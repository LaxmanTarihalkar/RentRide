import { createClient } from '@supabase/supabase-js';

// ggumniunlwhzqmvpwtuo credentials
const url = 'https://ggumniunlwhzqmvpwtuo.supabase.co';
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdndW1uaXVubHdoenFtdnB3dHVvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NjcwOTIxMywiZXhwIjoyMDgyMjg1MjEzfQ.3t4R5GatcEskC4Kx-mB6N956Usc_Y-Y7-HstH9qYfG8';

const supabase = createClient(url, key);

async function run() {
    const target = '21afe54f-1fe9-4f21-8b64-3bdf76e5b7d7';
    console.log(`Deep Checking OTHER database (ggumniun...) for User ID: ${target}`);

    const { data: users } = await supabase.from('users').select('id, email').eq('id', target);
    console.log('User in Users Table:', users);

    const { data: ownerByUserId } = await supabase.from('owners').select('id, user_id, email').eq('user_id', target);
    console.log('Owner by UserID:', ownerByUserId);

    const { data: allOwners } = await supabase.from('owners').select('id, user_id, email');
    console.log('All Owners in Other DB:', allOwners);
}

run();
