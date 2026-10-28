import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

async function debugOwnerVehicles() {
    console.log('🔍 Debugging Owner-Vehicle associations...');

    // 1. Get all owners
    const { data: owners, error: ownerError } = await supabase
        .from('owners')
        .select('id, owner_name, email');

    if (ownerError) {
        console.error('Error fetching owners:', ownerError);
        return;
    }

    console.log(`Found ${owners.length} owners.`);

    for (const owner of owners) {
        // 2. Count vehicles for each owner
        const { count, error: vehicleError } = await supabase
            .from('vehicles')
            .select('*', { count: 'exact', head: true })
            .eq('owner_id', owner.id);

        if (vehicleError) {
            console.error(`Error fetching vehicles for owner ${owner.owner_name}:`, vehicleError);
            continue;
        }

        console.log(`Owner: ${owner.owner_name} (${owner.id}) - Vehicles: ${count}`);

        // 3. Just in case, check if vehicles exist with NO owner_id or a different owner_id
        if (count === 0) {
            const { data: allVehicles } = await supabase.from('vehicles').select('id, name, owner_id').limit(5);
            console.log('Sample vehicles in DB:', allVehicles);
        }
    }
}

debugOwnerVehicles();
