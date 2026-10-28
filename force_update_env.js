import fs from 'fs';
import path from 'path';

const envPath = path.resolve('d:/RentRide/.env');

// Credentials for splgyyhtdplshlrwaesg
const supabaseUrl = 'https://splgyyhtdplshlrwaesg.supabase.co';
const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNwbGd5eWh0ZHBsc2hscndhZXNnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY2NTc4NTEsImV4cCI6MjA4MjIzMzg1MX0.TozAqwSwtK_BP_wv_B6qElDCWrgBe7xJISGCwE9TjII';
const serviceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNwbGd5eWh0ZHBsc2hscndhZXNnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NjY1Nzg1MSwiZXhwIjoyMDgyMjMzODUxfQ.nU-wVjYAtuilZ-mcnsPbHqQhl3LRjEdPCKSzN5rO3Q8';

// Preserving the Razorpay keys
const razorpayKey = 'rzp_test_cWwB6tZM64d5e6bYrTq';
const razorpaySecret = 'LSc11cWwB6tZM64d5e6bYrTq';

// Using the email settings seen in user's snippet (Google App Password)
const smtpUser = 'noreplyrentride@gmail.com';
const smtpPass = 'hmen nqry umti gjxm';

const envContent = `VITE_SUPABASE_URL=${supabaseUrl}
VITE_SUPABASE_ANON_KEY=${anonKey}
SUPABASE_SERVICE_KEY=${serviceKey}

# Razorpay Configuration
VITE_RAZORPAY_KEY=${razorpayKey}
RAZORPAY_SECRET=${razorpaySecret}

# Server Port
PORT=3001

# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=${smtpUser}
SMTP_PASS=${smtpPass}
`;

try {
    if (fs.existsSync(envPath)) {
        console.log('Deleting existing .env file...');
        fs.unlinkSync(envPath);
    }
} catch (err) {
    console.error('Error deleting .env:', err);
}

try {
    console.log('Writing new .env file...');
    fs.writeFileSync(envPath, envContent);
    console.log('✅ .env updated successfully.');
    console.log('New Content Preview:');
    console.log(envContent);
} catch (err) {
    console.error('Error writing .env:', err);
}
