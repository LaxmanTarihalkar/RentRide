import { createClient } from '@supabase/supabase-js';

const url = 'https://splgyyhtdplshlrwaesg.supabase.co';
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNwbGd5eWh0ZHBsc2hscndhZXNnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NjY1Nzg1MSwiZXhwIjoyMDgyMjMzODUxfQ.nU-wVjYAtuilZ-mcnsPbHqQhl3LRjEdPCKSzN5rO3Q8';
const supabase = createClient(url, key);

async function run() {
    const email = 'skp_owner@gmail.com';
    console.log(`--- Searching for owner with email: ${email} ---`);
    const { data: owners, error } = await supabase.from('owners').select('*').eq('email', email);
    if (error) {
        console.error('Error:', error);
    } else {
        console.log(`Found ${owners.length} records.`);
        owners.forEach(o => {
            console.log(JSON.stringify(o));
        });
    }
}

run();
