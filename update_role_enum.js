import pg from 'pg';
const { Client } = pg;

// Connection string
const connectionString = 'postgres://postgres:Rentride%40rent%2301@db.splgyyhtdplshlrwaesg.supabase.co:5432/postgres';

const client = new Client({
    connectionString,
    ssl: {
        rejectUnauthorized: false
    }
});

const run = async () => {
    try {
        console.log('🔌 Connecting to database...');
        await client.connect();
        console.log('✅ Connected.');

        console.log('🛠️ Updating users table role constraint...');

        // We need to drop the existing check constraint and add a new one
        // First, let's try to find the constraint name
        const findConstraintSql = `
      SELECT conname
      FROM pg_constraint
      WHERE conrelid = 'public.users'::regclass
      AND contype = 'c'
      AND pg_get_constraintdef(oid) LIKE '%role%';
    `;

        const res = await client.query(findConstraintSql);

        if (res.rows.length > 0) {
            const constraintName = res.rows[0].conname;
            console.log(`Found constraint: ${constraintName}`);

            await client.query(`ALTER TABLE public.users DROP CONSTRAINT "${constraintName}"`);
            console.log('Dropped old constraint.');
        } else {
            console.log('No existing role constraint found (or handled differently).');
        }

        // Add new constraint
        await client.query(`
      ALTER TABLE public.users 
      ADD CONSTRAINT users_role_check 
      CHECK (role IN ('customer', 'admin', 'staff', 'owner', 'user'));
    `);

        console.log('✅ Added new constraint allowing: customer, admin, staff, owner, user');

        await client.end();
        console.log('👋 Done.');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        if (client) await client.end();
        process.exit(1);
    }
};

run();
