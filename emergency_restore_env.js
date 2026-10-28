import fs from 'fs';

const envContent = `VITE_SUPABASE_URL=https://splgyyhtdplshlrwaesg.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNwbGd5eWh0ZHBsc2hscndhZXNnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY2NTc4NTEsImV4cCI6MjA4MjIzMzg1MX0.TozAqwSwtK_BP_wv_B6qElDCWrgBe7xJISGCwE9TjII
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNwbGd5eWh0ZHBsc2hscndhZXNnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NjY1Nzg1MSwiZXhwIjoyMDgyMjMzODUxfQ.nU-wVjYAtuilZ-mcnsPbHqQhl3LRjEdPCKSzN5rO3Q8

# Razorpay Configuration
VITE_RAZORPAY_KEY=rzp_test_cWwB6tZM64d5e6bYrTq
RAZORPAY_SECRET=LSc11cWwB6tZM64d5e6bYrTq

# Server Port
PORT=3001

# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=noreply.rentride@gmail.com
SMTP_PASS="hmen nqry umti gjxm"

# JWT Secret
JWT_SECRET=699ea4773f120bfc22ed946b47ef164963161f9c851e56209d5b79ad656d23c8

# API URLs
VITE_API_URL=http://localhost:3001
FRONTEND_URL=http://localhost:8080
`;

try {
    fs.writeFileSync('.env', envContent, 'utf8');
    console.log('.env file has been successfully restored.');
} catch (err) {
    console.error('Error writing .env file:', err);
}
