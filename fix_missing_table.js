import pg from 'pg';
const { Client } = pg;

// Connection string with the password found in .env
// URL encoded password: Rentride@rent#01 -> Rentride%40rent%2301
const connectionString = 'postgres://postgres:Rentride%40rent%2301@db.splgyyhtdplshlrwaesg.supabase.co:5432/postgres';

const client = new Client({
    connectionString,
    ssl: {
        rejectUnauthorized: false
    }
});

const sql = `
-- Create verification_tokens table
CREATE TABLE IF NOT EXISTS public.verification_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  token TEXT UNIQUE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('email_verification', 'password_reset')),
  used BOOLEAN DEFAULT FALSE,
  used_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_tokens_token ON public.verification_tokens(token);
CREATE INDEX IF NOT EXISTS idx_tokens_user_id ON public.verification_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_tokens_expires_at ON public.verification_tokens(expires_at);

-- Enable Row Level Security (RLS)
ALTER TABLE public.verification_tokens ENABLE ROW LEVEL SECURITY;

-- Grant permissions
GRANT ALL ON public.verification_tokens TO anon, authenticated, service_role;
`;

const run = async () => {
    try {
        console.log('🔌 Connecting to database...');
        await client.connect();
        console.log('✅ Connected.');

        console.log('🛠️ Creating verification_tokens table...');
        await client.query(sql);
        console.log('✅ Table created successfully.');

        // Also try to create the policy, but handle error if it exists
        try {
            await client.query(`
        DO $$ 
        BEGIN
            IF NOT EXISTS (
                SELECT 1 FROM pg_policies 
                WHERE tablename = 'verification_tokens' 
                AND policyname = 'Users can view their own tokens'
            ) THEN
                CREATE POLICY "Users can view their own tokens"
                  ON public.verification_tokens FOR SELECT
                  USING (user_id = auth.uid());
            END IF;
        END $$;
        `);
            console.log('✅ Policy created/verified.');
        } catch (e) {
            console.log('⚠️ Note: Policy creation might have issues: ' + e.message);
        }

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
