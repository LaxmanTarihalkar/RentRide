
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkOwners() {
    console.log('Checking Users and Owners...');

    // 1. Count Users with role='owner'
    const { data: ownerUsers, error: userError } = await supabase
        .from('users')
        .select('id, email, first_name, last_name, role')
        .eq('role', 'owner');

    if (userError) console.error('User Error:', userError);
    console.log(`Users with role='owner': ${ownerUsers ? ownerUsers.length : 0}`);
    if (ownerUsers?.length) {
        console.log('Sample Owner User:', ownerUsers[0]);
    }

    // 2. Count Owners in owners table
    const { data: ownersData, error: ownerError } = await supabase
        .from('owners')
        .select('*');

    if (ownerError) console.error('Owner Table Error:', ownerError);
    console.log(`Records in 'owners' table: ${ownersData ? ownersData.length : 0}`);
    if (ownersData?.length) {
        console.log('Sample Owner Record:', ownersData[0]);
    } else {
        console.log('Owners table is EMPTY.');
    }

    // 3. Check for mismatches
    if (ownerUsers && ownersData) {
        const ownerUserIds = ownerUsers.map(u => u.id);
        const linkedOwnerIds = ownersData.map(o => o.user_id);

        const missingProfiles = ownerUserIds.filter(id => !linkedOwnerIds.includes(id));
        console.log(`Users with role='owner' but NO 'owners' profile: ${missingProfiles.length}`);
        if (missingProfiles.length > 0) {
            console.log('IDs missing profiles:', missingProfiles);
        }
    }
}

checkOwners();
