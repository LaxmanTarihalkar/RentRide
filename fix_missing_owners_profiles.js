
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

async function fixOwners() {
    console.log('Fixing missing owner profiles...');

    // 1. Get orphaned owners
    const { data: ownerUsers } = await supabase
        .from('users')
        .select('*')
        .eq('role', 'owner');

    if (!ownerUsers) return;

    for (const user of ownerUsers) {
        // Check if profile exists
        const { data: existingProfile } = await supabase
            .from('owners')
            .select('id')
            .eq('user_id', user.id)
            .single();

        if (!existingProfile) {
            console.log(`Creating profile for ${user.email}...`);

            const { error } = await supabase.from('owners').insert([
                {
                    user_id: user.id,
                    owner_name: `${user.first_name} ${user.last_name}`,
                    email: user.email,
                    phone: user.phone || 'N/A',
                    business_type: 'individual',
                    business_name: `${user.first_name}'s Rentals`,
                    address: 'Not Provided',
                    city: 'Not Provided',
                    state: 'Not Provided',
                    pincode: '000000',
                    verification_status: 'pending',
                    created_at: new Date().toISOString()
                }
            ]);

            if (error) {
                console.error(`Failed to create profile for ${user.email}:`, error.message);
            } else {
                console.log(`✅ Profile created for ${user.email}`);
            }
        } else {
            console.log(`Profile already exists for ${user.email}`);
        }
    }
}

fixOwners();
