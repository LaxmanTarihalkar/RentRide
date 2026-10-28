import fs from 'fs';
const content = fs.readFileSync('.env', 'utf8');
const lines = content.split('\n').filter(l => l.includes('SUPABASE_URL'));
console.log('LINES:');
lines.forEach(l => console.log(l.trim()));
