import { createClient } from '@supabase/supabase-js';

const url = 'https://splgyyhtdplshlrwaesg.supabase.co';
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNwbGd5eWh0ZHBsc2hscndhZXNnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NjY1Nzg1MSwiZXhwIjoyMDgyMjMzODUxfQ.nU-wVjYAtuilZ-mcnsPbHqQhl3LRjEdPCKSzN5rO3Q8';
const supabase = createClient(url, key);

async function run() {
    const email = 'skp_owner@gmail.com';
    const { data: user, error } = await supabase.from('users').select('*').eq('email', email).single();
    if (error) {
        console.error('Error:', error);
    } else {
        console.log(`User ID: ${user.id} | Email: ${user.email} | Role: ${user.role}`);
    }
}

run();
