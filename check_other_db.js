import { createClient } from '@supabase/supabase-js';

// ggumniunlwhzqmvpwtuo credentials
const url = 'https://ggumniunlwhzqmvpwtuo.supabase.co';
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdndW1uaXVubHdoenFtdnB3dHVvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NjcwOTIxMywiZXhwIjoyMDgyMjg1MjEzfQ.3t4R5GatcEskC4Kx-mB6N956Usc_Y-Y7-HstH9qYfG8';

const supabase = createClient(url, key);

async function run() {
    const targetUserId = '21afe54f-1fe9-4f21-8b64-3bdf76e5b7d7';
    console.log(`Checking OTHER database (ggumniun...) for User ID: ${targetUserId}`);

    const { data: user } = await supabase.from('users').select('*').eq('id', targetUserId).single();
    if (user) {
        console.log('User FOUND in OTHER database!');
        console.log('Email:', user.email);
    } else {
        console.log('User NOT FOUND in OTHER database either.');
    }
}

run();
