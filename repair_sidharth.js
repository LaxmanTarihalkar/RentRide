import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function run() {
    const userId = 'b2ae1500-6684-4b04-9d3d-adff0ee7d74b';
    const email = 'sidharthburjiabvk@gmail.com';

    console.log(`--- Repairing owner record for ${email} ---`);

    // 1. Get User Details
    const { data: user, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

    if (userError || !user) {
        console.error('User not found!', userError);
        return;
    }

    // 2. Generate partner_id (simulating credentialsGenerator.js)
    const businessName = `${user.first_name}'s Fleet`;
    const businessCode = businessName.replace(/[^a-zA-Z0-9]/g, '').substring(0, 6).toUpperCase();
    const timestamp = Date.now().toString().slice(-6);
    const partnerId = `FC${businessCode}${timestamp}FIX`;

    // 3. Insert Owner Profile
    const { data: newOwner, error: createError } = await supabase
        .from('owners')
        .insert({
            user_id: userId,
            owner_name: `${user.first_name} ${user.last_name}`,
            email: email,
            phone: 'Not Provided',
            business_type: 'individual',
            business_name: businessName,
            address: 'Not Provided',
            city: 'Not Provided',
            state: 'Not Provided',
            pincode: '000000',
            verification_status: 'approved',
            verified: true,
            wallet_balance: 0,
            rating: 5,
            partner_id: partnerId,
            approval_date: new Date().toISOString()
        })
        .select()
        .single();

    if (createError) {
        console.error('Failed to create owner profile:', createError);
    } else {
        console.log('Owner profile created successfully:', newOwner.id);
    }
}

run();
