import { supabase } from './server/config/supabase.js';

async function debugOwner() {
    const targetOwnerId = '496712ba-b836-4383-b818-4c9a0d311466'; // The ID from previous step
    console.log(`🔍 Debugging Owner: ${targetOwnerId}`);

    // 1. Check Owner Record
    const { data: owner, error: ownerError } = await supabase
        .from('owners')
        .select('*')
        .eq('id', targetOwnerId)
        .single();

    if (ownerError) {
        console.error('❌ Owner fetch failed:', ownerError.message);
    } else {
        console.log('✅ Owner Found:', owner.owner_name, '| Wallet:', owner.wallet_balance);
    }

    // 2. Check Transactions
    const { data: txs, error: txError } = await supabase
        .from('transactions')
        .select('*')
        .eq('owner_id', targetOwnerId);

    if (txError) {
        console.error('❌ Transaction fetch failed:', txError.message);
    } else {
        console.log(`Transactions found: ${txs.length}`);
        txs.forEach(t => console.log(` - ${t.created_at}: ₹${t.amount} (${t.type})`));
    }

    // 3. Test Update (Simulate adding ₹1)
    console.log('\n🧪 Attempting test balance update (+₹1)...');
    const newBalance = (parseFloat(owner?.wallet_balance || 0) + 1);
    const { data: updateData, error: updateError } = await supabase
        .from('owners')
        .update({ wallet_balance: newBalance })
        .eq('id', targetOwnerId)
        .select()
        .single();

    if (updateError) {
        console.error('❌ Update FAILED:', updateError.message);
    } else {
        console.log('✅ Update SUCCESS. New Balance:', updateData.wallet_balance);

        // Revert it
        await supabase.from('owners').update({ wallet_balance: owner.wallet_balance }).eq('id', targetOwnerId);
        console.log('   (Reverted test change)');
    }
}

debugOwner();
