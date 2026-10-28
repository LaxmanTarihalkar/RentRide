import dotenv from 'dotenv';
dotenv.config();

console.log('--- ENV CHECK ---');
console.log('JWT_SECRET exists:', !!process.env.JWT_SECRET);
if (process.env.JWT_SECRET) console.log('JWT_SECRET length:', process.env.JWT_SECRET.length);
console.log('SMTP_PASS:', process.env.SMTP_PASS);
