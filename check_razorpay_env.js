import dotenv from 'dotenv';
dotenv.config();

const key = process.env.VITE_RAZORPAY_KEY;
const secret = process.env.RAZORPAY_SECRET;

console.log('--- RAZORPAY CREDENTIALS CHECK ---');
console.log('Key loaded:', key ? 'YES (starts with ' + key.substring(0, 8) + ')' : 'NO');
console.log('Secret loaded:', secret ? 'YES (length: ' + secret.length + ')' : 'NO');

if (key && secret) {
    if (secret.includes(key.replace('rzp_test_', ''))) {
        console.log('CRITICAL: Secret appears to be the Key suffix. This is WRONG.');
    }
}
