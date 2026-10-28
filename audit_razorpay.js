import dotenv from 'dotenv';
dotenv.config();

console.log('--- RAZORPAY ENV AUDIT ---');
console.log('KEY:', process.env.VITE_RAZORPAY_KEY);
console.log('SECRET:', process.env.RAZORPAY_SECRET);
if (process.env.VITE_RAZORPAY_KEY === process.env.RAZORPAY_SECRET) {
    console.log('WARNING: Key and Secret are identical!');
}
if (process.env.RAZORPAY_SECRET && process.env.RAZORPAY_SECRET.includes(process.env.VITE_RAZORPAY_KEY.replace('rzp_test_', ''))) {
    console.log('WARNING: Secret contains the Key suffix. This is likely an error.');
}
