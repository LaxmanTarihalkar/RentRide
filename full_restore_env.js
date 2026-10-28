import fs from 'fs';
import dotenv from 'dotenv';

// 1. Read existing (possibly truncated) .env to preserve what we can
let existingEnv = {};
try {
    const envContent = fs.readFileSync('.env', 'utf8');
    existingEnv = dotenv.parse(envContent);
} catch (e) {
    console.log('No .env found or error reading it.');
}

// 2. Define the full set of REQUIRED variables
const fullEnv = {
    // Supabase (Preserving user current if possible, otherwise fallback to known good)
    VITE_SUPABASE_URL: existingEnv.VITE_SUPABASE_URL || 'https://ggumniunlwhzqmvpwtuo.supabase.co',
    VITE_SUPABASE_ANON_KEY: existingEnv.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdndW1uaXVubHdoenFtdnB3dHVvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI2OTU0NjcsImV4cCI6MjA3ODI3MTQ2N30.cpGFxvDTEFa-Fn-mcel_TG1Ky7XsQoerlgCQRX9HMb0',
    SUPABASE_SERVICE_KEY: existingEnv.SUPABASE_SERVICE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjY5NTQ2NywiZXhwIjoyMDc4MjcxNDY3fQ.HIn4M9bum4rloh7l5uF7fvomXcwnC0UtJnizBu6q8cw',

    // Auth
    JWT_SECRET: existingEnv.JWT_SECRET || '699ea4773f120bfc22ed946b47ef164963161f9c851e56209d5b79ad656d23c8',

    // Razorpay (Key is likely correct, Secret IS WRONG/CORRUPTED)
    VITE_RAZORPAY_KEY: existingEnv.VITE_RAZORPAY_KEY || 'rzp_test_cWwB6tZM64d5e6bYrTq',
    RAZORPAY_SECRET: 'PLEASE_REPLACE_WITH_CORRECT_SECRET', // Explicit placeholder

    // URLs
    VITE_API_URL: 'http://localhost:3001',
    FRONTEND_URL: 'http://localhost:8080',
    PORT: '3001',

    // Email
    SMTP_HOST: 'smtp.gmail.com',
    SMTP_PORT: '587',
    SMTP_SECURE: 'false',
    SMTP_USER: 'noreply.rentride@gmail.com',
    SMTP_PASS: 'Rentride@rent#01'
};

// 3. Construct file content
const newEnvContent = Object.entries(fullEnv)
    .map(([key, val]) => `${key}=${val}`)
    .join('\n');

fs.writeFileSync('.env', newEnvContent);
console.log('--- ENV RESTORED ---');
console.log('Warning: RAZORPAY_SECRET is currently set to a placeholder.');
console.log('Please update it with the actual secret from your Razorpay Dashboard.');
