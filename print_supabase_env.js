import fs from 'fs';
const env = fs.readFileSync('.env', 'utf8');
const lines = env.split('\n');
lines.forEach(line => {
    if (line.includes('VITE_SUPABASE_URL') || line.includes('SUPABASE_SERVICE_KEY')) {
        console.log(line.trim());
    }
});
