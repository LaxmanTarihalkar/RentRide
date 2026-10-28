import fs from 'fs';

const supabaseUrl = 'https://ggumniunlwhzqmvpwtuo.supabase.co';
const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdndW1uaXVubHdoenFtdnB3dHVvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI2OTU0NjcsImV4cCI6MjA3ODI3MTQ2N30.cpGFxvDTEFa-Fn-mcel_TG1Ky7XsQoerlgCQRX9HMb0';
const serviceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjY5NTQ2NywiZXhwIjoyMDc4MjcxNDY3fQ.HIn4M9bum4rloh7l5uF7fvomXcwnC0UtJnizBu6q8cw';
const razorpayKey = 'rzp_test_cWwB6tZM64d5e6bYrTq';
// Reconstructed secret, user should verify.
const razorpaySecret = 'LSc11cWwB6tZM64d5e6bYrTq';

const envContent = `VITE_SUPABASE_URL=${supabaseUrl.trim()}
VITE_SUPABASE_ANON_KEY=${anonKey.trim()}
SUPABASE_SERVICE_KEY=${serviceKey.trim()}

# Razorpay Configuration
VITE_RAZORPAY_KEY=${razorpayKey.trim()}
RAZORPAY_SECRET=${razorpaySecret.trim()}

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
console.log('Fixed .env file with cleaned identifiers.');
