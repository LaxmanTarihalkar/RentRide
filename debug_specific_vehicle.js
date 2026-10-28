import { supabase } from './server/config/supabase.js';

async function checkVehicle() {
    console.log('Searching for vehicle with specific coordinates in specifications...');

    // Try to find a vehicle where specifications contains the lat/long mentioned
    // Using a broader search since exact float matching in JSONB can be tricky
    const { data: vehicles, error } = await supabase
        .from('vehicles')
        .select('id, name, brand, model, latitude, longitude, specifications');

    if (error) {
        console.error('Error:', error);
        return;
    }

    const target = vehicles.find(v => {
        const specs = v.specifications || {};
        // Check vaguely near the user's provided coordinates
        return specs.latitude && Math.abs(specs.latitude - 15.837) < 0.01;
    });

    if (target) {
        console.log('Found Vehicle:', target.brand, target.model);
        console.log('ID:', target.id);
        console.log('Top-level Latitude:', target.latitude);
        console.log('Top-level Longitude:', target.longitude);
        console.log('Specifications:', JSON.stringify(target.specifications, null, 2));

        if (!target.latitude) {
            console.log('❌ ISSUE DETECTED: Top-level coordinates are missing!');
        }
    } else {
        console.log('Could not find vehicle matching those coordinates in specifications.');

        // List all just to see
        console.log('Listing all vehicles with missing top-level coords:');
        vehicles.filter(v => !v.latitude).forEach(v => {
            console.log(`- ${v.brand} ${v.model} (Specs: ${JSON.stringify(v.specifications).substr(0, 50)}...)`);
        });
    }
}

checkVehicle();
