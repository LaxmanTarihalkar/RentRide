import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function inspectTable(tableName) {
    console.log(`\n--- Inspecting ${tableName} ---`);
    const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .limit(1);

    if (error) {
        console.error(`Error fetching from ${tableName}:`, error);
        return;
    }

    if (data && data.length > 0) {
        console.log(`Columns in ${tableName}:`, Object.keys(data[0]).join(', '));
        console.log(`Sample row:`, data[0]);
    } else {
        console.log(`${tableName} is empty.`);
    }
}

async function run() {
    await inspectTable('owners');
    await inspectTable('users');
}

run();
