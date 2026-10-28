import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

console.log('Using URL:', supabaseUrl);
console.log('Key Sample:', supabaseServiceKey?.substring(0, 10) + '...');

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function run() {
    const userId = 'b2ae1500-6684-4b04-9d3d-adff0ee7d74b';
    const email = 'sidharthburjiabvk@gmail.com';

    console.log(`--- Repairing owner record for ${email} ---`);

    // 1. Check users
    console.log('Checking Users Table...');
    const { data: user, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

    if (userError) {
        console.error('ERROR in Users Table Check:', userError.message, userError.code);
        return;
    }
    console.log('User found:', user.email);

    // 2. Check owners
    console.log('Checking Owners Table...');
    const { data: existingOwner, error: checkError } = await supabase
        .from('owners')
        .select('id')
        .eq('user_id', userId)
        .single();

    if (existingOwner) {
        console.log('Owner record already exists with ID:', existingOwner.id);
        return;
    }

    // 3. Insert
    const businessName = `${user.first_name}'s Fleet`;
    const businessCode = businessName.replace(/[^a-zA-Z0-9]/g, '').substring(0, 6).toUpperCase();
    const timestamp = Date.now().toString().slice(-6);
    const partnerId = `FC${businessCode}${timestamp}FIX`;

    console.log('Inserting Owner Profile...');
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
        console.error('ERROR during Insert:', createError.message, createError.code);
    } else {
        console.log('Owner profile created successfully:', newOwner.id);
    }
}

run();
