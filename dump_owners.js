import { createClient } from '@supabase/supabase-js';

const url = 'https://splgyyhtdplshlrwaesg.supabase.co';
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNwbGd5eWh0ZHBsc2hscndhZXNnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NjY1Nzg1MSwiZXhwIjoyMDgyMjMzODUxfQ.nU-wVjYAtuilZ-mcnsPbHqQhl3LRjEdPCKSzN5rO3Q8';
const supabase = createClient(url, key);

async function run() {
    const { data: owners, error } = await supabase.from('owners').select('*');
    console.log('--- START_OWNERS_LIST ---');
    if (error) {
        console.error('Error:', error);
    } else {
        owners.forEach(o => {
            console.log(JSON.stringify(o));
        });
    }
    console.log('--- END_OWNERS_LIST ---');
}

run();
