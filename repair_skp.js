import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

async function run() {
    const userId = '9120c520-e7fa-4de9-ae5b-3d977c860d90';
    const email = 'skp_owner@gmail.com';

    console.log(`--- Repairing owner record for ${email} ---`);

    const { data: user } = await supabase.from('users').select('*').eq('id', userId).single();
    if (user) {
        // Mark verified
        await supabase.from('users').update({ email_verified: true }).eq('id', userId);

        // Create owner profile (MINIMAL)
        const { data: newOwner } = await supabase.from('owners').insert({
            user_id: userId,
            owner_name: `${user.first_name} ${user.last_name}`.trim() || 'SKP Owner',
            email: email,
            phone: 'N/A',
            business_type: 'individual',
            business_name: 'SKP Fleet',
            address: 'Not Provided',
            city: 'Not Provided',
            state: 'Not Provided',
            pincode: '000000',
            verification_status: 'approved',
            created_at: new Date().toISOString()
        }).select().single();

        if (newOwner) console.log('Owner profile created for SKP.');
    }
}

run();
