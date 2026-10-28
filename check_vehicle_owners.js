import { supabase } from './server/config/supabase.js';

async function checkVehicleOwners() {
    console.log('🔍 Checking Vehicle - Owner Linkages...\n');

    const { data: vehicles, error } = await supabase
        .from('vehicles')
        .select('id, name, brand, model, owner_id');

    if (error) {
        console.error('Error fetching vehicles:', error);
        return;
    }

    console.log(`Found ${vehicles.length} vehicles.`);

    let orphans = 0;
    vehicles.forEach(v => {
        const hasOwner = !!v.owner_id;
        if (!hasOwner) orphans++;
        console.log(`[${hasOwner ? '✅' : '❌'}] ${v.brand} ${v.model} (ID: ${v.id}) -> Owner ID: ${v.owner_id || 'NULL'}`);
    });

    if (orphans > 0) {
        console.log(`\n⚠️ CRITICAL: ${orphans} vehicles have NO OWNER linked. Revenue cannot be assigned for these!`);
    } else {
        console.log('\n✅ All vehicles have an owner assigned.');
    }
}

checkVehicleOwners();
