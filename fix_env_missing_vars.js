import fs from 'fs';
import path from 'path';

const envPath = path.resolve('d:/RentRide/.env');

// Read existing content
let content = fs.readFileSync(envPath, 'utf8');

// 1. Check/Add JWT_SECRET
if (!content.includes('JWT_SECRET=')) {
    console.log('Adding JWT_SECRET...');
    content += '\nJWT_SECRET=rentride_secure_jwt_secret_key_2024\n';
}

// 2. Fix SMTP_PASS quotes if needed
// The user provided: hmen nqry umti gjxm
// If it is SMTP_PASS=hmen nqry umti gjxm, dotenv might truncate it.
// We want SMTP_PASS="hmen nqry umti gjxm"

if (content.includes('SMTP_PASS=hmen nqry umti gjxm')) {
    console.log('Fixing SMTP_PASS quotes...');
    content = content.replace('SMTP_PASS=hmen nqry umti gjxm', 'SMTP_PASS="hmen nqry umti gjxm"');
}

fs.writeFileSync(envPath, content);
console.log('✅ .env updated: Added JWT_SECRET and fixed SMTP_PASS quotes.');
