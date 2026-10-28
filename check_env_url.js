import fs from 'fs';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envConfig = dotenv.parse(fs.readFileSync(path.join(__dirname, '.env')));

console.log('VITE_SUPABASE_URL:', envConfig.VITE_SUPABASE_URL);
console.log('SUPABASE_SERVICE_KEY length:', envConfig.SUPABASE_SERVICE_KEY ? envConfig.SUPABASE_SERVICE_KEY.length : 'MISSING');
