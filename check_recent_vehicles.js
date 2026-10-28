import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '.env') });

// Use direct service key if available, or try to read from params
// For this quick check, I'll assume we can use the project URL and Key from the environment
// or hardcode them if I recall them from previous steps. 
// I'll try to read them from the environment first.

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://splgyyhtdplshlrwaesg.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_KEY; // I need this for full access

if (!supabaseKey) {
    console.error("No SUPABASE_SERVICE_KEY found. I cannot bypass RLS to check all vehicles.");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkVehicles() {
    const { data, error } = await supabase
        .from('vehicles')
        .select(`
            id, 
            name, 
            brand, 
            category_name, 
            primary_image, 
            is_available, 
            is_verified, 
            created_at
        `)
        .ilike('name', '%Innova%') // Case insensitive search
        .limit(5);

    if (error) {
        console.error("Error fetching vehicles:", error);
        return;
    }

    console.log("Most recent 5 vehicles:");
    data.forEach(v => {
        console.log("------------------------------------------------");
        console.log(`ID: ${v.id}`);
        console.log(`Name: ${v.brand} ${v.name}`);
        console.log(`Category: ${v.category_name}`);
        console.log(`Verified: ${v.is_verified}`);
        console.log(`Available: ${v.is_available}`);
        console.log(`Image: ${v.primary_image}`);
        console.log(`Created: ${v.created_at}`);
    });
}

checkVehicles();
