import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function run() {
    const targetUserId = '21afe54f-1fe9-4f21-8b64-3bdf76e5b7d7';
    console.log(`Checking/Creating owner for User ID: ${targetUserId}`);

    // 1. Get User
    const { data: user, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', targetUserId)
        .single();

    if (userError || !user) {
        console.log('User not found in this database. Attempting to create user record first...');
        // If the user isn't in 'users' table, they shouldn't even have a valid token unless 
        // they are using an old token or a different DB.
        // We'll try to find them by email if we knew it, but we don't.
        return;
    }

    console.log(`Found user: ${user.email}, Role: ${user.role}`);

    // 2. Check Owner
    const { data: owner } = await supabase
        .from('owners')
        .select('*')
        .eq('user_id', targetUserId)
        .single();

    if (owner) {
        console.log('Owner record already exists.');
    } else {
        console.log('Creating owner record...');
        const { data: newOwner, error: createError } = await supabase
            .from('owners')
            .insert({
                user_id: targetUserId,
                owner_name: `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.email.split('@')[0],
                email: user.email,
                wallet_balance: 0,
                rating: 5,
                verified: true
            });

        if (createError) console.error('Error:', createError);
        else console.log('Owner record created successfully!');
    }
}

run();
