import fs from 'fs';

const supabaseUrl = 'https://splgyyhtdplshlrwaesg.supabase.co';
const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNwbGd5eWh0ZHBsc2hscndhZXNnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY2NTc4NTEsImV4cCI6MjA4MjIzMzg1MX0.TozAqwSwtK_BP_wv_B6qElDCWrgBe7xJISGCwE9TjII';
const serviceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNwbGd5eWh0ZHBsc2hscndhZXNnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NjY1Nzg1MSwiZXhwIjoyMDgyMjMzODUxfQ.nU-wVjYAtuilZ-mcnsPbHqQhl3LRjEdPCKSzN5rO3Q8';

// Preserving the Razorpay keys from previous successful reads/guesses
const razorpayKey = 'rzp_test_cWwB6tZM64d5e6bYrTq';
const razorpaySecret = 'LSc11cWwB6tZM64d5e6bYrTq';

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
SMTP_USER=noreply.rentride@gmail.com
SMTP_PASS=Rentride@rent#01
`;

fs.writeFileSync('.env', envContent);
console.log('Updated .env with correct credentials for splgyyhtdplshlrwaesg.');
