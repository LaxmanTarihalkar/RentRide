import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

const categories = [
    { name: 'Sedan', icon: 'Car' },
    { name: 'SUV', icon: 'Mountain' },
    { name: 'Hatchback', icon: 'CarFront' },
    { name: 'Luxury', icon: 'Crown' },
    { name: 'Electric', icon: 'Zap' },
    { name: 'Sports', icon: 'Activity' },
    { name: 'Exotic', icon: 'Sparkles' },
    { name: 'Convertible', icon: 'Sun' },
    { name: 'Minivan', icon: 'Users' }
];

async function run() {
    console.log('--- SEEDING VEHICLE CATEGORIES ---');

    for (const cat of categories) {
        // Check if exists
        const { data: existing } = await supabase
            .from('vehicle_categories')
            .select('id')
            .eq('name', cat.name)
            .single();

        if (!existing) {
            console.log(`Adding category: ${cat.name}`);
            const { error } = await supabase
                .from('vehicle_categories')
                .insert([cat]);
            if (error) console.error(`Failed to add ${cat.name}:`, error.message);
        } else {
            console.log(`Category exists: ${cat.name}`);
        }
    }
    console.log('--- Seeding Complete ---');
}

run();
