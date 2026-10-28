import { createClient } from '@supabase/supabase-js';

// Credentials provided by user
const SUPABASE_URL = 'https://splgyyhtdplshlrwaesg.supabase.co';
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNwbGd5eWh0ZHBsc2hscndhZXNnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NjY1Nzg1MSwiZXhwIjoyMDgyMjMzODUxfQ.nU-wVjYAtuilZ-mcnsPbHqQhl3LRjEdPCKSzN5rO3Q8';

const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

async function fixOwner() {
    console.log('Attempting to fix missing owner profile...');

    const userId = '09007d11-4f83-4a36-bbe0-09e738d1e959';

    // 1. Check if owner exists
    const { data: existing } = await supabase
        .from('owners')
        .select('*')
        .eq('user_id', userId)
        .single();

    if (existing) {
        console.log('Owner profile already exists:', existing);
        return;
    }

    // 2. Insert Owner
    const { data, error } = await supabase
        .from('owners')
        .insert({
            user_id: userId,
            owner_name: 'Direct User',
            email: 'user_09007d11@rentride.com', // Placeholder
            phone: 'N/A',
            business_type: 'individual',
            business_name: 'Direct Fleet',
            address: 'Not Provided',
            city: 'Not Provided',
            state: 'Not Provided',
            pincode: '000000',
            verification_status: 'approved'
        })
        .select()
        .single();

    if (error) {
        console.error('Error creating owner:', error);
    } else {
        console.log('Successfully created owner profile:', data);
    }
}

fixOwner();
