import { supabase } from './server/config/supabase.js';

async function verifySchema() {
    console.log('🔍 Verifying Database Schema...');

    // 1. Check Owners table for wallet_balance
    console.log('\nChecking "owners" table...');
    const { data: owners, error: ownerError } = await supabase
        .from('owners')
        .select('id, wallet_balance')
        .limit(1);

    if (ownerError) {
        console.error('❌ Error checking owners:', ownerError.message);
    } else {
        // If column doesn't exist, PostgREST often ignores it in select or errors out.
        // If it succeeds, we check if the returned object HAS the property.
        if (owners.length > 0) {
            if (owners[0].hasOwnProperty('wallet_balance')) {
                console.log('✅ "wallet_balance" column EXISTS in owners table.');
            } else {
                console.error('❌ "wallet_balance" column is MISSING from owners table response.');
            }
        } else {
            console.log('⚠️ Owners table is empty, cannot verify column existence easily.');
        }
    }

    // 2. Check Transactions table
    console.log('\nChecking "transactions" table...');
    const { data: trans, error: transError } = await supabase
        .from('transactions')
        .select('*')
        .limit(1);

    if (transError) {
        console.error('❌ Error checking transactions table:', transError.message);
        if (transError.code === '42P01') {
            console.error('   (This usually means the table does NOT exist)');
        }
    } else {
        console.log('✅ "transactions" table EXISTS.');
    }
}

verifySchema();
