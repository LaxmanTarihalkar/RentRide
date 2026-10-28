import { supabase } from './server/config/supabase.js';

async function run() {
    console.log('--- Testing Server Supabase Config ---');
    console.log('URL:', process.env.VITE_SUPABASE_URL);

    const { data, error } = await supabase.from('users').select('count', { count: 'exact', head: true });

    if (error) {
        console.error('Error:', error.message, `(${error.code})`);
        if (error.code === 'PGRST204') {
            console.log('Table "users" not found. This project might be empty or wrong.');
        }
    } else {
        console.log('Table "users" FOUND. Count:', data);
    }

    const { data: ownersData, error: ownersError } = await supabase.from('owners').select('count', { count: 'exact', head: true });
    if (ownersError) {
        console.error('Owners Table Error:', ownersError.message);
    } else {
        console.log('Owners Table FOUND.');
    }
}

run();
