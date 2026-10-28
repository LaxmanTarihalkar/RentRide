import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

async function run() {
    console.log('--- AUTO-REPAIRING OWNER PROFILES ---');
    const { data: users, error: userError } = await supabase.from('users').select('*').eq('role', 'owner');

    if (userError) {
        console.error('User fetch error:', userError);
        return;
    }

    for (const user of users) {
        const { data: owner, error: ownerError } = await supabase.from('owners').select('id').eq('user_id', user.id).single();
        if (ownerError && ownerError.code === 'PGRST116') {
            console.log(`REPAIRING: ${user.email}`);

            // Mark verified
            await supabase.from('users').update({ email_verified: true }).eq('id', user.id);

            // Create profile
            const { error: createError } = await supabase.from('owners').insert({
                user_id: user.id,
                owner_name: `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'Owner',
                email: user.email,
                phone: 'N/A',
                business_type: 'individual',
                business_name: `${user.first_name || 'Owner'}'s Fleet`,
                address: 'Not Provided',
                city: 'Not Provided',
                state: 'Not Provided',
                pincode: '000000',
                verification_status: 'approved',
                created_at: new Date().toISOString()
            });

            if (createError) {
                console.error(`Failed to repair ${user.email}:`, createError.message);
            } else {
                console.log(`SUCCESS: ${user.email} profile created.`);
            }
        }
    }
}

run();
