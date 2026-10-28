import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const run = async () => {
    const userId = '21afe54f-1fe9-4f21-8b64-3bdf76e5b7d7';
    console.log(`Fixing owner record for User ID: ${userId}`);

    // 1. Get User Details
    const { data: user, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

    if (userError || !user) {
        console.error('User not found in users table!', userError);
        return;
    }
    console.log('User found:', user.email);

    // 2. Check if already in Owners
    const { data: existingOwner, error: ownerError } = await supabase
        .from('owners')
        .select('*')
        .eq('user_id', userId)
        .single();

    if (existingOwner) {
        console.log('Owner already exists:', existingOwner);
    } else {
        console.log('Owner missing. Creating now...');
        const { data: newOwner, error: createError } = await supabase
            .from('owners')
            .insert({
                user_id: userId,
                owner_name: `${user.first_name} ${user.last_name}`.trim() || 'Unknown Owner',
                email: user.email,
                phone: user.phone || '',
                wallet_balance: 0,
                rating: 0,
                verified: true
            })
            .select()
            .single();

        if (createError) {
            console.error('Failed to create owner:', createError);
        } else {
            console.log('Owner created successfully:', newOwner);
        }
    }
};

run();
