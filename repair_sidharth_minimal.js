import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function run() {
    const userId = 'b2ae1500-6684-4b04-9d3d-adff0ee7d74b';
    const email = 'sidharthburjiabvk@gmail.com';

    console.log(`--- Repairing owner record (MINIMAL) for ${email} ---`);

    // 1. Get User
    const { data: user } = await supabase.from('users').select('*').eq('id', userId).single();
    if (!user) {
        console.error('User not found!');
        return;
    }

    // 2. Insert MINIMAL (only columns we KNOW exist)
    const { data: newOwner, error: createError } = await supabase
        .from('owners')
        .insert({
            user_id: userId,
            owner_name: `${user.first_name} ${user.last_name}`,
            email: email,
            phone: 'N/A',
            business_type: 'individual',
            business_name: `${user.first_name}'s Fleet`,
            address: 'Not Provided',
            city: 'Not Provided',
            state: 'Not Provided',
            pincode: '000000',
            verification_status: 'approved', // This exists
            created_at: new Date().toISOString()
        })
        .select()
        .single();

    if (createError) {
        console.error('MINIMAL INSERT FAILED:', createError.message, createError.code);
    } else {
        console.log('MINIMAL Owner profile created successfully:', newOwner.id);
    }
}

run();
