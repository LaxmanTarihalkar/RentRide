import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function run() {
    const email = 'sidharthburjiabvk@gmail.com';
    console.log(`--- Finalizing account for ${email} ---`);

    const { data: user } = await supabase.from('users').select('*').eq('email', email).single();
    if (user) {
        await supabase.from('users').update({ email_verified: true }).eq('id', user.id);
        console.log('User email marked as VERIFIED.');
    }
}

run();
