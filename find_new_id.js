import { createClient } from '@supabase/supabase-js';

const projects = [
    {
        name: 'splgyyhtdplshlrwaesg (Active)',
        url: 'https://splgyyhtdplshlrwaesg.supabase.co',
        key: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNwbGd5eWh0ZHBsc2hscndhZXNnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NjY1Nzg1MSwiZXhwIjoyMDgyMjMzODUxfQ.nU-wVjYAtuilZ-mcnsPbHqQhl3LRjEdPCKSzN5rO3Q8'
    },
    {
        name: 'ggumniunlwhzqmvpwtuo (Secondary)',
        url: 'https://ggumniunlwhzqmvpwtuo.supabase.co',
        key: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdndW1uaXVubHdoenFtdnB3dHVvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NjcwOTIxMywiZXhwIjoyMDgyMjg1MjEzfQ.3t4R5GatcEskC4Kx-mB6N956Usc_Y-Y7-HstH9qYfG8'
    }
];

const targetId = 'b2ae1500-6684-4b04-9d3d-adff0ee7d74b';

async function checkProject(project) {
    console.log(`\n--- Checking ${project.name} ---`);
    const supabase = createClient(project.url, project.key);

    const { data: user } = await supabase.from('users').select('*').eq('id', targetId).single();
    if (user) {
        console.log(`User FOUND in ${project.name}. Email: ${user.email}, Role: ${user.role}`);
        const { data: owner } = await supabase.from('owners').select('*').eq('user_id', targetId).single();
        if (owner) {
            console.log(`Owner profile FOUND in ${project.name}. ID: ${owner.id}`);
        } else {
            console.log(`Owner profile MISSING in ${project.name}.`);
        }
    } else {
        console.log(`User NOT FOUND in ${project.name}.`);
    }
}

async function run() {
    for (const p of projects) {
        await checkProject(p);
    }
}

run();
