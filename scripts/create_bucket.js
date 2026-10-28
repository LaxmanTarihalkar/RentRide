import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://splgyyhtdplshlrwaesg.supabase.co';
// Using the service role key provided by the user previously
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNwbGd5eWh0ZHBsc2hscndhZXNnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NjY1Nzg1MSwiZXhwIjoyMDgyMjMzODUxfQ.nU-wVjYAtuilZ-mcnsPbHqQhl3LRjEdPCKSzN5rO3Q8';

const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

async function createBucket() {
    console.log('Creating vehicle-images bucket...');

    // 1. Create Bucket
    const { data, error } = await supabase
        .storage
        .createBucket('vehicle-images', {
            public: true,
            fileSizeLimit: 5242880, // 5MB
            allowedMimeTypes: ['image/png', 'image/jpeg', 'image/webp', 'image/jpg']
        });

    if (error) {
        console.error('Error creating bucket:', error);
    } else {
        console.log('Bucket created successfully:', data);
    }
}

createBucket();
